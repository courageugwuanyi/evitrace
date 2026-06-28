-- Allow direct managers to review/update engineer records in-place.
-- This enables manager workspace actions for evidence review, objective approval,
-- and promotion-readiness assessments while keeping access scoped to active links.

-- Evidence: managers can view and update (review status, competency match, notes).
DROP POLICY IF EXISTS "Direct managers can view connected engineer evidence" ON public.evidence;
CREATE POLICY "Direct managers can view connected engineer evidence"
    ON public.evidence FOR SELECT
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can update connected engineer evidence" ON public.evidence;
CREATE POLICY "Direct managers can update connected engineer evidence"
    ON public.evidence FOR UPDATE
    USING (public.can_manage_engineer(user_id))
    WITH CHECK (public.can_manage_engineer(user_id));

-- Objectives: managers can view and update objective status for connected engineers.
DROP POLICY IF EXISTS "Direct managers can view connected engineer objectives" ON public.objectives;
CREATE POLICY "Direct managers can view connected engineer objectives"
    ON public.objectives FOR SELECT
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can update connected engineer objectives" ON public.objectives;
CREATE POLICY "Direct managers can update connected engineer objectives"
    ON public.objectives FOR UPDATE
    USING (public.can_manage_engineer(user_id))
    WITH CHECK (public.can_manage_engineer(user_id));

-- Assessments: managers can run promotion-readiness assessments on connected engineers.
DROP POLICY IF EXISTS "Direct managers can view connected engineer assessments" ON public.assessments;
CREATE POLICY "Direct managers can view connected engineer assessments"
    ON public.assessments FOR SELECT
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can insert connected engineer assessments" ON public.assessments;
CREATE POLICY "Direct managers can insert connected engineer assessments"
    ON public.assessments FOR INSERT
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can update connected engineer assessments" ON public.assessments;
CREATE POLICY "Direct managers can update connected engineer assessments"
    ON public.assessments FOR UPDATE
    USING (public.can_manage_engineer(user_id))
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can delete connected engineer assessments" ON public.assessments;
CREATE POLICY "Direct managers can delete connected engineer assessments"
    ON public.assessments FOR DELETE
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can view connected engineer assessment categories" ON public.assessment_categories;
CREATE POLICY "Direct managers can view connected engineer assessment categories"
    ON public.assessment_categories FOR SELECT
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can insert connected engineer assessment categories" ON public.assessment_categories;
CREATE POLICY "Direct managers can insert connected engineer assessment categories"
    ON public.assessment_categories FOR INSERT
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can update connected engineer assessment categories" ON public.assessment_categories;
CREATE POLICY "Direct managers can update connected engineer assessment categories"
    ON public.assessment_categories FOR UPDATE
    USING (public.can_manage_engineer(user_id))
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can delete connected engineer assessment categories" ON public.assessment_categories;
CREATE POLICY "Direct managers can delete connected engineer assessment categories"
    ON public.assessment_categories FOR DELETE
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can view connected engineer assessment questions" ON public.assessment_questions;
CREATE POLICY "Direct managers can view connected engineer assessment questions"
    ON public.assessment_questions FOR SELECT
    USING (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can insert connected engineer assessment questions" ON public.assessment_questions;
CREATE POLICY "Direct managers can insert connected engineer assessment questions"
    ON public.assessment_questions FOR INSERT
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can update connected engineer assessment questions" ON public.assessment_questions;
CREATE POLICY "Direct managers can update connected engineer assessment questions"
    ON public.assessment_questions FOR UPDATE
    USING (public.can_manage_engineer(user_id))
    WITH CHECK (public.can_manage_engineer(user_id));

DROP POLICY IF EXISTS "Direct managers can delete connected engineer assessment questions" ON public.assessment_questions;
CREATE POLICY "Direct managers can delete connected engineer assessment questions"
    ON public.assessment_questions FOR DELETE
    USING (public.can_manage_engineer(user_id));
