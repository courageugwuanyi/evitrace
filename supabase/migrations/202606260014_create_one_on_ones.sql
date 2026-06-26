CREATE TABLE public.one_on_ones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    agenda_items TEXT[],
    discussion_notes TEXT,
    action_items TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.one_on_ones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and direct managers can view 1:1 notes"
    ON public.one_on_ones FOR SELECT
    USING (is_engineer_self(engineer_id) OR can_manage_engineer(engineer_id));

CREATE POLICY "Only direct managers can log 1:1 notes"
    ON public.one_on_ones FOR INSERT
    WITH CHECK (can_manage_engineer(engineer_id));
