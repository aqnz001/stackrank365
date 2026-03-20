-- Migration: Open to Work flag + Pro tier on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS open_to_work_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
    CHECK (tier IN ('free', 'pro', 'recruiter')),
  ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_open_to_work
  ON profiles (open_to_work) WHERE open_to_work = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_tier
  ON profiles (tier);