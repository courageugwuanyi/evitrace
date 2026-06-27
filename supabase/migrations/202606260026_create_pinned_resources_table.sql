CREATE TABLE IF NOT EXISTS public.pinned_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('evidence', 'objective', 'generic')),
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE,
    pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pinned_resources ENABLE ROW LEVEL SECURITY;

-- Security Policy: anyone with upstream access to the active workspace can view pinned assets.
CREATE POLICY "Users can view workspace pinned resources"
    ON public.pinned_resources FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can pin resources"
    ON public.pinned_resources FOR INSERT
    WITH CHECK (auth.uid() = pinned_by);

CREATE POLICY "Users can unpin their own resources"
    ON public.pinned_resources FOR DELETE
    USING (auth.uid() = pinned_by);

CREATE INDEX IF NOT EXISTS idx_pinned_resources_workspace_created
    ON public.pinned_resources (workspace_id, created_at DESC);
