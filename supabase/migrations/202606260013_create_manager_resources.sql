CREATE TABLE public.manager_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manager_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and managers can view curated resources"
    ON public.manager_resources FOR SELECT
    USING (is_engineer_self(engineer_id) OR can_manage_engineer(engineer_id) OR can_skip_level(engineer_id));

CREATE POLICY "Only direct managers can add resources"
    ON public.manager_resources FOR INSERT
    WITH CHECK (can_manage_engineer(engineer_id));
