CREATE POLICY "Engineers can view connected manager profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.reporting_relationships r
    WHERE r.engineer_id = (SELECT auth.uid())
      AND r.manager_id = profiles.id
      AND r.relation_type = 'direct_manager'::management_relationship_role
      AND r.status IN ('active'::management_transition_status, 'in_handover'::management_transition_status)
  )
);
