CREATE OR REPLACE FUNCTION public.is_engineer_self(target_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN (SELECT auth.uid()) = target_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.can_manage_engineer(target_engineer_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.reporting_relationships
        WHERE manager_id = (SELECT auth.uid())
          AND engineer_id = target_engineer_id
          AND status IN ('active', 'in_handover')
          AND relation_type = 'direct_manager'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.can_skip_level(target_engineer_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.reporting_relationships
        WHERE manager_id = (SELECT auth.uid())
          AND engineer_id = target_engineer_id
          AND status = 'active'
          AND relation_type = 'skip_level'
    );
END;
$$ LANGUAGE plpgsql;

CREATE POLICY "Engineers and managers can view active reporting relationships"
    ON public.reporting_relationships FOR SELECT
    USING (
        is_engineer_self(engineer_id) OR 
        can_manage_engineer(engineer_id) OR 
        can_skip_level(engineer_id)
    );

DROP POLICY IF EXISTS "Users can select own evidence" ON public.evidence;

CREATE POLICY "Evitrace Unified Read Evidence Policy"
    ON public.evidence FOR SELECT
    USING (
        is_engineer_self(user_id) OR 
        can_manage_engineer(user_id) OR 
        can_skip_level(user_id)
    );
