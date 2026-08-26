-- ==============================================================================
-- BAKÁS: URBAN ROAD HAZARD RADAR — MASTER DATABASE SCHEMA & STORED PROCEDURES
-- ==============================================================================
-- Target: Supabase PostgreSQL with PostGIS extension
-- Scope: Spatial Indexing, Anonymous RLS, Dynamic TTL Decay, Anti-Spam Voting, Golden Seeds
-- ==============================================================================

-- 1. Enable PostGIS & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hazard_category') THEN
    CREATE TYPE hazard_category AS ENUM (
      'pothole',
      'clogged_drainage',
      'road_obstruction',
      'dark_street'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hazard_severity') THEN
    CREATE TYPE hazard_severity AS ENUM (
      'low',
      'medium',
      'high'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validation_action_type') THEN
    CREATE TYPE validation_action_type AS ENUM (
      'upvote',
      'resolve'
    );
  END IF;
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

-- 4. High-Performance Spatial & Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_hazards_location ON public.hazards USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hazards_expires_at ON public.hazards (expires_at);
CREATE INDEX IF NOT EXISTS idx_hazards_category ON public.hazards (category);
CREATE INDEX IF NOT EXISTS idx_hazards_created_at ON public.hazards (created_at DESC);

-- 5. Hazard Validations Table (Audit trail & device deduplication)
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

-- 6. Row Level Security (RLS) - Zero-Login Civic Policy
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_validations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if updating
DROP POLICY IF EXISTS "Public anonymous select active hazards" ON public.hazards;
DROP POLICY IF EXISTS "Public anonymous insert hazards" ON public.hazards;
DROP POLICY IF EXISTS "Public anonymous select validations" ON public.hazard_validations;
DROP POLICY IF EXISTS "Public anonymous insert validations" ON public.hazard_validations;

-- Allow anonymous public reads on active hazards
CREATE POLICY "Public anonymous select active hazards"
  ON public.hazards
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > NOW());

-- Allow anonymous public inserts
CREATE POLICY "Public anonymous insert hazards"
  ON public.hazards
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous validation reads & inserts
CREATE POLICY "Public anonymous select validations"
  ON public.hazard_validations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public anonymous insert validations"
  ON public.hazard_validations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 7. Stored Procedure: Get Hazards within Radius (5km PostGIS Query)
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
SECURITY DEFINER
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

-- 8. Stored Procedure: Upvote Hazard with Category-bounded TTL Extension
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

  -- 3. Calculate category TTL extension bonus and cap
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

  -- 4. Calculate bounded expiry
  new_expiry := LEAST(target_rec.expires_at + bonus_interval, target_rec.created_at + max_interval);

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

-- 9. Stored Procedure: Mark Cleared / Resolved with 3-Vote Soft Decay
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
BEGIN
  -- 1. Fetch target hazard
  SELECT * INTO target_rec FROM public.hazards WHERE id = target_hazard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hazard not found.';
  END IF;

  -- 2. Record validation (deduplicated by unique constraint)
  INSERT INTO public.hazard_validations (hazard_id, action_type, device_hash)
  VALUES (target_hazard_id, 'resolve', resolver_device_hash)
  ON CONFLICT (hazard_id, device_hash, action_type) DO NOTHING;

  -- 3. Count distinct resolution votes
  SELECT COUNT(*) INTO new_resolved_count
  FROM public.hazard_validations
  WHERE hazard_id = target_hazard_id AND action_type = 'resolve';

  -- 4. If 3 or more users marked resolved, trigger soft resolution & 2-hour decay
  UPDATE public.hazards
  SET
    resolved_count = new_resolved_count,
    is_resolved = (new_resolved_count >= 3),
    expires_at = CASE WHEN new_resolved_count >= 3 THEN LEAST(expires_at, NOW() + INTERVAL '2 hours') ELSE expires_at END,
    updated_at = NOW()
  WHERE id = target_hazard_id
  RETURNING * INTO target_rec;

  RETURN to_jsonb(target_rec);
END;
$$;

-- 10. Maintenance Procedure: Purge Expired Hazards (Can be scheduled via pg_cron)
CREATE OR REPLACE FUNCTION public.purge_expired_hazards()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.hazards
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 11. Initial Golden Fixtures Seed Data (Metro Manila Corridors)
INSERT INTO public.hazards (id, category, severity, location, lat, lng, title, description, address, upvotes, expires_at, created_at)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'pothole',
    'high',
    ST_SetSRID(ST_MakePoint(121.0545, 14.5839), 4326)::geography,
    14.5839,
    121.0545,
    'Deep Crater Pothole (EDSA Ortigas)',
    'Deep rim-bending pothole on the inner northbound lane after Ortigas flyover.',
    'EDSA Northbound, near Ortigas Ave Flyover, Mandaluyong',
    18,
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    'clogged_drainage',
    'high',
    ST_SetSRID(ST_MakePoint(120.9897, 14.6074), 4326)::geography,
    14.6074,
    120.9897,
    'Severe Gutter Flood & Clogged Inlets',
    'Submerged sidewalk and knee-deep gutter flooding obscuring open curb inlets.',
    'España Blvd cor. P. Noval St, Sampaloc, Manila',
    24,
    NOW() + INTERVAL '40 hours',
    NOW() - INTERVAL '8 hours'
  ),
  (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'dark_street',
    'medium',
    ST_SetSRID(ST_MakePoint(121.0743, 14.6492), 4326)::geography,
    14.6492,
    121.0743,
    'Unlit Service Road & Broken Lampposts',
    'Series of 5 non-functional streetlights creating complete blackout corridor for cyclists.',
    'Katipunan Ave Service Rd, Loyola Heights, Quezon City',
    9,
    NOW() + INTERVAL '52 hours',
    NOW() - INTERVAL '20 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'road_obstruction',
    'medium',
    ST_SetSRID(ST_MakePoint(121.0664, 14.5678), 4326)::geography,
    14.5678,
    121.0664,
    'Fallen Construction Scaffold & Gravel',
    'Fallen metal brackets and loose gravel spilled onto the rightmost motorcycle lane.',
    'C-5 Road Southbound, near Bagong Ilog Overpass, Pasig',
    7,
    NOW() + INTERVAL '20 hours',
    NOW() - INTERVAL '4 hours'
  ),
  (
    'e3b0c442-98fc-1c14-9afb-f4c8996fb924',
    'pothole',
    'high',
    ST_SetSRID(ST_MakePoint(120.9835, 14.5985), 4326)::geography,
    14.5985,
    120.9835,
    'Open Sewer Grate / Missing Manhole Lid',
    'Coverless manhole trap marked only with a tree branch in center lane.',
    'Taft Ave cor. Ayala Blvd, Ermita, Manila',
    31,
    NOW() + INTERVAL '6 days',
    NOW() - INTERVAL '14 hours'
  )
ON CONFLICT (id) DO NOTHING;
