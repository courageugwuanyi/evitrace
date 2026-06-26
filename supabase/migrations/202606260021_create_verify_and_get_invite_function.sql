CREATE OR REPLACE FUNCTION public.verify_and_get_invite(target_hash TEXT)
RETURNS TABLE (
    id UUID,
    engineer_id UUID,
    relation_type invite_relation_type,
    expires_at TIMESTAMPTZ,
    engineer_email TEXT
) SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.engineer_id, i.relation_type, i.expires_at, au.email::text
    FROM public.manager_invites i
    JOIN auth.users au ON au.id = i.engineer_id
    WHERE i.code_hash = target_hash
      AND i.used_at IS NULL
      AND i.expires_at > now();
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.verify_and_get_invite(TEXT) TO authenticated;
