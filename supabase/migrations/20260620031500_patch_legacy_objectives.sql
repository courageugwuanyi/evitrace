-- 20260620031500_patch_legacy_objectives.sql
-- Patches legacy objectives tables in environments where objectives already
-- existed before 004_create_objectives.sql was introduced.
--
-- Needed so seed migration can safely insert objectives rows that include
-- competency/due/status/success_criteria/is_archived.

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
