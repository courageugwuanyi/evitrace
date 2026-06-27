CREATE TABLE public.business_case_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_case_id UUID NOT NULL REFERENCES public.business_cases(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_case_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized roles can read business case comments"
    ON public.business_case_comments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.business_cases b 
        WHERE b.id = business_case_id 
          AND (is_engineer_self(b.engineer_id) OR can_manage_engineer(b.engineer_id) OR can_skip_level(b.engineer_id))
    ));

CREATE POLICY "Direct and skip level managers can add comments"
    ON public.business_case_comments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.business_cases b 
        WHERE b.id = business_case_id 
          AND (can_manage_engineer(b.engineer_id) OR can_skip_level(b.engineer_id))
    ));
