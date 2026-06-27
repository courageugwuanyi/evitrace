DROP POLICY IF EXISTS "Managers can view connected engineer profiles" ON public.profiles;

CREATE POLICY "Managers can view connected engineer profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.reporting_relationships r
    WHERE r.manager_id = (SELECT auth.uid())
      AND r.engineer_id = profiles.id
      AND r.status IN ('active'::management_transition_status, 'in_handover'::management_transition_status)
      AND r.relation_type IN ('direct_manager'::management_relationship_role, 'skip_level'::management_relationship_role)
  )
);
