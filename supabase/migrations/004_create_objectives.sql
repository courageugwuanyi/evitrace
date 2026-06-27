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

-- Backfill legacy objectives tables that may predate this schema.
-- This keeps environments with an existing objectives table compatible with
-- the seed and app query contract.
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS competency TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS due DATE;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS statement TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS date_authored DATE;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS specific TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS measurable TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS achievable TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS relevant TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS timebound TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS links JSONB;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS success_criteria JSONB;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS is_archived BOOLEAN;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS archived_date DATE;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE objectives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE objectives
  ALTER COLUMN competency SET DEFAULT '',
  ALTER COLUMN due SET DEFAULT CURRENT_DATE,
  ALTER COLUMN status SET DEFAULT 'Pending Approval',
  ALTER COLUMN links SET DEFAULT '[]'::jsonb,
  ALTER COLUMN success_criteria SET DEFAULT '{}'::jsonb,
  ALTER COLUMN is_archived SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure existing rows satisfy new NOT NULL/default expectations.
UPDATE objectives
SET
  competency = COALESCE(competency, ''),
  due = COALESCE(due, CURRENT_DATE),
  status = COALESCE(status, 'Pending Approval'),
  links = COALESCE(links, '[]'::jsonb),
  success_criteria = COALESCE(success_criteria, '{}'::jsonb),
  is_archived = COALESCE(is_archived, false),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE
  competency IS NULL
  OR due IS NULL
  OR status IS NULL
  OR links IS NULL
  OR success_criteria IS NULL
  OR is_archived IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

ALTER TABLE objectives
  ALTER COLUMN competency SET NOT NULL,
  ALTER COLUMN due SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN links SET NOT NULL,
  ALTER COLUMN success_criteria SET NOT NULL,
  ALTER COLUMN is_archived SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'objectives_status_check'
      AND conrelid = 'objectives'::regclass
  ) THEN
    ALTER TABLE objectives
      ADD CONSTRAINT objectives_status_check
      CHECK (status IN ('Pending Approval', 'In Progress', 'Completed'));
  END IF;
END $$;

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
