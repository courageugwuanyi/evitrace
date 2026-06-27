import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, MessageSquarePlus, Plus } from "lucide-react";

import { supabase } from "@/lib/supabase";

type OneOnOneTopicRow = {
  id: string;
  topic_text: string;
  created_at: string;
};

type SharedResourceRow = {
  id: string;
  title: string;
  url_context: string;
  created_at: string;
};

export function OneOnOneWorkspace({ engineerId }: { engineerId: string }) {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<OneOnOneTopicRow[]>([]);
  const [resources, setResources] = useState<SharedResourceRow[]>([]);

  const [newTopic, setNewTopic] = useState("");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceContext, setNewResourceContext] = useState("");

  async function loadWorkspaceData() {
    if (!engineerId) return;
    setLoading(true);
    try {
      const [topicsResponse, resourcesResponse] = await Promise.all([
        (supabase as any)
          .from("one_on_one_topics")
          .select("id, topic_text, created_at")
          .eq("engineer_id", engineerId)
          .eq("status", "open")
          .order("created_at", { ascending: false }),
        (supabase as any)
          .from("team_shared_resources")
          .select("id, title, url_context, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (topicsResponse.error) throw topicsResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;

      setTopics((topicsResponse.data ?? []) as OneOnOneTopicRow[]);
      setResources((resourcesResponse.data ?? []) as SharedResourceRow[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sync 1-on-1 and resources workspace.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspaceData();
  }, [engineerId]);

  async function handleAddTopic(event: React.FormEvent) {
    event.preventDefault();
    if (!newTopic.trim() || !engineerId) return;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) throw new Error("No active manager session found.");

      const { error } = await (supabase as any).from("one_on_one_topics").insert({
        engineer_id: engineerId,
        manager_id: user.id,
        topic_text: newTopic.trim(),
      });
      if (error) throw error;

      setNewTopic("");
      toast.success("Added topic to the shared 1-on-1 agenda.");
      await loadWorkspaceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add 1-on-1 topic.";
      toast.error(message);
    }
  }

  async function handleAddResource(event: React.FormEvent) {
    event.preventDefault();
    if (!newResourceTitle.trim() || !newResourceContext.trim()) return;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) throw new Error("No active manager session found.");

      const { error } = await (supabase as any).from("team_shared_resources").insert({
        author_id: user.id,
        title: newResourceTitle.trim(),
        url_context: newResourceContext.trim(),
      });
      if (error) throw error;

      setNewResourceTitle("");
      setNewResourceContext("");
      toast.success("Suggested learning resource published to the shared hub.");
      await loadWorkspaceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish resource.";
      toast.error(message);
    }
  }

  if (loading) {
    return <div className="mt-4 h-40 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />;
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <MessageSquarePlus size={14} />
          1-on-1 Sync Agenda
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Log discussion items so both manager and engineer can align priorities ahead of the next sync.
        </p>

        <form onSubmit={handleAddTopic} className="mt-4 flex gap-2">
          <input
            value={newTopic}
            onChange={(event) => setNewTopic(event.target.value)}
            placeholder="Add a discussion topic..."
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={13} />
            Add
          </button>
        </form>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {topics.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              No open agenda topics yet.
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-sm text-slate-800">{topic.topic_text}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {new Date(topic.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <BookOpen size={14} />
          Suggested Learning Resources
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Curate team-shared references, playbooks, and learning links tied to active competency gaps.
        </p>

        <form onSubmit={handleAddResource} className="mt-4 space-y-2">
          <input
            value={newResourceTitle}
            onChange={(event) => setNewResourceTitle(event.target.value)}
            placeholder="Resource title"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <textarea
            value={newResourceContext}
            onChange={(event) => setNewResourceContext(event.target.value)}
            placeholder="URL or context note"
            className="min-h-[92px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={13} />
            Publish Resource
          </button>
        </form>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {resources.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              No shared resources available yet.
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-sm font-semibold text-slate-900">{resource.title}</div>
                <div className="mt-1 break-words text-xs text-slate-600">{resource.url_context}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {new Date(resource.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
