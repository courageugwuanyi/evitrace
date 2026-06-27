DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_relation_type') THEN
        CREATE TYPE invite_relation_type AS ENUM ('manager', 'skip_level');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.manager_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relation_type invite_relation_type NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manager_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Engineers can manage their own invites" ON public.manager_invites;

CREATE POLICY "Engineers can manage their own invites" 
    ON public.manager_invites FOR ALL 
    USING (auth.uid() = engineer_id);
