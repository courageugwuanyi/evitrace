CREATE TABLE IF NOT EXISTS public.access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read audit entries involving them" ON public.access_audit_log;

CREATE POLICY "Allow authenticated users to read audit entries involving them"
    ON public.access_audit_log FOR SELECT
    USING (auth.uid() = actor_id OR EXISTS (
        SELECT 1 FROM public.account_roles WHERE user_id = auth.uid() AND role IN ('manager', 'both')
    ));
