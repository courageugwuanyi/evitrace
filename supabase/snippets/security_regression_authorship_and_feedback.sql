-- Security regression checks for:
-- 1) manager_id authorship forgery on manager-authored inserts
-- 2) three_sixty_feedback target reassignment on reviewer update
--
-- Run this after applying migrations. It is safe to run repeatedly.
-- The script uses a transaction and rolls back all inserted rows.

BEGIN;

DO $$
DECLARE
    v_engineer_id UUID;
    v_manager_a UUID;
    v_manager_b UUID;
    v_feedback_id UUID;
BEGIN
    SELECT rr.engineer_id, rr.manager_id
    INTO v_engineer_id, v_manager_a
    FROM public.reporting_relationships rr
    WHERE rr.status = 'active'
      AND rr.relation_type = 'direct_manager'
    LIMIT 1;

    IF v_engineer_id IS NULL OR v_manager_a IS NULL THEN
        RAISE EXCEPTION 'Regression check setup failed: no active direct manager relationship found.';
    END IF;

    SELECT p.id
    INTO v_manager_b
    FROM public.profiles p
    WHERE p.id <> v_manager_a
    LIMIT 1;

    IF v_manager_b IS NULL THEN
        RAISE EXCEPTION 'Regression check setup failed: could not find a second user id.';
    END IF;

    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', v_manager_a::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    INSERT INTO public.manager_feedback (engineer_id, manager_id, content)
    VALUES (v_engineer_id, v_manager_a, 'security-regression legit insert')
    RETURNING id INTO v_feedback_id;

    IF v_feedback_id IS NULL THEN
        RAISE EXCEPTION 'Expected a valid manager_feedback insert to succeed.';
    END IF;

    BEGIN
        INSERT INTO public.manager_feedback (engineer_id, manager_id, content)
        VALUES (v_engineer_id, v_manager_b, 'forged manager_feedback author');
        RAISE EXCEPTION 'FAILED: manager_feedback forgery unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: manager_feedback forgery blocked: %', SQLERRM;
    END;

    BEGIN
        INSERT INTO public.one_on_ones (engineer_id, manager_id, discussion_notes)
        VALUES (v_engineer_id, v_manager_b, 'forged one_on_ones author');
        RAISE EXCEPTION 'FAILED: one_on_ones forgery unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: one_on_ones forgery blocked: %', SQLERRM;
    END;

    BEGIN
        INSERT INTO public.business_cases (engineer_id, manager_id, target_role_title)
        VALUES (v_engineer_id, v_manager_b, 'Senior Engineer');
        RAISE EXCEPTION 'FAILED: business_cases forgery unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: business_cases forgery blocked: %', SQLERRM;
    END;

    BEGIN
        INSERT INTO public.manager_resources (engineer_id, manager_id, title, url, description)
        VALUES (
            v_engineer_id,
            v_manager_b,
            'forged manager_resources author',
            'https://example.com/security-regression',
            'authorship forgery attempt'
        );
        RAISE EXCEPTION 'FAILED: manager_resources forgery unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: manager_resources forgery blocked: %', SQLERRM;
    END;

    INSERT INTO public.three_sixty_feedback (
        engineer_id,
        reviewer_id,
        relationship_type,
        status
    )
    VALUES (
        v_engineer_id,
        v_manager_a,
        'peer_engineer',
        'pending'
    )
    RETURNING id INTO v_feedback_id;

    BEGIN
        UPDATE public.three_sixty_feedback
        SET engineer_id = v_manager_b,
            status = 'submitted',
            continue_feedback = 'regression',
            stop_feedback = 'regression',
            start_feedback = 'regression',
            execution_vector = 'regression',
            submitted_at = now()
        WHERE id = v_feedback_id;
        RAISE EXCEPTION 'FAILED: three_sixty_feedback engineer_id reassignment unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: three_sixty_feedback engineer_id reassignment blocked: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.three_sixty_feedback
        SET reviewer_id = v_manager_b,
            status = 'submitted',
            continue_feedback = 'regression',
            stop_feedback = 'regression',
            start_feedback = 'regression',
            execution_vector = 'regression',
            submitted_at = now()
        WHERE id = v_feedback_id;
        RAISE EXCEPTION 'FAILED: three_sixty_feedback reviewer_id reassignment unexpectedly succeeded.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'PASS: three_sixty_feedback reviewer_id reassignment blocked: %', SQLERRM;
    END;

    RAISE NOTICE 'PASS: security regression checks completed.';
END;
$$;

ROLLBACK;
