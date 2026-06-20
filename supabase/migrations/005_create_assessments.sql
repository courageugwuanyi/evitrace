-- 005_create_assessments.sql
-- Assessment sessions, categories, and per-question scoring.
-- Three tables: assessments -> assessment_categories -> assessment_questions

-- ── assessments ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessments (
  id                      TEXT        PRIMARY KEY,
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_completed          TIMESTAMPTZ NOT NULL,
  review_period           TEXT        NOT NULL,
  status                  TEXT        NOT NULL DEFAULT 'Draft'
                                      CHECK (status IN ('Finalized', 'Draft', 'In Review')),
  engineer_name           TEXT        NOT NULL,
  manager_name            TEXT        NOT NULL,
  overall_readiness_score INTEGER     NOT NULL DEFAULT 0
                                      CHECK (overall_readiness_score BETWEEN 0 AND 100),
  one_on_one_topics       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own assessments"
  ON assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER assessments_set_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── assessment_categories ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessment_categories (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id        TEXT        NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id          TEXT        NOT NULL,
  category_name        TEXT        NOT NULL,
  summary              TEXT        NOT NULL DEFAULT '',
  category_current_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  category_target      NUMERIC(3,2) NOT NULL DEFAULT 4,
  sort_order           INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own assessment_categories"
  ON assessment_categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment_categories"
  ON assessment_categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment_categories"
  ON assessment_categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessment_categories"
  ON assessment_categories FOR DELETE USING (auth.uid() = user_id);

-- ── assessment_questions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessment_questions (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id          UUID    NOT NULL REFERENCES assessment_categories(id) ON DELETE CASCADE,
  assessment_id        TEXT    NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id              UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id          TEXT    NOT NULL,
  question_text        TEXT    NOT NULL,
  previous_score       INTEGER NOT NULL CHECK (previous_score BETWEEN 1 AND 5),
  current_score        INTEGER NOT NULL CHECK (current_score BETWEEN 1 AND 5),
  target_score         INTEGER NOT NULL DEFAULT 4 CHECK (target_score BETWEEN 1 AND 5),
  justification        TEXT    NOT NULL DEFAULT '',
  attached_evidence_ids UUID[] NOT NULL DEFAULT '{}',
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own assessment_questions"
  ON assessment_questions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment_questions"
  ON assessment_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment_questions"
  ON assessment_questions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessment_questions"
  ON assessment_questions FOR DELETE USING (auth.uid() = user_id);
