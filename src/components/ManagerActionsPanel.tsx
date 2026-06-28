import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { sendNotification } from "@/lib/api/notifications.functions";
import { getSafeErrorMessage } from "@/lib/safe-error-message";
import { supabase } from "@/lib/supabase";

type ManagerActionsPanelProps = {
  engineerId: string;
  currentUserRole: "manager" | "skip_level" | "both";
};

type ManagerFeedbackRow = {
  id: string;
  manager_id: string;
  content: string;
  created_at: string;
};

type ManagerResourceRow = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};

type BusinessCaseRow = {
  id: string;
  target_role_title: string;
  executive_summary: string | null;
  competency_gains_summary: string | null;
  status: "draft" | "submitted" | "approved";
};

type BusinessCaseCommentRow = {
  id: string;
  author_id: string;
  comment: string;
  created_at: string;
};

type TabId = "feedback" | "resources" | "business_case";

export function ManagerActionsPanel({ engineerId, currentUserRole }: ManagerActionsPanelProps) {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("feedback");
  const [loading, setLoading] = useState(false);

  const [feedbackRows, setFeedbackRows] = useState<ManagerFeedbackRow[]>([]);
  const [feedbackDraft, setFeedbackDraft] = useState("");

  const [resourceRows, setResourceRows] = useState<ManagerResourceRow[]>([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");

  const [businessCase, setBusinessCase] = useState<BusinessCaseRow | null>(null);
  const [targetRoleTitle, setTargetRoleTitle] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [competencyGainsSummary, setCompetencyGainsSummary] = useState("");
  const [businessCaseStatus, setBusinessCaseStatus] = useState<"draft" | "submitted">("draft");

  const [comments, setComments] = useState<BusinessCaseCommentRow[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [authorNameById, setAuthorNameById] = useState<Record<string, string>>({});

  const canWriteManagerTabs = currentUserRole === "manager" || currentUserRole === "both";
  const showCommentModule = currentUserRole === "skip_level" || currentUserRole === "both";

  const tabConfig = useMemo(
    () => [
      { id: "feedback" as const, label: "Feedback" },
      { id: "resources" as const, label: "Curated Resources" },
      { id: "business_case" as const, label: "Business Case" },
    ],
    [],
  );

  useEffect(() => {
    let active = true;

    async function loadPanelData() {
      if (!engineerId) return;
      setLoading(true);
      try {
        const [feedbackResponse, resourcesResponse, businessCaseResponse] = await Promise.all([
          (supabase as any)
            .from("manager_feedback")
            .select("id, manager_id, content, created_at")
            .eq("engineer_id", engineerId)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("manager_resources")
            .select("id, title, url, description, created_at")
            .eq("engineer_id", engineerId)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("business_cases")
            .select("id, target_role_title, executive_summary, competency_gains_summary, status")
            .eq("engineer_id", engineerId)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (!active) return;

        if (feedbackResponse.error) throw feedbackResponse.error;
        if (resourcesResponse.error) throw resourcesResponse.error;
        if (businessCaseResponse.error) throw businessCaseResponse.error;

        const nextFeedback = (feedbackResponse.data ?? []) as ManagerFeedbackRow[];
        const nextResources = (resourcesResponse.data ?? []) as ManagerResourceRow[];
        const nextBusinessCase = (businessCaseResponse.data as BusinessCaseRow | null) ?? null;

        setFeedbackRows(nextFeedback);
        setResourceRows(nextResources);
        setBusinessCase(nextBusinessCase);
        setTargetRoleTitle(nextBusinessCase?.target_role_title ?? "");
        setExecutiveSummary(nextBusinessCase?.executive_summary ?? "");
        setCompetencyGainsSummary(nextBusinessCase?.competency_gains_summary ?? "");
        setBusinessCaseStatus(
          nextBusinessCase?.status === "submitted" || nextBusinessCase?.status === "approved"
            ? "submitted"
            : "draft",
        );

        if (nextBusinessCase?.id) {
          const commentsResponse = await (supabase as any)
            .from("business_case_comments")
            .select("id, author_id, comment, created_at")
            .eq("business_case_id", nextBusinessCase.id)
            .order("created_at", { ascending: false });
          if (commentsResponse.error) throw commentsResponse.error;
          const nextComments = (commentsResponse.data ?? []) as BusinessCaseCommentRow[];
          if (!active) return;
          setComments(nextComments);

          const authorIds = Array.from(new Set(nextComments.map((item) => item.author_id)));
          if (authorIds.length > 0) {
            const authorProfiles = await (supabase as any)
              .from("profiles")
              .select("id, full_name")
              .in("id", authorIds);
            if (authorProfiles.error) throw authorProfiles.error;
            if (!active) return;
            const authorMap = ((authorProfiles.data ?? []) as Array<{ id: string; full_name: string | null }>).reduce<
              Record<string, string>
            >((acc, profile) => {
              acc[profile.id] = profile.full_name?.trim() || "Manager";
              return acc;
            }, {});
            setAuthorNameById(authorMap);
          } else {
            setAuthorNameById({});
          }
        } else {
          setComments([]);
          setAuthorNameById({});
        }
      } catch (error) {
        const message = getSafeErrorMessage(
          error,
          "Failed to load manager collaboration data.",
        );
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPanelData();
    return () => {
      active = false;
    };
  }, [engineerId]);

  async function saveFeedback() {
    if (!userId || !feedbackDraft.trim()) return;
    const feedbackContent = feedbackDraft.trim();
    const { error } = await (supabase as any).from("manager_feedback").insert({
      engineer_id: engineerId,
      manager_id: userId,
      content: feedbackContent,
    });
    if (error) {
      toast.error(getSafeErrorMessage(error, "Unable to save feedback right now."));
      return;
    }
    await sendNotification({
      data: {
        userId: engineerId,
        type: "feedback",
        title: "Manager added feedback",
        description: `Your manager left notes: "${feedbackContent.slice(0, 96)}${feedbackContent.length > 96 ? "..." : ""}"`,
      },
    });
    setFeedbackDraft("");
    toast.success("Feedback saved");
    const { data } = await (supabase as any)
      .from("manager_feedback")
      .select("id, manager_id, content, created_at")
      .eq("engineer_id", engineerId)
      .order("created_at", { ascending: false });
    setFeedbackRows((data ?? []) as ManagerFeedbackRow[]);
  }

  async function saveResource() {
    if (!userId || !resourceTitle.trim() || !resourceUrl.trim()) return;
    const { error } = await (supabase as any).from("manager_resources").insert({
      engineer_id: engineerId,
      manager_id: userId,
      title: resourceTitle.trim(),
      url: resourceUrl.trim(),
      description: resourceDescription.trim() || null,
    });
    if (error) {
      toast.error(getSafeErrorMessage(error, "Unable to save resource right now."));
      return;
    }
    setResourceTitle("");
    setResourceUrl("");
    setResourceDescription("");
    toast.success("Resource pinned");
    const { data } = await (supabase as any)
      .from("manager_resources")
      .select("id, title, url, description, created_at")
      .eq("engineer_id", engineerId)
      .order("created_at", { ascending: false });
    setResourceRows((data ?? []) as ManagerResourceRow[]);
  }

  async function saveBusinessCase() {
    if (!userId || !canWriteManagerTabs || !targetRoleTitle.trim()) return;
    if (businessCase?.id) {
      const { error } = await (supabase as any)
        .from("business_cases")
        .update({
          target_role_title: targetRoleTitle.trim(),
          executive_summary: executiveSummary.trim() || null,
          competency_gains_summary: competencyGainsSummary.trim() || null,
          status: businessCaseStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessCase.id);
      if (error) {
        toast.error(getSafeErrorMessage(error, "Unable to save business case right now."));
        return;
      }
    } else {
      const { error } = await (supabase as any).from("business_cases").insert({
        engineer_id: engineerId,
        manager_id: userId,
        target_role_title: targetRoleTitle.trim(),
        executive_summary: executiveSummary.trim() || null,
        competency_gains_summary: competencyGainsSummary.trim() || null,
        status: businessCaseStatus,
      });
      if (error) {
        toast.error(getSafeErrorMessage(error, "Unable to save business case right now."));
        return;
      }
    }
    toast.success("Business case saved");
  }

  async function addBusinessCaseComment() {
    if (!businessCase?.id || !commentDraft.trim()) return;
    const { error } = await (supabase as any).from("business_case_comments").insert({
      business_case_id: businessCase.id,
      author_id: userId,
      comment: commentDraft.trim(),
    });
    if (error) {
      toast.error(getSafeErrorMessage(error, "Unable to add comment right now."));
      return;
    }
    setCommentDraft("");
    toast.success("Comment added");
    const { data } = await (supabase as any)
      .from("business_case_comments")
      .select("id, author_id, comment, created_at")
      .eq("business_case_id", businessCase.id)
      .order("created_at", { ascending: false });
    setComments((data ?? []) as BusinessCaseCommentRow[]);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-slate-200 text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <hr className="border-slate-100 my-4" />

      {loading ? (
        <div className="text-sm text-slate-500">Loading manager collaboration panel...</div>
      ) : null}

      {!loading && activeTab === "feedback" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {feedbackRows.length === 0 ? (
              <p className="text-sm text-slate-500">No feedback logged yet.</p>
            ) : (
              feedbackRows.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          {canWriteManagerTabs && (
            <>
              <hr className="border-slate-100 my-4" />
              <textarea
                value={feedbackDraft}
                onChange={(event) => setFeedbackDraft(event.target.value)}
                placeholder="Provide structured technical feedback. What went well? What can be improved? What are the next steps?"
                className="w-full min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => void saveFeedback()}
                className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Save Feedback
              </button>
            </>
          )}
        </div>
      )}

      {!loading && activeTab === "resources" && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {resourceRows.length === 0 ? (
              <p className="text-sm text-slate-500 md:col-span-2">No curated resources yet.</p>
            ) : (
              resourceRows.map((resource) => (
                <div key={resource.id} className="rounded-lg border border-slate-200 p-3">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    {resource.title}
                  </a>
                  {resource.description ? (
                    <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
          {canWriteManagerTabs && (
            <>
              <hr className="border-slate-100 my-4" />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={resourceTitle}
                  onChange={(event) => setResourceTitle(event.target.value)}
                  placeholder="Title"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <input
                  value={resourceUrl}
                  onChange={(event) => setResourceUrl(event.target.value)}
                  placeholder="URL"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <textarea
                  value={resourceDescription}
                  onChange={(event) => setResourceDescription(event.target.value)}
                  placeholder="Description"
                  className="min-h-[90px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all md:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={() => void saveResource()}
                className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Pin Resource
              </button>
            </>
          )}
        </div>
      )}

      {!loading && activeTab === "business_case" && (
        <div className="space-y-4">
          <div className="grid gap-3">
            <input
              value={targetRoleTitle}
              onChange={(event) => setTargetRoleTitle(event.target.value)}
              readOnly={!canWriteManagerTabs}
              placeholder="Target Role Title"
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <textarea
              value={executiveSummary}
              onChange={(event) => setExecutiveSummary(event.target.value)}
              readOnly={!canWriteManagerTabs}
              placeholder="Executive Summary"
              className="min-h-[110px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <textarea
              value={competencyGainsSummary}
              onChange={(event) => setCompetencyGainsSummary(event.target.value)}
              readOnly={!canWriteManagerTabs}
              placeholder="Competency Gains Summary"
              className="min-h-[110px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {canWriteManagerTabs && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={businessCaseStatus}
                  onChange={(event) =>
                    setBusinessCaseStatus(event.target.value === "submitted" ? "submitted" : "draft")
                  }
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="draft">draft</option>
                  <option value="submitted">submitted</option>
                </select>
                <button
                  type="button"
                  onClick={() => void saveBusinessCase()}
                  className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Save Business Case
                </button>
              </div>
            )}
          </div>

          {showCommentModule && (
            <>
              <hr className="border-slate-100 my-4" />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Business Case Comments</h4>
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">No comments yet.</p>
                ) : (
                  comments.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        {authorNameById[item.author_id] ?? "Manager"} ·{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{item.comment}</p>
                    </div>
                  ))
                )}
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Endorsed. John meets all performance criteria for Senior SWE role transitions."
                  className="w-full min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => void addBusinessCaseComment()}
                  disabled={!businessCase?.id}
                  className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
