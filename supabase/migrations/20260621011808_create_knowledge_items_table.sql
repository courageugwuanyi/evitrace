CREATE TABLE IF NOT EXISTS public.knowledge_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reference_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own knowledge items" ON public.knowledge_items;

CREATE POLICY "Users can manage their own knowledge items"
    ON public.knowledge_items
    FOR ALL
    USING (auth.uid() = user_id);