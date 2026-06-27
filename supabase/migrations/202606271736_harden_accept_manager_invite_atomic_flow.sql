CREATE OR REPLACE FUNCTION public.accept_manager_invite(
    target_hash TEXT,
    current_manager_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    matched_invite RECORD;
    engineer_email TEXT;
    manager_email TEXT;
    engineer_domain TEXT;
    manager_domain TEXT;
    active_manager_name TEXT;
    existing_same_relationship_id UUID;
    requested_relation management_relationship_role;
BEGIN
    SELECT i.id, i.engineer_id, i.relation_type, i.expires_at
    INTO matched_invite
    FROM public.manager_invites i
    WHERE i.code_hash = target_hash
      AND i.used_at IS NULL
      AND i.expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_OR_EXPIRED',
            'message', 'Invitation is invalid, previously redeemed, or expired.'
        );
    END IF;

    requested_relation := CASE
        WHEN matched_invite.relation_type = 'manager' THEN 'direct_manager'::management_relationship_role
        ELSE 'skip_level'::management_relationship_role
    END;

    SELECT email INTO engineer_email
    FROM auth.users
    WHERE id = matched_invite.engineer_id;

    SELECT email INTO manager_email
    FROM auth.users
    WHERE id = current_manager_id;

    engineer_domain := split_part(lower(coalesce(engineer_email, '')), '@', 2);
    manager_domain := split_part(lower(coalesce(manager_email, '')), '@', 2);

    IF engineer_domain = '' OR manager_domain = '' OR engineer_domain <> manager_domain THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DOMAIN_MISMATCH',
            'expected_domain', nullif(engineer_domain, ''),
            'received_domain', nullif(manager_domain, ''),
            'message', 'Corporate alignment security restriction violated.'
        );
    END IF;

    IF requested_relation = 'direct_manager'::management_relationship_role THEN
        SELECT p.full_name
        INTO active_manager_name
        FROM public.reporting_relationships rr
        LEFT JOIN public.profiles p ON p.id = rr.manager_id
        WHERE rr.engineer_id = matched_invite.engineer_id
          AND rr.relation_type = 'direct_manager'::management_relationship_role
          AND rr.status = 'active'::management_transition_status
        LIMIT 1;

        IF FOUND AND current_manager_id NOT IN (
            SELECT rr.manager_id
            FROM public.reporting_relationships rr
            WHERE rr.engineer_id = matched_invite.engineer_id
              AND rr.relation_type = 'direct_manager'::management_relationship_role
              AND rr.status = 'active'::management_transition_status
        ) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'ACTIVE_MANAGER_CONFLICT',
                'active_manager', coalesce(nullif(active_manager_name, ''), 'another manager'),
                'message', 'This engineer already has an active direct manager assigned.'
            );
        END IF;
    END IF;

    SELECT id
    INTO existing_same_relationship_id
    FROM public.reporting_relationships
    WHERE engineer_id = matched_invite.engineer_id
      AND manager_id = current_manager_id
      AND relation_type = requested_relation
      AND status = 'active'::management_transition_status
    LIMIT 1;

    IF FOUND THEN
        UPDATE public.manager_invites
        SET used_at = now(), used_by = current_manager_id
        WHERE id = matched_invite.id
          AND used_at IS NULL;

        RETURN jsonb_build_object(
            'success', true,
            'already_linked', true,
            'engineer_id', matched_invite.engineer_id,
            'relation_type', matched_invite.relation_type,
            'message', 'Teammate connection already actively configured.'
        );
    END IF;

    INSERT INTO public.reporting_relationships (
        engineer_id,
        manager_id,
        relation_type,
        status
    ) VALUES (
        matched_invite.engineer_id,
        current_manager_id,
        requested_relation,
        'active'::management_transition_status
    );

    UPDATE public.manager_invites
    SET used_at = now(), used_by = current_manager_id
    WHERE id = matched_invite.id
      AND used_at IS NULL;

    INSERT INTO public.access_audit_log (
        actor_id,
        event_type,
        description
    ) VALUES (
        current_manager_id,
        'INVITE_REDEEMED',
        'Manager successfully claimed access token boundary for engineer ID: ' || matched_invite.engineer_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'engineer_id', matched_invite.engineer_id,
        'relation_type', matched_invite.relation_type,
        'message', 'Teammate connection completed successfully.'
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.accept_manager_invite(TEXT, UUID) TO authenticated;
