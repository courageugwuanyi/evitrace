-- 006_create_feedback.sql
-- 360 feedback entries from managers, peers, and skip-level reviewers.

CREATE TABLE IF NOT EXISTS feedback (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  provider   TEXT        NOT NULL,
  type       TEXT        NOT NULL
             CHECK (type IN ('Manager Requested', 'Ad-hoc', 'Peer Review')),
  notes      TEXT        NOT NULL DEFAULT '',
  anonymous  BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for primary list query ordered by date
CREATE INDEX IF NOT EXISTS idx_feedback_user_date
  ON feedback (user_id, date DESC);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER feedback_set_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
