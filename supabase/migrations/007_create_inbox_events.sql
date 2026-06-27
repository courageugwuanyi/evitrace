-- 007_create_inbox_events.sql
-- Auto-captured integration events awaiting engineer review and mapping.
-- No updated_at — rows are either present or deleted; no partial updates.

CREATE TABLE IF NOT EXISTS inbox_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source     TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  suggestion TEXT[]      NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE inbox_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own inbox events"
  ON inbox_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inbox events"
  ON inbox_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inbox events"
  ON inbox_events FOR DELETE
  USING (auth.uid() = user_id);
