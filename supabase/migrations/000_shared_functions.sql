-- 000_shared_functions.sql
-- Shared PostgreSQL utility functions reused across all tables.
-- This must be run before any migration that references set_updated_at().

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
