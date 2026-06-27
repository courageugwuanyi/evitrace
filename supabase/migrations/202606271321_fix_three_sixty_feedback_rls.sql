-- Prevent recursive RLS evaluation and allow engineers to nominate reviewers.

CREATE OR REPLACE FUNCTION public.can_view_three_sixty_feedback_cohort(target_engineer_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() = target_engineer_id
    AND (
      SELECT COUNT(DISTINCT reviewer_id)
      FROM public.three_sixty_feedback
      WHERE engineer_id = target_engineer_id
        AND status = 'submitted'
    ) >= 3;
$$;

REVOKE ALL ON FUNCTION public.can_view_three_sixty_feedback_cohort(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_three_sixty_feedback_cohort(UUID) TO authenticated;

DROP POLICY IF EXISTS "Engineers can only see compiled anonymous feedback cohorts"
    ON public.three_sixty_feedback;
CREATE POLICY "Engineers can only see compiled anonymous feedback cohorts"
    ON public.three_sixty_feedback FOR SELECT
    USING (public.can_view_three_sixty_feedback_cohort(engineer_id));

DROP POLICY IF EXISTS "Managers can seed approved reviewer pool"
    ON public.three_sixty_feedback;
CREATE POLICY "Managers or engineers can seed approved reviewer pool"
    ON public.three_sixty_feedback FOR INSERT
    WITH CHECK (
      auth.uid() = engineer_id
      OR EXISTS (
        SELECT 1
        FROM public.reporting_relationships
        WHERE manager_id = auth.uid()
          AND engineer_id = three_sixty_feedback.engineer_id
          AND status = 'active'
      )
    );
