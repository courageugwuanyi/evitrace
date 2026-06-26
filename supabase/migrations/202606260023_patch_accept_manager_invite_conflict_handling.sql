CREATE OR REPLACE FUNCTION public.accept_manager_invite(
    target_hash TEXT,
    current_manager_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    matched_invite RECORD;
    existing_direct_manager RECORD;
    existing_same_relationship_id UUID;
    requested_relation management_relationship_role;
    result_payload JSONB;
BEGIN
    SELECT i.id, i.engineer_id, i.relation_type, i.expires_at
    INTO matched_invite
    FROM public.manager_invites i
    WHERE i.code_hash = target_hash
      AND i.used_at IS NULL
      AND i.expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This invitation link is invalid or has expired.';
    END IF;

    requested_relation := CASE
        WHEN matched_invite.relation_type = 'manager' THEN 'direct_manager'::management_relationship_role
        ELSE 'skip_level'::management_relationship_role
    END;

    IF requested_relation = 'direct_manager'::management_relationship_role THEN
        SELECT id, manager_id
        INTO existing_direct_manager
        FROM public.reporting_relationships
        WHERE engineer_id = matched_invite.engineer_id
          AND relation_type = 'direct_manager'::management_relationship_role
          AND status = 'active'::management_transition_status
        LIMIT 1;

        IF FOUND THEN
            IF existing_direct_manager.manager_id = current_manager_id THEN
                UPDATE public.manager_invites
                SET used_at = now(), used_by = current_manager_id
                WHERE id = matched_invite.id
                  AND used_at IS NULL;

                RETURN jsonb_build_object(
                    'success', true,
                    'engineer_id', matched_invite.engineer_id,
                    'relation_type', matched_invite.relation_type,
                    'already_linked', true
                );
            END IF;

            RAISE EXCEPTION 'This engineer already has an active direct manager assigned.';
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
            'engineer_id', matched_invite.engineer_id,
            'relation_type', matched_invite.relation_type,
            'already_linked', true
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

    result_payload := jsonb_build_object(
        'success', true,
        'engineer_id', matched_invite.engineer_id,
        'relation_type', matched_invite.relation_type
    );

    RETURN result_payload;
END;
$$ LANGUAGE plpgsql;
