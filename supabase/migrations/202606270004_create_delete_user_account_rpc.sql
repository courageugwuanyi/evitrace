CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID
SECURITY DEFINER
SET search_path = public, auth AS $$
BEGIN
    DELETE FROM auth.users
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
