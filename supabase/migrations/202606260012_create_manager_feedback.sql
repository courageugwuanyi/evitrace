CREATE TABLE public.manager_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manager_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and managers can view feedback"
    ON public.manager_feedback FOR SELECT
    USING (is_engineer_self(engineer_id) OR can_manage_engineer(engineer_id) OR can_skip_level(engineer_id));

CREATE POLICY "Only direct managers can write feedback"
    ON public.manager_feedback FOR INSERT
    WITH CHECK (can_manage_engineer(engineer_id));
