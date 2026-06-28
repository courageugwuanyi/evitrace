DROP POLICY IF EXISTS "Only direct managers can write feedback" ON public.manager_feedback;
CREATE POLICY "Only direct managers can write feedback"
    ON public.manager_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id
        AND public.can_manage_engineer(engineer_id)
    );

DROP POLICY IF EXISTS "Only direct managers can log 1:1 notes" ON public.one_on_ones;
CREATE POLICY "Only direct managers can log 1:1 notes"
    ON public.one_on_ones FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id
        AND public.can_manage_engineer(engineer_id)
    );

DROP POLICY IF EXISTS "Only direct managers can write business cases" ON public.business_cases;
CREATE POLICY "Only direct managers can write business cases"
    ON public.business_cases FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id
        AND public.can_manage_engineer(engineer_id)
    );

DROP POLICY IF EXISTS "Only direct managers can add resources" ON public.manager_resources;
CREATE POLICY "Only direct managers can add resources"
    ON public.manager_resources FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id
        AND public.can_manage_engineer(engineer_id)
    );

DROP POLICY IF EXISTS "Reviewers can submit their feedback evaluations"
    ON public.three_sixty_feedback;
CREATE POLICY "Reviewers can submit their feedback evaluations"
    ON public.three_sixty_feedback FOR UPDATE
    TO authenticated
    USING (auth.uid() = reviewer_id AND status = 'pending')
    WITH CHECK (auth.uid() = reviewer_id AND status = 'submitted');

CREATE OR REPLACE FUNCTION public.prevent_three_sixty_feedback_target_reassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.engineer_id IS DISTINCT FROM OLD.engineer_id THEN
        RAISE EXCEPTION 'Cannot change engineer_id on existing feedback request.';
    END IF;

    IF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id THEN
        RAISE EXCEPTION 'Cannot change reviewer_id on existing feedback request.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_three_sixty_feedback_target_reassignment
    ON public.three_sixty_feedback;
CREATE TRIGGER tr_prevent_three_sixty_feedback_target_reassignment
    BEFORE UPDATE ON public.three_sixty_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_three_sixty_feedback_target_reassignment();
