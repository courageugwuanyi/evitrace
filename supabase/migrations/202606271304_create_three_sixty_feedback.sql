CREATE TABLE IF NOT EXISTS public.three_sixty_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (
        relationship_type IN ('peer_engineer', 'ux_partner', 'product_manager')
    ),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted')),
    continue_feedback TEXT,
    stop_feedback TEXT,
    start_feedback TEXT,
    execution_vector TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_three_sixty_feedback_engineer_status
    ON public.three_sixty_feedback (engineer_id, status);

CREATE INDEX IF NOT EXISTS idx_three_sixty_feedback_reviewer_status
    ON public.three_sixty_feedback (reviewer_id, status);

ALTER TABLE public.three_sixty_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Engineers can only see compiled anonymous feedback cohorts"
    ON public.three_sixty_feedback;
CREATE POLICY "Engineers can only see compiled anonymous feedback cohorts"
    ON public.three_sixty_feedback FOR SELECT
    USING (
        auth.uid() = engineer_id
        AND (
            SELECT count(DISTINCT reviewer_id)
            FROM public.three_sixty_feedback
            WHERE engineer_id = auth.uid() AND status = 'submitted'
        ) >= 3
    );

DROP POLICY IF EXISTS "Managers can view team feedback loops"
    ON public.three_sixty_feedback;
CREATE POLICY "Managers can view team feedback loops"
    ON public.three_sixty_feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.reporting_relationships
            WHERE manager_id = auth.uid()
              AND engineer_id = three_sixty_feedback.engineer_id
              AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Reviewers can view their assigned feedback tasks"
    ON public.three_sixty_feedback;
CREATE POLICY "Reviewers can view their assigned feedback tasks"
    ON public.three_sixty_feedback FOR SELECT
    USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Reviewers can submit their feedback evaluations"
    ON public.three_sixty_feedback;
CREATE POLICY "Reviewers can submit their feedback evaluations"
    ON public.three_sixty_feedback FOR UPDATE
    USING (auth.uid() = reviewer_id AND status = 'pending')
    WITH CHECK (auth.uid() = reviewer_id AND status = 'submitted');

DROP POLICY IF EXISTS "Managers can seed approved reviewer pool"
    ON public.three_sixty_feedback;
CREATE POLICY "Managers can seed approved reviewer pool"
    ON public.three_sixty_feedback FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.reporting_relationships
            WHERE manager_id = auth.uid()
              AND engineer_id = three_sixty_feedback.engineer_id
              AND status = 'active'
        )
    );
