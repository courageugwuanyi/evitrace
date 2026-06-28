import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { getSafeErrorMessage } from "@/lib/safe-error-message";
import { supabase } from "@/lib/supabase";

interface KnowledgeCurationCardProps {
  onSaveRefresh: () => void;
}

export function KnowledgeCurationCard({ onSaveRefresh }: KnowledgeCurationCardProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shareToTeam, setShareToTeam] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCurationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: privateInsertError } = await supabase.from("manager_knowledge_base").insert({
        manager_id: user?.id,
        title: title.trim(),
        content: content.trim(),
        category: "coaching_playbook",
      });
      if (privateInsertError) throw privateInsertError;

      if (shareToTeam) {
        const { error: sharedInsertError } = await supabase.from("team_shared_resources").insert({
          author_id: user?.id,
          title: `[Shared Resource] ${title.trim()}`,
          url_context: content.trim(),
        });
        if (sharedInsertError) throw sharedInsertError;
      }

      toast.success(
        shareToTeam
          ? "Saved to private repository and published to team feed."
          : "Saved to private repository.",
      );
      setTitle("");
      setContent("");
      setShareToTeam(false);
      onSaveRefresh();
    } catch (error) {
      const message = getSafeErrorMessage(error, "Resource curation transaction failed.");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleCurationSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs font-sans"
    >
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Curate Reference Resource
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Store internal guidance in a private workspace notebook and optionally publish to team
          dashboards.
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Resource title or workspace guideline focus"
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden"
          required
        />
        <textarea
          rows={3}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste context, process steps, or review guidance"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden"
          required
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3">
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Share2 className="h-3.5 w-3.5 text-slate-500" />
            Share to Team Feed
          </span>
          <span className="text-[10px] text-slate-400">
            Cross-publish this entry to reporting engineers in one action.
          </span>
        </div>
        <input
          type="checkbox"
          checked={shareToTeam}
          onChange={(event) => setShareToTeam(event.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="h-8 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Commit Curation"}
        </button>
      </div>
    </form>
  );
}
