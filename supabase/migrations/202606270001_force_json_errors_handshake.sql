CREATE OR REPLACE FUNCTION public.accept_manager_invite(
    target_hash TEXT,
    current_manager_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    matched_invite RECORD;
    active_manager_name TEXT;
    existing_relationship_id UUID;
    engineer_email TEXT;
    manager_email TEXT;
    engineer_domain TEXT;
    manager_domain TEXT;
BEGIN
    -- 1. Locate and lock the active invite record
    SELECT i.id, i.engineer_id, i.relation_type, i.expires_at
    INTO matched_invite
    FROM public.manager_invites i
    WHERE i.code_hash = target_hash
      AND i.used_at IS NULL
      AND i.expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_OR_EXPIRED');
    END IF;

    -- 2. Extract and check email domains for strict corporate alignment
    SELECT email INTO engineer_email FROM auth.users WHERE id = matched_invite.engineer_id;
    SELECT email INTO manager_email FROM auth.users WHERE id = current_manager_id;

    engineer_domain := split_part(lower(coalesce(engineer_email, '')), '@', 2);
    manager_domain := split_part(lower(coalesce(manager_email, '')), '@', 2);

    IF engineer_domain = '' OR manager_domain = '' OR engineer_domain <> manager_domain THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DOMAIN_MISMATCH',
            'expected_domain', nullif(engineer_domain, ''),
            'received_domain', nullif(manager_domain, '')
        );
    END IF;

    -- 3. Strictly check if an active direct manager is already assigned
    IF matched_invite.relation_type = 'manager' THEN
        SELECT p.full_name INTO active_manager_name
        FROM public.reporting_relationships r
        JOIN public.profiles p ON p.id = r.manager_id
        WHERE r.engineer_id = matched_invite.engineer_id
          AND r.relation_type = 'direct_manager'::management_relationship_role
          AND r.status = 'active'::management_transition_status
        LIMIT 1;

        IF active_manager_name IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'ACTIVE_MANAGER_CONFLICT',
                'active_manager', active_manager_name
            );
        END IF;
    END IF;

    -- 4. Prevent duplicate active connections for the same manager
    SELECT id INTO existing_relationship_id
    FROM public.reporting_relationships
    WHERE engineer_id = matched_invite.engineer_id
      AND manager_id = current_manager_id
      AND status = 'active';

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'ALREADY_LINKED');
    END IF;

    -- 5. Create the corporate reporting line for the new manager
    INSERT INTO public.reporting_relationships (
        engineer_id,
        manager_id,
        relation_type,
        status
    ) VALUES (
        matched_invite.engineer_id,
        current_manager_id,
        CASE WHEN matched_invite.relation_type = 'manager' THEN 'direct_manager'::management_relationship_role
             ELSE 'skip_level'::management_relationship_role END,
        'active'::management_transition_status
    );

    -- 6. Burn the single-use token
    UPDATE public.manager_invites
    SET used_at = now(),
        used_by = current_manager_id
    WHERE id = matched_invite.id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Re-verify execution permissions for the network layer
GRANT EXECUTE ON FUNCTION public.accept_manager_invite(TEXT, UUID) TO authenticated;
