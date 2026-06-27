CREATE TABLE IF NOT EXISTS public.handover_dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    new_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ai_compiled_achievements JSONB NOT NULL DEFAULT '{}'::jsonb,
    work_ethics_notes TEXT,
    completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.handover_dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Engineers and assigned managers can read historical handovers" ON public.handover_dossiers;

CREATE POLICY "Engineers and assigned managers can read historical handovers"
    ON public.handover_dossiers FOR SELECT
    USING (is_engineer_self(engineer_id) OR can_manage_engineer(engineer_id) OR can_skip_level(engineer_id));
