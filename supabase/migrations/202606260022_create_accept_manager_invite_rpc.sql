DROP FUNCTION IF EXISTS public.accept_manager_invite(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.accept_manager_invite(
    target_hash TEXT,
    current_manager_id UUID
)
RETURNS JSONB
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE
    matched_invite RECORD;
    existing_relationship_id UUID;
    result_payload JSONB;
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
        RAISE EXCEPTION 'This invitation link is invalid or has expired.';
    END IF;

    -- 2. Prevent duplicate active connections if already linked
    SELECT id INTO existing_relationship_id
    FROM public.reporting_relationships
    WHERE engineer_id = matched_invite.engineer_id
      AND manager_id = current_manager_id
      AND status = 'active';

    IF FOUND THEN
        RAISE EXCEPTION 'You are already linked to this engineer workspace.';
    END IF;

    -- 3. Create the corporate reporting boundary line
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

    -- 4. Single-use token enforcement: Burn the code hash
    UPDATE public.manager_invites
    SET used_at = now()
    WHERE id = matched_invite.id;

    -- 5. Track compliance: Write to the immutable audit ledger
    INSERT INTO public.access_audit_log (
        actor_id,
        event_type,
        description
    ) VALUES (
        current_manager_id,
        'INVITE_REDEEMED',
        'Manager successfully claimed access token boundary for engineer ID: ' || matched_invite.engineer_id
    );

    -- 6. Build the response payload
    result_payload := jsonb_build_object(
        'success', true,
        'engineer_id', matched_invite.engineer_id,
        'relation_type', matched_invite.relation_type
    );

    RETURN result_payload;
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission safely to the authenticated network runtime
GRANT EXECUTE ON FUNCTION public.accept_manager_invite(TEXT, UUID) TO authenticated;