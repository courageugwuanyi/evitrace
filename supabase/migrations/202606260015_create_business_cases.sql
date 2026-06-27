CREATE TABLE public.business_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role_title TEXT NOT NULL,
    executive_summary TEXT,
    competency_gains_summary TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, approved
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users, managers, and skip levels can read business cases"
    ON public.business_cases FOR SELECT
    USING (is_engineer_self(engineer_id) OR can_manage_engineer(engineer_id) OR can_skip_level(engineer_id));

CREATE POLICY "Only direct managers can write business cases"
    ON public.business_cases FOR INSERT
    WITH CHECK (can_manage_engineer(engineer_id));
