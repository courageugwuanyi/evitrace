DROP POLICY IF EXISTS "Engineers can manage their own invites" ON public.manager_invites;

CREATE POLICY "Engineers can manage their own invites"
    ON public.manager_invites
    FOR ALL
    USING (auth.uid() = engineer_id)
    WITH CHECK (auth.uid() = engineer_id);
