DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        CREATE TYPE app_user_role AS ENUM ('engineer', 'manager', 'both');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.account_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_user_role NOT NULL DEFAULT 'engineer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.account_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.account_roles;

CREATE POLICY "Users can view their own roles" 
    ON public.account_roles FOR SELECT 
    USING (auth.uid() = user_id);
