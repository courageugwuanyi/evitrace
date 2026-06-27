-- 003_create_evidence.sql
-- Evidence records logged by engineers.

CREATE TABLE IF NOT EXISTS evidence (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL,
  source        TEXT        NOT NULL,
  category      TEXT        NOT NULL,
  competency    TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  link          TEXT        NOT NULL DEFAULT '',
  status        TEXT        NOT NULL DEFAULT 'Pending Review'
                            CHECK (status IN ('Pending Review', 'Reviewed')),
  match_state   TEXT        NOT NULL DEFAULT 'Unset'
                            CHECK (match_state IN ('Yes', 'No', 'Somewhat', 'Unset')),
  manager_notes TEXT        NOT NULL DEFAULT '',
  is_archived   BOOLEAN     NOT NULL DEFAULT false,
  archived_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own evidence"
  ON evidence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evidence"
  ON evidence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence"
  ON evidence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence"
  ON evidence FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for primary list and count queries
CREATE INDEX IF NOT EXISTS idx_evidence_user_archived_date
  ON evidence (user_id, is_archived, date DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_user_status
  ON evidence (user_id, status);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER evidence_set_updated_at
  BEFORE UPDATE ON evidence
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
