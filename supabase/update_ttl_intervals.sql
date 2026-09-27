-- ==============================================================================
-- Migration: Calibrated Real-World Road Hazard TTL Intervals (Philippine Urban Reality)
-- MMDA / DPWH / LGU response benchmarks
-- ==============================================================================

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
  -- Road Obstruction: Towed or cleared in 1-8h (+4h bonus, 24h max)
  -- Clogged Drainage / Flood: Recedes in 2-8h (+6h bonus, 36h max)
  -- Dark Street: Streetlight maintenance in 2-5 days (+12h bonus, 5d max)
  -- Pothole: Asphalt patching in 3-7 days (+1d bonus, 7d max)
  CASE target_rec.category
    WHEN 'road_obstruction' THEN
      bonus_interval := INTERVAL '4 hours';
      max_interval := INTERVAL '24 hours';
    WHEN 'clogged_drainage' THEN
      bonus_interval := INTERVAL '6 hours';
      max_interval := INTERVAL '36 hours';
    WHEN 'dark_street' THEN
      bonus_interval := INTERVAL '12 hours';
      max_interval := INTERVAL '5 days';
    WHEN 'pothole' THEN
      bonus_interval := INTERVAL '1 day';
      max_interval := INTERVAL '7 days';
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
