CREATE TABLE IF NOT EXISTS public.manager_private_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manager_private_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only the authoring manager can view their private scratch notes" ON public.manager_private_notes;

CREATE POLICY "Only the authoring manager can view their private scratch notes"
    ON public.manager_private_notes FOR SELECT
    USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Only the active direct manager can write private notes" ON public.manager_private_notes;

CREATE POLICY "Only the active direct manager can write private notes"
    ON public.manager_private_notes FOR INSERT
    WITH CHECK (auth.uid() = manager_id AND can_manage_engineer(engineer_id));
