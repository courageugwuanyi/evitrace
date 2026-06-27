import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  Paperclip,
  Save,
  X,
} from "lucide-react";
import { useFramework } from "@/context/FrameworkContext";
import { Badge, C, Card, Field, GhostBtn, PrimaryBtn, Select } from "@/features/home/shared/ui-kit";
import { Backdrop, Textarea } from "@/features/home/shared/overlays";
import { type EvidenceRecord } from "@/features/home/shared/models";
import {
  type Assessment,
  type AssessmentWizardDraft,
  type ReviewQuestion,
  type ReviewSession,
  getHistoricalQuestionScores,
} from "@/features/home/assessment/assessment-domain";
import {
  EFFECTIVENESS_SCALE,
  buildFrameworkCategoryMapFromContext,
  type FrameworkCategoryMap,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import { generateSafeId } from "@/lib/utils/generateSafeId";

export function ReviewWizard({
  evidence,
  onClose,
  onFinalize,
  onOpenEvidence,
  latestAssessment,
  initialDraft,
  engineerName,
  managerName,
  onSaveDraft,
}: {
  evidence: EvidenceRecord[];
  onClose: () => void;
  onFinalize: (s: ReviewSession) => void;
  onOpenEvidence: (e: EvidenceRecord) => void;
  latestAssessment: Assessment | undefined;
  initialDraft: AssessmentWizardDraft | null;
  engineerName: string;
  managerName: string;
  onSaveDraft: (draft: AssessmentWizardDraft) => void;
}) {
  const { categories: frameworkCategories, getQuestionsForCategory } = useFramework();
  const categoryMap = useMemo(() => {
    if (frameworkCategories.length > 0) {
      return buildFrameworkCategoryMapFromContext(frameworkCategories, getQuestionsForCategory);
    }
    if (latestAssessment) {
      return latestAssessment.categories.reduce<FrameworkCategoryMap>((acc, category) => {
        acc[category.categoryName] = {
          summary: category.summary ?? "",
          items: category.questions.map((question) => question.questionText),
        };
        return acc;
      }, {});
    }
    return {};
  }, [frameworkCategories, getQuestionsForCategory, latestAssessment]);
  const categoryEntries = useMemo(() => Object.entries(categoryMap), [categoryMap]);
  const categories = useMemo(
    () => categoryEntries.map(([categoryName]) => categoryName),
    [categoryEntries],
  );
  const [activeIdx, setActiveIdx] = useState(initialDraft?.activeIdx ?? 0);
  const [scores, setScores] = useState<Record<string, Record<string, ReviewQuestion>>>(() => {
    if (initialDraft?.scores) {
      return initialDraft.scores;
    }
    const init: Record<string, Record<string, ReviewQuestion>> = {};
    categories.forEach((cat) => {
      init[cat] = {};
      (categoryMap[cat]?.items ?? []).forEach((sub) => {
        const historical = getHistoricalQuestionScores(latestAssessment, cat, sub);
        const prev = historical.previous;
        init[cat][sub] = {
          prev,
          next: historical.current,
          notes: historical.note,
          evidenceIds: [],
        };
      });
    });
    return init;
  });
  const [attachOpenFor, setAttachOpenFor] = useState<string | null>(null);
  const [showUnsavedExitDialog, setShowUnsavedExitDialog] = useState(false);
  const initialScoresSnapshotRef = useRef<string | null>(null);

  const activeCat = categories[activeIdx];
  const isLast = activeIdx === categories.length - 1;
  const isDirty =
    initialScoresSnapshotRef.current != null &&
    JSON.stringify(scores) !== initialScoresSnapshotRef.current;

  useEffect(() => {
    if (initialScoresSnapshotRef.current == null) {
      initialScoresSnapshotRef.current = JSON.stringify(scores);
    }
  }, [scores]);

  useEffect(() => {
    if (categories.length === 0) return;
    setActiveIdx((prev) => (prev >= categories.length ? categories.length - 1 : prev));
    setScores((previous) => {
      const next: Record<string, Record<string, ReviewQuestion>> = {};
      categories.forEach((category) => {
        next[category] = {};
        (categoryMap[category]?.items ?? []).forEach((item) => {
          const existing = previous[category]?.[item];
          if (existing) {
            next[category][item] = existing;
            return;
          }
          const historical = getHistoricalQuestionScores(latestAssessment, category, item);
          next[category][item] = {
            prev: historical.previous,
            next: historical.current,
            notes: historical.note,
            evidenceIds: [],
          };
        });
      });
      return next;
    });
  }, [categories, categoryMap, latestAssessment]);

  function updateQ(cat: string, sub: string, patch: Partial<ReviewQuestion>) {
    setScores((s) => ({
      ...s,
      [cat]: { ...s[cat], [sub]: { ...s[cat][sub], ...patch } },
    }));
  }

  function toggleEvidence(cat: string, sub: string, id: string) {
    setScores((s) => {
      const existing = s[cat][sub].evidenceIds;
      const next = existing.includes(id) ? existing.filter((x) => x !== id) : [...existing, id];
      return { ...s, [cat]: { ...s[cat], [sub]: { ...s[cat][sub], evidenceIds: next } } };
    });
  }

  function categoryProgress(cat: string): number {
    const subs = scores[cat] ?? {};
    const total = Object.keys(subs).length;
    if (total === 0) return 0;
    const touched = Object.values(subs).filter(
      (q) => q.next !== q.prev || q.notes.trim().length > 0,
    ).length;
    return Math.round((touched / total) * 100);
  }

  function finalize() {
    const today = new Date();
    const session: ReviewSession = {
      id: generateSafeId(),
      date: formatDisplayDate(today),
      period: `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`,
      engineer: engineerName,
      manager: managerName,
      scores,
    };
    onFinalize(session);
  }

  function saveDraft() {
    onSaveDraft({
      activeIdx,
      scores,
      savedAt: new Date().toISOString(),
    });
    onClose();
  }

  function requestClose() {
    if (isDirty) {
      setShowUnsavedExitDialog(true);
      return;
    }
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(9, 30, 66, 0.54)" }}
    >
      <motion.div
        className="w-full h-full flex flex-col"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{ background: C.bg }}
      >
        {/* Top bar */}
        <div
          className="h-14 px-6 flex items-center justify-between border-b bg-white"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <ClipboardList size={16} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight" style={{ color: C.navy }}>
                Performance Review Session
              </div>
              <div className="text-[11px]" style={{ color: C.subtle }}>
                Score each subcategory on the 1–5 effectiveness scale and add justification notes.
              </div>
            </div>
          </div>
          <button
            onClick={requestClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]"
            style={{ color: C.subtle }}
            aria-label="Close wizard"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex max-w-6xl w-full mx-auto p-6 gap-6">
          {/* Left stepper */}
          <aside
            className="w-64 shrink-0 bg-white border rounded shadow-sm flex flex-col"
            style={{ borderColor: C.border }}
          >
            <div
              className="px-4 py-3 border-b text-[11px] uppercase tracking-wider font-bold"
              style={{ borderColor: C.border, color: C.subtle }}
            >
              Categories
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {categories.map((cat, i) => {
                const active = i === activeIdx;
                const pct = categoryProgress(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveIdx(i)}
                    className="w-full text-left px-3 py-2.5 rounded transition-colors"
                    style={{
                      background: active ? C.primarySoft : "transparent",
                      color: active ? C.primary : C.slate,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                        Step {i + 1}
                      </span>
                      {pct === 100 && <CheckCircle size={13} style={{ color: C.green }} />}
                    </div>
                    <div className="text-sm font-semibold mt-0.5 leading-snug">{cat}</div>
                    <div
                      className="mt-1.5 h-1 rounded-full overflow-hidden"
                      style={{ background: "#EBECF0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: active ? C.primary : C.green }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="mb-4">
                <div
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: C.subtle }}
                >
                  Category {activeIdx + 1} of {categories.length}
                </div>
                <h2 className="text-2xl font-bold tracking-tight mt-1" style={{ color: C.navy }}>
                  {activeCat}
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: C.slate }}>
                  {categoryMap[activeCat]?.summary || "No summary provided."}
                </p>
              </div>

              <div className="space-y-4">
                {(categoryMap[activeCat]?.items ?? []).map((sub) => {
                  const q = scores[activeCat]?.[sub];
                  if (!q) return null;
                  const attachOpen = attachOpenFor === `${activeCat}::${sub}`;
                  return (
                    <Card key={sub} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: C.subtle }}
                          >
                            Question
                          </div>
                          <div className="text-[15px] font-semibold mt-1" style={{ color: C.navy }}>
                            {sub}
                          </div>
                        </div>
                        <Badge tone="neutral">Previous Score: {q.prev}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Field label="New score (1-5)">
                          <Select
                            value={String(q.next)}
                            onChange={(e) =>
                              updateQ(activeCat, sub, { next: Number(e.target.value) })
                            }
                          >
                            {EFFECTIVENESS_SCALE.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.value} - {s.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Change vs previous">
                          <div
                            className="h-9 px-3 flex items-center text-sm rounded border"
                            style={{
                              background: "#F4F5F7",
                              borderColor: C.border,
                              color: q.next > q.prev ? C.green : q.next < q.prev ? C.red : C.subtle,
                              fontWeight: 600,
                            }}
                          >
                            {q.next === q.prev
                              ? "No change"
                              : `${q.prev} → ${q.next} (${q.next > q.prev ? "+" : ""}${q.next - q.prev})`}
                          </div>
                        </Field>
                      </div>

                      <div className="mt-4">
                        <Field label="Manager & Engineer notes / justification">
                          <Textarea
                            rows={3}
                            placeholder="Document examples, behaviors, and rationale for this score..."
                            value={q.notes}
                            onChange={(e) => updateQ(activeCat, sub, { notes: e.target.value })}
                          />
                        </Field>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setAttachOpenFor(attachOpen ? null : `${activeCat}::${sub}`)
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded border hover:border-[#0052CC] transition-colors"
                          style={{ borderColor: C.border, color: C.primary }}
                        >
                          <Paperclip size={13} />
                          Attach Evidence
                          {q.evidenceIds.length > 0 ? ` (${q.evidenceIds.length})` : ""}
                        </button>
                        {q.evidenceIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {q.evidenceIds.map((id) => {
                              const ev = evidence.find((e) => e.id === id);
                              if (!ev) return null;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => onOpenEvidence(ev)}
                                  title={`${ev.id} - ${ev.title}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                >
                                  <ExternalLink size={10} />
                                  {ev.id}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {attachOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 border-t pt-3 space-y-1.5 max-h-56 overflow-y-auto"
                            style={{ borderColor: C.border }}
                          >
                            {(() => {
                              const subLower = sub.toLowerCase();
                              const filtered = evidence.filter(
                                (ev) =>
                                  ev.category === activeCat ||
                                  ev.competency === activeCat ||
                                  subLower.includes(ev.competency.toLowerCase()) ||
                                  ev.competency.toLowerCase().includes(subLower),
                              );
                              if (filtered.length === 0) {
                                return (
                                  <div
                                    className="px-2 py-3 text-[12px] text-center"
                                    style={{ color: C.subtle }}
                                  >
                                    No evidence mapped to this question yet.
                                  </div>
                                );
                              }
                              return filtered.map((ev) => {
                                const checked = q.evidenceIds.includes(ev.id);
                                return (
                                  <label
                                    key={ev.id}
                                    className="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#F4F5F7]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleEvidence(activeCat, sub, ev.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className="text-[13px] font-semibold truncate"
                                        style={{ color: C.navy }}
                                      >
                                        {ev.title}
                                      </div>
                                      <div className="text-[11px]" style={{ color: C.subtle }}>
                                        {ev.id} · {ev.source} · {formatDisplayDate(ev.date)}
                                      </div>
                                    </div>
                                  </label>
                                );
                              });
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className="mt-4 -mx-6 px-6 py-3 border-t bg-white flex items-center justify-between"
              style={{ borderColor: C.border }}
            >
              <div className="flex items-center gap-2">
                <GhostBtn onClick={requestClose}>
                  <X size={14} />
                  Cancel
                </GhostBtn>
                <GhostBtn onClick={saveDraft}>
                  <Save size={14} />
                  Save Draft
                </GhostBtn>
              </div>
              <div className="flex items-center gap-2">
                <GhostBtn
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                >
                  <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                  Previous
                </GhostBtn>
                {!isLast && (
                  <PrimaryBtn
                    onClick={() => setActiveIdx((i) => Math.min(categories.length - 1, i + 1))}
                  >
                    Next Category
                    <ChevronRight size={14} />
                  </PrimaryBtn>
                )}
                {isLast && (
                  <PrimaryBtn onClick={finalize}>
                    <FileCheck2 size={14} />
                    Complete & Finalize Assessment
                  </PrimaryBtn>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showUnsavedExitDialog && (
            <Backdrop onClose={() => setShowUnsavedExitDialog(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
                style={{ borderColor: C.border }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold" style={{ color: C.navy }}>
                        Unsaved changes
                      </div>
                      <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                        You have unsaved changes. Closing this without saving your draft will result
                        in lost data. Are you sure you want to exit?
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="px-5 py-3 border-t flex items-center justify-end gap-2"
                  style={{ borderColor: C.border, background: C.bg }}
                >
                  <GhostBtn onClick={() => setShowUnsavedExitDialog(false)}>Cancel</GhostBtn>
                  <GhostBtn
                    onClick={() => {
                      setShowUnsavedExitDialog(false);
                      saveDraft();
                    }}
                  >
                    <Save size={14} />
                    Save Draft
                  </GhostBtn>
                  <button
                    onClick={() => {
                      setShowUnsavedExitDialog(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors"
                    style={{ background: C.red }}
                  >
                    Exit Anyway
                  </button>
                </div>
              </motion.div>
            </Backdrop>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
