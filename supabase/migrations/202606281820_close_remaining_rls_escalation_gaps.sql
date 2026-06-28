DROP POLICY IF EXISTS "Managers can inject 1-on-1 topics" ON public.one_on_one_topics;
DROP POLICY IF EXISTS "Users can view relevant 1-on-1 topics" ON public.one_on_one_topics;

CREATE POLICY "Users can view relevant 1-on-1 topics"
    ON public.one_on_one_topics FOR SELECT
    TO authenticated
    USING (
        auth.uid() = engineer_id
        OR (
            auth.uid() = manager_id
            AND public.can_manage_engineer(engineer_id)
        )
    );

CREATE POLICY "Managers can inject 1-on-1 topics"
    ON public.one_on_one_topics FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id
        AND public.can_manage_engineer(engineer_id)
    );

DROP POLICY IF EXISTS "Anyone authenticated can view shared resources" ON public.team_shared_resources;
DROP POLICY IF EXISTS "Allow users to select shared resources" ON public.team_shared_resources;

CREATE POLICY "Team members can view shared resources"
    ON public.team_shared_resources FOR SELECT
    TO authenticated
    USING (
        auth.uid() = author_id
        OR public.can_manage_engineer(author_id)
        OR public.can_skip_level(author_id)
        OR EXISTS (
            SELECT 1
            FROM public.reporting_relationships rr
            WHERE rr.engineer_id = auth.uid()
              AND rr.manager_id = team_shared_resources.author_id
              AND rr.status IN ('active', 'in_handover')
              AND rr.relation_type IN ('direct_manager', 'skip_level')
        )
    );

DROP POLICY IF EXISTS "Allow authenticated users to view pinned resources" ON public.pinned_resources;

DROP POLICY IF EXISTS "Managers can read audit logs" ON public.access_audit_log;
