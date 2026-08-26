-- Bakás Core PostGIS Spatial Schema & Dynamic TTL Engine
-- Optimized for Supabase PostgreSQL with PostGIS Geography indexing

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enumerated Types
DO $$ BEGIN
  CREATE TYPE hazard_category AS ENUM (
    'pothole',
    'clogged_drainage',
    'road_obstruction',
    'dark_street'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hazard_severity AS ENUM (
    'low',
    'medium',
    'high'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE validation_action_type AS ENUM (
    'upvote',
    'resolve'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Core Hazards Table
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

-- 4. Spatial & Operational Indexes
CREATE INDEX IF NOT EXISTS idx_hazards_location ON public.hazards USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hazards_expires_at ON public.hazards (expires_at);
CREATE INDEX IF NOT EXISTS idx_hazards_category ON public.hazards (category);
CREATE INDEX IF NOT EXISTS idx_hazards_created_at ON public.hazards (created_at DESC);

-- 5. Hazard Validations Audit Table (Anti-Spam Device Deduplication)
CREATE TABLE IF NOT EXISTS public.hazard_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id UUID NOT NULL REFERENCES public.hazards(id) ON DELETE CASCADE,
  action_type validation_action_type NOT NULL,
  device_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hazard_device_action UNIQUE (hazard_id, device_hash, action_type)
);

CREATE INDEX IF NOT EXISTS idx_validations_hazard ON public.hazard_validations(hazard_id);
CREATE INDEX IF NOT EXISTS idx_validations_device ON public.hazard_validations(device_hash);

-- 6. Row Level Security (RLS) - Anonymous Civic Access
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public anonymous select active hazards" ON public.hazards;
CREATE POLICY "Public anonymous select active hazards"
  ON public.hazards
  FOR SELECT
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "Public anonymous insert hazards" ON public.hazards;
CREATE POLICY "Public anonymous insert hazards"
  ON public.hazards
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public anonymous update hazards" ON public.hazards;
CREATE POLICY "Public anonymous update hazards"
  ON public.hazards
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Public anonymous insert validations" ON public.hazard_validations;
CREATE POLICY "Public anonymous insert validations"
  ON public.hazard_validations
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public anonymous select validations" ON public.hazard_validations;
CREATE POLICY "Public anonymous select validations"
  ON public.hazard_validations
  FOR SELECT
  USING (true);

-- 7. Stored Procedure: Get Hazards within Radius (meters) using ST_DWithin
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

-- 8. Stored Procedure: Upvote Hazard with Philippine-Tuned Dynamic TTL Extension
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
  -- 1. Anti-Spam: Check if device already upvoted
  IF EXISTS (
    SELECT 1 FROM public.hazard_validations
    WHERE hazard_id = target_hazard_id AND device_hash = voter_device_hash AND action_type = 'upvote'
  ) THEN
    RAISE EXCEPTION 'Device already upvoted this hazard.';
  END IF;

  -- 2. Fetch target hazard
  SELECT * INTO target_rec FROM public.hazards WHERE id = target_hazard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hazard not found or expired.';
  END IF;

  -- 3. Philippine Road Reality TTL Extensions
  CASE target_rec.category
    WHEN 'road_obstruction' THEN
      bonus_interval := INTERVAL '2 days';
      max_interval := INTERVAL '14 days';
    WHEN 'clogged_drainage' THEN
      bonus_interval := INTERVAL '7 days';
      max_interval := INTERVAL '30 days';
    WHEN 'dark_street' THEN
      bonus_interval := INTERVAL '7 days';
      max_interval := INTERVAL '60 days';
    WHEN 'pothole' THEN
      bonus_interval := INTERVAL '14 days';
      max_interval := INTERVAL '90 days';
  END CASE;

  -- 4. Calculate bounded expiry from now or current expiry
  new_expiry := LEAST(GREATEST(target_rec.expires_at, NOW()) + bonus_interval, target_rec.created_at + max_interval);

  -- 5. Update hazard record
  UPDATE public.hazards
  SET
    upvotes = upvotes + 1,
    expires_at = new_expiry,
    updated_at = NOW()
  WHERE id = target_hazard_id
  RETURNING * INTO target_rec;

  -- 6. Insert audit record
  INSERT INTO public.hazard_validations (hazard_id, action_type, device_hash)
  VALUES (target_hazard_id, 'upvote', voter_device_hash);

  RETURN to_jsonb(target_rec);
END;
$$;

-- 9. Stored Procedure: Mark Resolved / Fixed (3-Vote Community Consensus)
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
  new_resolved_count INT;
  is_now_resolved BOOLEAN;
  new_expiry TIMESTAMPTZ;
BEGIN
  -- 1. Anti-Spam: Check if device already voted resolve
  IF EXISTS (
    SELECT 1 FROM public.hazard_validations
    WHERE hazard_id = target_hazard_id AND device_hash = resolver_device_hash AND action_type = 'resolve'
  ) THEN
    RAISE EXCEPTION 'Device already voted to resolve this hazard.';
  END IF;

  -- 2. Fetch target hazard
  SELECT * INTO target_rec FROM public.hazards WHERE id = target_hazard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hazard not found or expired.';
  END IF;

  -- 3. Calculate 3-vote resolution consensus
  new_resolved_count := target_rec.resolved_count + 1;
  is_now_resolved := (new_resolved_count >= 3);

  -- 4. If community consensus reached, fade pin over 2 hours
  IF is_now_resolved THEN
    new_expiry := LEAST(target_rec.expires_at, NOW() + INTERVAL '2 hours');
  ELSE
    new_expiry := target_rec.expires_at;
  END IF;

  -- 5. Update hazard record
  UPDATE public.hazards
  SET
    resolved_count = new_resolved_count,
    is_resolved = is_now_resolved,
    expires_at = new_expiry,
    updated_at = NOW()
  WHERE id = target_hazard_id
  RETURNING * INTO target_rec;

  -- 6. Record audit validation
  INSERT INTO public.hazard_validations (hazard_id, action_type, device_hash)
  VALUES (target_hazard_id, 'resolve', resolver_device_hash);

  RETURN to_jsonb(target_rec);
END;
$$;
