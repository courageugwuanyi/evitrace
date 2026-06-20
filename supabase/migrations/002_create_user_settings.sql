-- 002_create_user_settings.sql
-- Notification preferences and integration toggles, 1:1 with auth.users.

CREATE TABLE IF NOT EXISTS user_settings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications JSONB       NOT NULL DEFAULT '{"dailyReminder":true,"managerApprovals":true,"weeklyDigest":false,"browserPush":true}'::jsonb,
  integrations  JSONB       NOT NULL DEFAULT '{"autoCaptureEvents":true,"jira":true,"github":true,"bitbucket":false,"slack":false,"teams":false,"confluence":false,"notion":false}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER user_settings_set_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
