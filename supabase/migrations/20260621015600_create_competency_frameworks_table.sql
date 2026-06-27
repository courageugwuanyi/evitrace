-- Ensure the columns exist even if the table was already created
ALTER TABLE public.competency_frameworks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_system_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS matrix JSONB;

-- Clean up any old duplicate column definitions if 'name' or 'matrix' were missing constraints
ALTER TABLE public.competency_frameworks ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.competency_frameworks ALTER COLUMN matrix SET NOT NULL;

-- Link profiles to an active framework selection securely
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_framework_id UUID REFERENCES public.competency_frameworks(id) ON DELETE SET NULL;

-- Enable Row Level Security safely
ALTER TABLE public.competency_frameworks ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it partially registered, then create it cleanly
DROP POLICY IF EXISTS "Anyone can view system defaults, users can manage own frameworks" ON public.competency_frameworks;

CREATE POLICY "Anyone can view system defaults, users can manage own frameworks"
    ON public.competency_frameworks
    FOR ALL
    USING (is_system_default = true OR auth.uid() = user_id);