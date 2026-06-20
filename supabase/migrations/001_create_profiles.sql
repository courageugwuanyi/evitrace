-- 001_create_profiles.sql
-- User profile data, 1:1 with auth.users.

CREATE TABLE IF NOT EXISTS profiles (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  current_level  TEXT        NOT NULL,
  target_level   TEXT        NOT NULL,
  team           TEXT        NOT NULL,
  manager        TEXT        NOT NULL,
  manager_email  TEXT        NOT NULL,
  skip_level     TEXT,
  avatar_url     TEXT,
  job_title      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
