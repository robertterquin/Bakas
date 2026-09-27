-- Bakas Testing Data Cleanup Script
-- Run this in your Supabase SQL Editor to wipe out all testing hazards and start with a 100% clean database slate:

TRUNCATE TABLE public.hazard_validations, public.hazard_passability_votes, public.hazards CASCADE;
