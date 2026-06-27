import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, RefreshCcw, Save } from "lucide-react";

import { supabase } from "@/lib/supabase";

type BusinessCaseRow = {
  id: string;
  target_role_title: string;
  executive_summary: string | null;
  competency_gains_summary: string | null;
  status: "draft" | "submitted" | "approved";
};

type DossierMetrics = {
  evidenceCount: number;
  activeObjectivesCount: number;
  completedObjectivesCount: number;
  latestReadinessScore: number | null;
  feedbackEntriesCount: number;
};

function buildAutoExecutiveSummary(metrics: DossierMetrics): string {
  const readinessLine =
    metrics.latestReadinessScore === null
      ? "No finalized readiness score is available yet."
      : `Latest readiness score is ${metrics.latestReadinessScore}/100.`;
  return [
    `This engineer has logged ${metrics.evidenceCount} verified evidence records and currently carries ${metrics.activeObjectivesCount} active objectives.`,
    `Completed objective count is ${metrics.completedObjectivesCount}, indicating sustained progression through planned growth tracks.`,
    readinessLine,
  ].join(" ");
}

function buildAutoCompetencySummary(metrics: DossierMetrics): string {
  return [
    `Signal depth includes ${metrics.feedbackEntriesCount} submitted 360 feedback entries combined with objective and evidence trends.`,
    "Recent activity indicates consistent delivery cadence, measurable growth tracking, and readiness trajectory alignment against promotion expectations.",
    "Recommend validating role-level scope examples in the final manager review before submission.",
  ].join(" ");
}

function buildMarkdownPreview(args: {
  targetRoleTitle: string;
  executiveSummary: string;
  competencySummary: string;
  metrics: DossierMetrics;
}) {
  return [
    `# Promotion Compilation Dossier`,
    ``,
    `## Target Role`,
    args.targetRoleTitle || "Not specified",
    ``,
    `## Executive Summary`,
    args.executiveSummary || "No summary drafted yet.",
    ``,
    `## Competency Gains`,
    args.competencySummary || "No competency gains summary drafted yet.",
    ``,
    `## Supporting Metrics`,
    `- Evidence records: ${args.metrics.evidenceCount}`,
    `- Active objectives: ${args.metrics.activeObjectivesCount}`,
    `- Completed objectives: ${args.metrics.completedObjectivesCount}`,
    `- Latest readiness score: ${
      args.metrics.latestReadinessScore === null ? "N/A" : `${args.metrics.latestReadinessScore}/100`
    }`,
    `- Submitted 360 feedback entries: ${args.metrics.feedbackEntriesCount}`,
    ``,
  ].join("\n");
}

