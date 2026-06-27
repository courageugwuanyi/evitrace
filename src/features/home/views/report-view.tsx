import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlignLeft,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Download,
  ExternalLink,
  FileCheck2,
  History,
  Layers,
  Link as LinkIcon,
  ListTodo,
  MessageSquare,
  Plus,
  Radar as RadarIcon,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { C, Card, GhostBtn, PrimaryBtn, Badge } from "@/features/home/shared/ui-kit";
import { type EvidenceRecord, type Objective } from "@/features/home/shared/models";
import { useFramework } from "@/context/FrameworkContext";
import {
  DEFAULT_EFFECTIVENESS_WEIGHT,
  buildFrameworkCategoryMapFromContext,
  resolveCategoryFromFramework,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import { AssessmentsArchiveTable } from "@/features/home/assessment/assessment-history";
import type { Assessment, ReviewSession } from "@/features/home/assessment/assessment-domain";
import { type InboxViewItem } from "@/features/home/shell/home-route-contracts";
import {
  buildCategoryPerformance,
  buildHighlightedEvidence,
  buildReportDeltas,
  buildReportJustification,
  computeOverallReadiness,
  formatCategoryNames,
} from "@/features/home/views/report-view-model";

type ReportViewProps = {
  evidence: EvidenceRecord[];
  objectives: Objective[];
  radarData: unknown;
  onFlash: (m: string) => void;
  review: ReviewSession | null;
  assessments: Assessment[];
  historyAssessments: Assessment[];
  selectedEngineerId: string | null;
  onOpenAssessment: (a: Assessment) => void;
  onSaveTopics: (assessmentId: string, topics: string[]) => void;
  onDeleteHistoryAssessment: (assessmentId: string) => void;
  onClearReview: () => void;
  onStartReview: () => void;
  onOpenHistory: () => void;
};

export function ReportView({
  evidence,
  objectives,
  radarData: _radarData,
  onFlash,
  review,
  assessments,
  historyAssessments,
  selectedEngineerId: _selectedEngineerId,
  onOpenAssessment,
  onSaveTopics,
  onDeleteHistoryAssessment,
  onClearReview,
  onStartReview,
  onOpenHistory,
}: ReportViewProps) {
  const { categories, getQuestionsForCategory } = useFramework();
  const frameworkCategoryMap = useMemo(
    () => buildFrameworkCategoryMapFromContext(categories, getQuestionsForCategory),
    [categories, getQuestionsForCategory],
  );
  const categoryEntries = useMemo(() => Object.entries(frameworkCategoryMap), [frameworkCategoryMap]);
  const frameworkCategoryNames = useMemo(
    () => categoryEntries.map(([categoryName]) => categoryName),
    [categoryEntries],
  );
  const approved = evidence.filter((e) => e.status === "Reviewed" && !e.isArchived);
  const completed = objectives.filter((o) => o.status === "Completed");
  const upcoming = objectives.filter((o) => o.status !== "Completed");

  const deltas = useMemo(() => buildReportDeltas(review), [review]);
  const justification = useMemo(() => buildReportJustification(review), [review]);
  const highlightedEvidence = useMemo(() => buildHighlightedEvidence(review, evidence), [review, evidence]);
  const overallReadiness = useMemo(() => computeOverallReadiness(review), [review]);

  const categoriesForSummary = frameworkCategoryNames.length
    ? frameworkCategoryNames
    : Object.keys(review?.scores ?? {});
  const categoryPerformance = useMemo(
    () =>
      buildCategoryPerformance({
        review,
        categoriesForSummary,
        approvedEvidence: approved,
      }),
    [approved, categoriesForSummary, review],
  );
  const topStrengthCategories = useMemo(
    () => categoryPerformance.slice(0, 2).map((row) => row.name),
    [categoryPerformance],
  );
  const lowestOpportunityCategories = useMemo(
    () =>
      [...categoryPerformance]
        .reverse()
        .slice(0, 1)
        .map((row) => row.name),
    [categoryPerformance],
  );

  const [topics, setTopics] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [topicsDirty, setTopicsDirty] = useState(false);
  const isPersistedAssessment = useMemo(
    () => (review ? assessments.some((item) => item.id === review.id) : false),
    [assessments, review],
  );

  useEffect(() => {
    if (!review) return;
    const selected = assessments.find((a) => a.id === review.id);
    setTopics(selected?.oneOnOneTopics ?? []);
    setTopicsDirty(false);
  }, [review, assessments]);

  type LearningResource = {
    id: string;
    competency: string;
    title: string;
    url: string;
    notes: string;
  };
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  function addTopic() {
    const t = draft.trim();
    if (!t) return;
    setTopics((x) => [...x, t]);
    setTopicsDirty(true);
    setDraft("");
  }

  function removeTopic(i: number) {
    setTopics((x) => x.filter((_, idx) => idx !== i));
    setTopicsDirty(true);
  }

  function copyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href + "?report=q3-2026").catch(() => {});
    }
    onFlash("Share link copied to clipboard");
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between print-hide">
          <div className="text-sm" style={{ color: C.subtle }}>
            Archive of all performance assessments. Click any row to load its full report.
          </div>
          <div className="flex items-center gap-2">
            <GhostBtn onClick={onOpenHistory}>
              <History size={14} />
              Open in modal
            </GhostBtn>
            <PrimaryBtn onClick={onStartReview} className="!px-6 !h-10 whitespace-nowrap">
              <ClipboardList size={14} />
              Start Performance Review
            </PrimaryBtn>
          </div>
        </div>

        <AssessmentsArchiveTable
          assessments={historyAssessments}
          onOpen={onOpenAssessment}
          onDelete={onDeleteHistoryAssessment}
        />

        {historyAssessments.length === 0 && (
          <Card className="p-10 text-center max-w-2xl mx-auto">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <FileCheck2 size={26} />
            </div>
            <h3 className="text-lg font-bold tracking-tight" style={{ color: C.navy }}>
              No finalized performance review yet
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.slate }}>
              Click "Start Performance Review" above to launch the wizard. Once finalized, this page
              auto-generates a shareable summary with the competency delta, justification notes,
              highlighted evidence, and a 1-on-1 talking points checklist.
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print-hide gap-3">
        <GhostBtn onClick={onClearReview} className="-ml-2">
          <ArrowLeft size={14} />
          Back to Assessments Archive
        </GhostBtn>
        <PrimaryBtn onClick={onStartReview} className="!px-6 !h-10 whitespace-nowrap">
          <ClipboardList size={14} />
          Start Performance Review
        </PrimaryBtn>
      </div>

      <article
        className="max-w-4xl mx-auto bg-white border rounded shadow-md p-10 print-document print:w-full print:m-0 print:p-0 print:text-slate-900 print:border-slate-200"
        style={{ borderColor: C.border }}
      >
        <header className="print:break-inside-avoid">
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                style={{ background: C.primary }}
              >
                <RadarIcon size={18} color="#fff" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: C.navy }}>
                {review.period}
              </h1>
            </div>
            <div className="flex items-center gap-2 print-hide">
              <GhostBtn onClick={copyLink} className="border">
                <LinkIcon size={14} />
                Copy Share Link
              </GhostBtn>
              <GhostBtn onClick={() => window.print()} className="border">
                <Download size={14} />
                Export to PDF
              </GhostBtn>
            </div>
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: C.subtle }}>
            Evitrace Performance Report
          </div>
          <div className="mt-3 space-y-1 text-sm" style={{ color: C.slate }}>
            <div>
              Engineer: <span style={{ color: C.navy, fontWeight: 600 }}>{review.engineer}</span>
              {"  |  "}Role: L3 Engineer{"  |  "}Target: L4 Senior Engineer
            </div>
            <div>
              Manager: <span style={{ color: C.navy, fontWeight: 600 }}>{review.manager}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: C.subtle }} />
              Period: {review.period} · Finalized {review.date}
            </div>
          </div>
          <div className="mt-6 border-t" style={{ borderColor: C.border }} />
        </header>

        <section className="mt-8 print:break-inside-avoid">
          <SectionHeading icon={<Target size={18} />} title="Executive Summary" />
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.slate }}>
            Based on your logged milestones, your core operational strengths are demonstrated within{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>
              {formatCategoryNames(
                topStrengthCategories,
                formatCategoryNames(categoriesForSummary.slice(0, 2), "your active framework"),
              )}
            </span>
            , while your primary expansion opportunities sit within{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>
              {formatCategoryNames(
                lowestOpportunityCategories,
                formatCategoryNames(categoriesForSummary.slice(-1), "the current framework baseline"),
              )}
            </span>
            . Current readiness remains{" "}
            <span style={{ color: C.primary, fontWeight: 700 }}>{overallReadiness ?? 0}%</span> with{" "}
            {approved.length} verified evidence item{approved.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<TrendingUp size={18} />} title="Competency Delta" />
          {deltas.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No score changes were recorded in this review.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 print:break-inside-avoid">
              {deltas.map((d) => {
                const pct = d.from === 0 ? 0 : Math.round(((d.to - d.from) / d.from) * 100);
                const width = Math.min(100, (d.to / 4) * 100);
                const positive = d.to >= d.from;
                return (
                  <div key={d.name} className="print:break-inside-avoid">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="text-sm font-semibold" style={{ color: C.navy }}>
                        {d.name}
                      </div>
                      <div className="text-xs font-medium" style={{ color: C.slate }}>
                        {d.from.toFixed(2)} → {d.to.toFixed(2)}{" "}
                        <span style={{ color: positive ? C.green : C.red, fontWeight: 700 }}>
                          {positive ? "+" : ""}
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "#EBECF0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, background: positive ? C.green : C.red }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<Layers size={18} />} title="Framework Category Summary" />
          <div className="mt-4 grid grid-cols-1 gap-4">
            {categoriesForSummary.map((categoryName) => {
              const categoryScores = Object.values(review.scores[categoryName] ?? {});
              const avgCurrent =
                categoryScores.length > 0
                  ? +(categoryScores.reduce((sum, score) => sum + score.next, 0) / categoryScores.length).toFixed(
                      2,
                    )
                  : DEFAULT_EFFECTIVENESS_WEIGHT;
              const mappedEvidence = approved.filter((record) => {
                const matched =
                  resolveCategoryFromFramework(record.category ?? "", categoriesForSummary) ??
                  resolveCategoryFromFramework(record.competency ?? "", categoriesForSummary);
                return matched === categoryName;
              });
              const expectationCount = frameworkCategoryMap[categoryName]?.items.length ?? 0;
              return (
                <div key={categoryName} className="rounded border p-4" style={{ borderColor: C.border }}>
                  <div className="text-sm font-semibold" style={{ color: C.navy }}>
                    {categoryName}
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.subtle }}>
                    {frameworkCategoryMap[categoryName]?.summary || "No summary provided."}
                  </div>
                  <div className="text-xs mt-2" style={{ color: C.slate }}>
                    Avg Score: {avgCurrent.toFixed(2)} / 5 · Evidence Logged: {mappedEvidence.length} · Rubric
                    Items: {expectationCount}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 print:break-before-page print:break-inside-avoid">
          <SectionHeading icon={<AlignLeft size={18} />} title="Justification Notes Log" />
          {justification.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No justification notes were attached to changed scores.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {justification.map(({ cat, sub, q }, i) => (
                <li
                  key={i}
                  className="p-4 rounded border print:break-inside-avoid"
                  style={{ borderColor: C.border, background: "#FFFFFF" }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="info">{cat}</Badge>
                    <span className="text-xs font-semibold" style={{ color: C.navy }}>
                      {sub}
                    </span>
                    <span className="text-xs" style={{ color: C.subtle }}>
                      {q.prev} → {q.next}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: C.slate }}>
                    {q.notes}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<Award size={18} />} title="Highlighted Evidence" />
          {highlightedEvidence.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No evidence was attached during the review.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {highlightedEvidence.map((e) => (
                <div
                  key={e.id}
                  className="border-l-4 pl-4 py-3 pr-4 rounded-sm print:break-inside-avoid"
                  style={{ borderColor: C.primary, background: "#FAFBFC" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] font-bold" style={{ color: C.navy }}>
                      {e.title}
                    </div>
                    <Badge tone="info">{e.competency}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.slate }}>
                    {e.description}
                  </p>
                  <div
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: "#006644" }}
                  >
                    <CheckCircle size={13} />
                    Verified on {formatDisplayDate(e.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <div className="flex items-start justify-between gap-3">
            <SectionHeading icon={<BookOpen size={18} />} title="Suggested Learning Resources" />
            <GhostBtn
              onClick={() => setResourceModalOpen(true)}
              className="border print-hide"
              style={{ borderColor: C.border }}
            >
              <Plus size={14} />
              Add Learning Resource
            </GhostBtn>
          </div>
          <p className="mt-2 text-sm" style={{ color: C.subtle }}>
            Resources curated by the manager to address competencies rated below target.
          </p>
          {resources.length === 0 ? (
            <div
              className="mt-4 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No learning resources added yet. Click "Add Learning Resource" to curate materials for
              the engineer.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {resources.map((r) => (
                <li
                  key={r.id}
                  className="p-4 rounded border flex items-start justify-between gap-4 print:break-inside-avoid"
                  style={{ borderColor: C.border, background: "#FFFFFF" }}
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit"
                      style={{ background: C.primarySoft, color: C.primary }}
                    >
                      {r.competency}
                    </span>
                    <div className="mt-2 text-[15px] font-bold text-slate-900">{r.title}</div>
                    {r.notes && (
                      <div className="mt-1 text-sm text-slate-500 leading-relaxed">{r.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 print-hide">
                    <button
                      type="button"
                      onClick={() => window.open(r.url, "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-semibold rounded border transition-colors hover:bg-[#F4F5F7]"
                      style={{ borderColor: C.primary, color: C.primary }}
                    >
                      <ExternalLink size={14} />
                      Open Resource
                    </button>
                    <button
                      type="button"
                      onClick={() => setResources((rs) => rs.filter((x) => x.id !== r.id))}
                      aria-label="Remove resource"
                      className="w-9 h-9 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-[#F4F5F7] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<ListTodo size={18} />} title="Active Objectives" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ObjectiveColumn
              label="Completed This Period"
              tone="success"
              items={completed}
              emptyText="No objectives completed this period."
            />
            <ObjectiveColumn
              label="Focus for Next Period"
              tone="info"
              items={upcoming}
              emptyText="No active objectives planned."
            />
          </div>
        </section>

        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<MessageSquare size={18} />} title="1-on-1 Discussion Topics" />
          <div
            className="mt-4 p-5 rounded border print:break-inside-avoid"
            style={{ background: C.bg, borderColor: C.border }}
          >
            <ol className="space-y-2.5">
              {topics.map((t, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 text-sm print:break-inside-avoid"
                  style={{ color: C.slate }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
                    style={{ background: C.primarySoft, color: C.primary }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed flex-1">{t}</span>
                  <button
                    onClick={() => removeTopic(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: C.subtle }}
                    aria-label="Remove topic"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTopic();
                }}
                placeholder="Add a discussion topic..."
                className="flex-1 h-9 px-3 text-sm rounded border bg-white focus:outline-none"
                style={{ borderColor: C.border, color: C.navy }}
              />
              <GhostBtn onClick={addTopic}>
                <Plus size={14} />
                Add Topic
              </GhostBtn>
              <PrimaryBtn
                disabled={!topicsDirty || !isPersistedAssessment}
                onClick={() => {
                  if (!review || !isPersistedAssessment) return;
                  onSaveTopics(review.id, topics);
                  setTopicsDirty(false);
                }}
              >
                <Save size={14} />
                Save Topics
              </PrimaryBtn>
            </div>
            {!isPersistedAssessment && review && (
              <div className="mt-2 text-xs" style={{ color: C.subtle }}>
                Sample assessments are read-only. Finalize a live assessment to persist 1-on-1 topics.
              </div>
            )}
          </div>
        </section>

        <footer
          className="mt-10 pt-6 border-t text-xs flex items-center justify-between"
          style={{ borderColor: C.border, color: C.subtle }}
        >
          <span>Generated by Evitrace · Confidential</span>
          <span>Report ID · {review.id}</span>
        </footer>
      </article>
      <AnimatePresence>
        {resourceModalOpen && (
          <LearningResourceModal
            competencies={categoriesForSummary}
            onCancel={() => setResourceModalOpen(false)}
            onSave={(r) => {
              setResources((rs) => [...rs, { ...r, id: `lr-${Date.now()}` }]);
              setResourceModalOpen(false);
              onFlash("Learning resource added");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LearningResourceModal({
  competencies,
  onCancel,
  onSave,
}: {
  competencies: string[];
  onCancel: () => void;
  onSave: (r: { competency: string; title: string; url: string; notes: string }) => void;
}) {
  const { categories: frameworkCategories } = useFramework();
  const options =
    competencies.length > 0
      ? competencies
      : frameworkCategories.length > 0
        ? frameworkCategories
        : [];
  const [competency, setCompetency] = useState(options[0] ?? "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const canSave = title.trim() && url.trim() && competency;

  useEffect(() => {
    if (!options.includes(competency)) {
      setCompetency(options[0] ?? "");
    }
  }, [competency, options]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(9, 30, 66, 0.54)", backdropFilter: "blur(2px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b" style={{ borderColor: C.border }}>
          <div className="text-base font-bold" style={{ color: C.navy }}>
            Add Learning Resource
          </div>
          <div className="text-sm mt-1" style={{ color: C.slate }}>
            Curate a resource to help close the gap on a target competency.
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Target Competency
            </label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            >
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Resource Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Designing Data-Intensive Applications"
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Resource URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Manager Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this resource, and what to focus on..."
              className="mt-1.5 w-full min-h-[150px] resize-y rounded border bg-white p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
        </div>
        <div
          className="px-5 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
          <button
            onClick={() =>
              canSave &&
              onSave({ competency, title: title.trim(), url: url.trim(), notes: notes.trim() })
            }
            disabled={!canSave}
            className="px-4 h-9 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: C.primary }}
          >
            Save Resource
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: C.primary }}>{icon}</span>
      <h2 className="text-lg font-bold tracking-tight" style={{ color: C.navy }}>
        {title}
      </h2>
    </div>
  );
}

function ObjectiveColumn({
  label,
  tone,
  items,
  emptyText,
}: {
  label: string;
  tone: "success" | "info";
  items: Objective[];
  emptyText: string;
}) {
  return (
    <div>
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-2"
        style={{ color: C.subtle }}
      >
        {label}
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div
            className="text-sm p-3 rounded border border-dashed"
            style={{ color: C.subtle, borderColor: C.border }}
          >
            {emptyText}
          </div>
        )}
        {items.map((o) => (
          <div
            key={o.id}
            className="p-3 rounded border print:break-inside-avoid"
            style={{ borderColor: C.border, background: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold leading-snug" style={{ color: C.navy }}>
                {o.title}
              </div>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit shrink-0"
                style={{
                  background: tone === "success" ? C.greenSoft : C.primarySoft,
                  color: tone === "success" ? "#006644" : C.primary,
                }}
              >
                {o.status}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs" style={{ color: C.subtle }}>
              <span className="inline-flex items-center gap-1">
                <Target size={12} />
                {o.competency}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                Due {o.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
