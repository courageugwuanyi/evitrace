CREATE TYPE invite_relation_type AS ENUM ('manager', 'skip_level');

CREATE TABLE public.manager_invites (
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

CREATE POLICY "Engineers can manage their own invites" 
    ON public.manager_invites FOR ALL 
    USING (auth.uid() = engineer_id);