export function BusinessCaseTab({ engineerId }: { engineerId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [businessCaseId, setBusinessCaseId] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "submitted" | "approved">("draft");
  const [targetRoleTitle, setTargetRoleTitle] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [competencySummary, setCompetencySummary] = useState("");
  const [metrics, setMetrics] = useState<DossierMetrics>({
    evidenceCount: 0,
    activeObjectivesCount: 0,
    completedObjectivesCount: 0,
    latestReadinessScore: null,
    feedbackEntriesCount: 0,
  });

  useEffect(() => {
    let isActive = true;

    async function loadDossierState() {
      if (!engineerId) return;
      setLoading(true);
      try {
        const [caseResponse, evidenceResponse, objectivesResponse, readinessResponse, feedbackResponse] =
          await Promise.all([
            (supabase as any)
              .from("business_cases")
              .select("id, target_role_title, executive_summary, competency_gains_summary, status")
              .eq("engineer_id", engineerId)
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
            (supabase as any).from("evidence").select("id").eq("user_id", engineerId),
            (supabase as any).from("objectives").select("id, status").eq("user_id", engineerId),
            (supabase as any)
              .from("assessments")
              .select("overall_readiness_score")
              .eq("user_id", engineerId)
              .order("date_completed", { ascending: false })
              .limit(1)
              .maybeSingle(),
            (supabase as any)
              .from("three_sixty_feedback")
              .select("id")
              .eq("engineer_id", engineerId)
              .eq("status", "submitted"),
          ]);

        if (!isActive) return;
        if (caseResponse.error) throw caseResponse.error;
        if (evidenceResponse.error) throw evidenceResponse.error;
        if (objectivesResponse.error) throw objectivesResponse.error;
        if (readinessResponse.error) throw readinessResponse.error;
        if (feedbackResponse.error) throw feedbackResponse.error;

        const caseRow = (caseResponse.data as BusinessCaseRow | null) ?? null;
        const objectives = (objectivesResponse.data ?? []) as Array<{ status: string }>;
        setMetrics({
          evidenceCount: (evidenceResponse.data ?? []).length,
          activeObjectivesCount: objectives.filter((item) => item.status === "In Progress").length,
          completedObjectivesCount: objectives.filter((item) => item.status === "Completed").length,
          latestReadinessScore:
            typeof readinessResponse.data?.overall_readiness_score === "number"
              ? readinessResponse.data.overall_readiness_score
              : null,
          feedbackEntriesCount: (feedbackResponse.data ?? []).length,
        });

        setBusinessCaseId(caseRow?.id ?? null);
        setStatus(caseRow?.status ?? "draft");
        setTargetRoleTitle(caseRow?.target_role_title ?? "");
        setExecutiveSummary(caseRow?.executive_summary ?? "");
        setCompetencySummary(caseRow?.competency_gains_summary ?? "");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load business case compilation data.";
        toast.error(message);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadDossierState();
    return () => {
      isActive = false;
    };
  }, [engineerId]);

  const markdownPreview = useMemo(
    () =>
      buildMarkdownPreview({
        targetRoleTitle,
        executiveSummary,
        competencySummary,
        metrics,
      }),
    [competencySummary, executiveSummary, metrics, targetRoleTitle],
  );

  async function handleGenerateAutoDraft() {
    setGenerating(true);
    try {
      setExecutiveSummary(buildAutoExecutiveSummary(metrics));
      setCompetencySummary(buildAutoCompetencySummary(metrics));
      if (!targetRoleTitle.trim()) {
        setTargetRoleTitle("Senior Software Engineer");
      }
      toast.success("Compilation dossier generated from current engineer signals.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveCase() {
    if (!engineerId || !targetRoleTitle.trim()) {
      toast.error("Target role title is required before saving.");
      return;
    }
    setSaving(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) throw new Error("No active manager session found.");

      if (businessCaseId) {
        const { error } = await (supabase as any)
          .from("business_cases")
          .update({
            target_role_title: targetRoleTitle.trim(),
            executive_summary: executiveSummary.trim() || null,
            competency_gains_summary: competencySummary.trim() || null,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessCaseId);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("business_cases")
          .insert({
            engineer_id: engineerId,
            manager_id: user.id,
            target_role_title: targetRoleTitle.trim(),
            executive_summary: executiveSummary.trim() || null,
            competency_gains_summary: competencySummary.trim() || null,
            status,
          })
          .select("id")
          .single();
        if (error) throw error;
        setBusinessCaseId(data.id as string);
      }
      toast.success("Compilation dossier saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save compilation dossier.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="mt-4 h-40 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <FileText size={14} />
              Compilation Dossier
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">
              Automated Business Case Generator
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleGenerateAutoDraft()}
              disabled={generating}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={13} />
              {generating ? "Generating..." : "Regenerate Draft"}
            </button>
            <button
              type="button"
              onClick={() => void handleSaveCase()}
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={13} />
              {saving ? "Saving..." : "Save Dossier"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={targetRoleTitle}
            onChange={(event) => setTargetRoleTitle(event.target.value)}
            placeholder="Target role title"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value === "approved" ? "approved" : event.target.value === "submitted" ? "submitted" : "draft")
            }
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="draft">draft</option>
            <option value="submitted">submitted</option>
            <option value="approved">approved</option>
          </select>
          <textarea
            value={executiveSummary}
            onChange={(event) => setExecutiveSummary(event.target.value)}
            placeholder="Executive summary"
            className="min-h-[130px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:col-span-2"
          />
          <textarea
            value={competencySummary}
            onChange={(event) => setCompetencySummary(event.target.value)}
            placeholder="Competency gains summary"
            className="min-h-[130px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:col-span-2"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Metrics</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Evidence" value={String(metrics.evidenceCount)} />
          <Metric label="Active Objectives" value={String(metrics.activeObjectivesCount)} />
          <Metric label="Completed Objectives" value={String(metrics.completedObjectivesCount)} />
          <Metric
            label="Readiness"
            value={
              metrics.latestReadinessScore === null ? "N/A" : `${metrics.latestReadinessScore}/100`
            }
          />
          <Metric label="360 Entries" value={String(metrics.feedbackEntriesCount)} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Generated Markdown Preview
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {markdownPreview}
        </pre>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
