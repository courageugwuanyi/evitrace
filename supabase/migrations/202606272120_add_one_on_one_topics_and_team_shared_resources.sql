-- Shared 1-on-1 discussion topics ledger
CREATE TABLE public.one_on_one_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'discussed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Team-shared learning resources hub
CREATE TABLE public.team_shared_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url_context TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.one_on_one_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shared_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant 1-on-1 topics"
    ON public.one_on_one_topics FOR SELECT
    USING (auth.uid() = engineer_id OR auth.uid() = manager_id);

CREATE POLICY "Managers can inject 1-on-1 topics"
    ON public.one_on_one_topics FOR INSERT
    WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Anyone authenticated can view shared resources"
    ON public.team_shared_resources FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can publish shared resources"
    ON public.team_shared_resources FOR INSERT
    WITH CHECK (auth.uid() = author_id);
