CREATE OR REPLACE FUNCTION public.disconnect_manager_connection()
RETURNS VOID
SECURITY DEFINER
SET search_path = public, auth AS $$
BEGIN
    UPDATE public.reporting_relationships
    SET
        status = 'archived'::management_transition_status,
        ends_at = COALESCE(ends_at, now())
    WHERE engineer_id = auth.uid()
      AND status IN ('active', 'in_handover');

    UPDATE public.manager_invites
    SET
        used_at = now(),
        used_by = COALESCE(used_by, auth.uid())
    WHERE engineer_id = auth.uid()
      AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.disconnect_manager_connection() TO authenticated;
