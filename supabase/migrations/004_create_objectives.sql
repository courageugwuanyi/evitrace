-- 004_create_objectives.sql
-- SMART objectives with nested success criteria stored as JSONB.

CREATE TABLE IF NOT EXISTS objectives (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  competency       TEXT        NOT NULL,
  due              DATE        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'Pending Approval'
                               CHECK (status IN ('Pending Approval', 'In Progress', 'Completed')),
  statement        TEXT,
  date_authored    DATE,
  specific         TEXT,
  measurable       TEXT,
  achievable       TEXT,
  relevant         TEXT,
  timebound        TEXT,
  links            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  notes            TEXT,
  success_criteria JSONB       NOT NULL DEFAULT '{}'::jsonb,
  is_archived      BOOLEAN     NOT NULL DEFAULT false,
  archived_date    DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own objectives"
  ON objectives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own objectives"
  ON objectives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own objectives"
  ON objectives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own objectives"
  ON objectives FOR DELETE
  USING (auth.uid() = user_id);

-- Index for Kanban-column queries
CREATE INDEX IF NOT EXISTS idx_objectives_user_archived_status
  ON objectives (user_id, is_archived, status);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER objectives_set_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
