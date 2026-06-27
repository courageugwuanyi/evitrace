DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'management_relationship_role') THEN
        CREATE TYPE management_relationship_role AS ENUM ('direct_manager', 'skip_level');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'management_transition_status') THEN
        CREATE TYPE management_transition_status AS ENUM ('active', 'in_handover', 'archived');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.reporting_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relation_type management_relationship_role NOT NULL,
    status management_transition_status NOT NULL DEFAULT 'active',
    handover_notes TEXT,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_from_invite_id UUID REFERENCES public.manager_invites(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_direct_manager ON public.reporting_relationships (engineer_id) 
WHERE (status IN ('active', 'in_handover') AND relation_type = 'direct_manager');

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_skip_level ON public.reporting_relationships (engineer_id) 
WHERE (status = 'active' AND relation_type = 'skip_level');

ALTER TABLE public.reporting_relationships ENABLE ROW LEVEL SECURITY;
