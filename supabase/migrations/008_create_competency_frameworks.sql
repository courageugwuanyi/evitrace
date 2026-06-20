-- 008_create_competency_frameworks.sql
-- Custom competency framework definitions uploaded by the user.

-- ── competency_frameworks ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competency_frameworks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  version    TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE competency_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own frameworks"
  ON competency_frameworks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frameworks"
  ON competency_frameworks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own frameworks"
  ON competency_frameworks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own frameworks"
  ON competency_frameworks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER competency_frameworks_set_updated_at
  BEFORE UPDATE ON competency_frameworks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── competency_categories ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competency_categories (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID         NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  weight       NUMERIC(4,2) NOT NULL DEFAULT 1,
  questions    TEXT[]       NOT NULL DEFAULT '{}',
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE competency_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own competency_categories"
  ON competency_categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competency_categories"
  ON competency_categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competency_categories"
  ON competency_categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competency_categories"
  ON competency_categories FOR DELETE USING (auth.uid() = user_id);
