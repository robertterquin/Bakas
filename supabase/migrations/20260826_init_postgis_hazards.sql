-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Hazard Categories and Severity Enums
CREATE TYPE hazard_category AS ENUM (
  'pothole',
  'clogged_drainage',
  'road_obstruction',
  'dark_street'
);

CREATE TYPE hazard_severity AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE validation_action_type AS ENUM (
  'upvote',
  'resolve'
);

-- 2. Core Hazards Table
CREATE TABLE IF NOT EXISTS public.hazards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category hazard_category NOT NULL,
  severity hazard_severity NOT NULL DEFAULT 'medium',
  location GEOGRAPHY(Point, 4326) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  title TEXT,
  description TEXT,
  address TEXT,
  upvotes INTEGER NOT NULL DEFAULT 1,
  resolved_count INTEGER NOT NULL DEFAULT 0,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial GIST Index for Sub-10ms 5km Radius Queries
CREATE INDEX IF NOT EXISTS idx_hazards_location ON public.hazards USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hazards_expires_at ON public.hazards (expires_at);
CREATE INDEX IF NOT EXISTS idx_hazards_category ON public.hazards (category);

-- 3. Hazard Validations Table (Audit trail & device deduplication)
CREATE TABLE IF NOT EXISTS public.hazard_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id UUID NOT NULL REFERENCES public.hazards(id) ON DELETE CASCADE,
  action_type validation_action_type NOT NULL,
  device_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hazard_device_action UNIQUE (hazard_id, device_hash, action_type)
);

CREATE INDEX IF NOT EXISTS idx_validations_hazard ON public.hazard_validations(hazard_id);

-- 4. Row Level Security (RLS) - Anonymous Civic Access
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_validations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public reads on non-expired hazards
CREATE POLICY "Public anonymous select active hazards"
  ON public.hazards
  FOR SELECT
  USING (expires_at > NOW() AND (is_resolved = FALSE OR expires_at > NOW()));

-- Allow anonymous public inserts
CREATE POLICY "Public anonymous insert hazards"
  ON public.hazards
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous validation inserts
CREATE POLICY "Public anonymous insert validations"
  ON public.hazard_validations
  FOR INSERT
  WITH CHECK (true);

-- 5. Stored Procedure: Get Hazards within Radius (meters)
CREATE OR REPLACE FUNCTION public.get_hazards_in_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  category hazard_category,
  severity hazard_severity,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  title TEXT,
  description TEXT,
  address TEXT,
  upvotes INTEGER,
  resolved_count INTEGER,
  is_resolved BOOLEAN,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    h.id,
    h.category,
    h.severity,
    h.lat,
    h.lng,
    h.title,
    h.description,
    h.address,
    h.upvotes,
    h.resolved_count,
    h.is_resolved,
    h.expires_at,
    h.created_at,
    ST_Distance(h.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) AS distance_meters
  FROM public.hazards h
  WHERE
    h.expires_at > NOW()
    AND ST_DWithin(h.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
  ORDER BY h.created_at DESC;
$$;

-- 6. Stored Procedure: Upvote Hazard with TTL Bonus
CREATE OR REPLACE FUNCTION public.upvote_hazard(
  target_hazard_id UUID,
  voter_device_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_rec RECORD;
  bonus_interval INTERVAL;
  max_interval INTERVAL;
  new_expiry TIMESTAMPTZ;
BEGIN
  -- Check duplicate vote
  IF EXISTS (
    SELECT 1 FROM public.hazard_validations
    WHERE hazard_id = target_hazard_id AND device_hash = voter_device_hash AND action_type = 'upvote'
  ) THEN
    RAISE EXCEPTION 'Device already upvoted this hazard.';
  END IF;

  -- Fetch target hazard
  SELECT * INTO target_rec FROM public.hazards WHERE id = target_hazard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hazard not found.';
  END IF;

  -- Determine category TTL extension bonuses & max caps
  CASE target_rec.category
    WHEN 'road_obstruction' THEN
      bonus_interval := INTERVAL '12 hours';
      max_interval := INTERVAL '48 hours';
    WHEN 'clogged_drainage' THEN
      bonus_interval := INTERVAL '24 hours';
      max_interval := INTERVAL '5 days';
    WHEN 'dark_street' THEN
      bonus_interval := INTERVAL '24 hours';
      max_interval := INTERVAL '7 days';
    WHEN 'pothole' THEN
      bonus_interval := INTERVAL '48 hours';
      max_interval := INTERVAL '30 days';
  END CASE;

  -- Calculate bounded new expiry
  new_expiry := LEAST(target_rec.expires_at + bonus_interval, target_rec.created_at + max_interval);

  -- Update hazard
  UPDATE public.hazards
  SET
    upvotes = upvotes + 1,
    expires_at = new_expiry,
    updated_at = NOW()
  WHERE id = target_hazard_id
  RETURNING * INTO target_rec;

  -- Record validation
  INSERT INTO public.hazard_validations (hazard_id, action_type, device_hash)
  VALUES (target_hazard_id, 'upvote', voter_device_hash);

  RETURN to_jsonb(target_rec);
END;
$$;

-- 7. Stored Procedure: Mark Resolved / Cleared
CREATE OR REPLACE FUNCTION public.resolve_hazard(
  target_hazard_id UUID,
  resolver_device_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_rec RECORD;
BEGIN
  -- Fetch target hazard
  SELECT * INTO target_rec FROM public.hazards WHERE id = target_hazard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hazard not found.';
  END IF;

  -- Record validation
  INSERT INTO public.hazard_validations (hazard_id, action_type, device_hash)
  VALUES (target_hazard_id, 'resolve', resolver_device_hash)
  ON CONFLICT (hazard_id, device_hash, action_type) DO NOTHING;

  -- Increment resolved counter
  UPDATE public.hazards
  SET
    resolved_count = resolved_count + 1,
    is_resolved = CASE WHEN resolved_count + 1 >= 3 THEN TRUE ELSE is_resolved END,
    expires_at = CASE WHEN resolved_count + 1 >= 3 THEN LEAST(expires_at, NOW() + INTERVAL '2 hours') ELSE expires_at END,
    updated_at = NOW()
  WHERE id = target_hazard_id
  RETURNING * INTO target_rec;

  RETURN to_jsonb(target_rec);
END;
$$;
