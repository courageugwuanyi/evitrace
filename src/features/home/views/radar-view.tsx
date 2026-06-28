import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFramework } from "@/context/FrameworkContext";
import { C, Card, GhostBtn, PrimaryBtn } from "@/features/home/shared/ui-kit";
import {
  DEFAULT_EFFECTIVENESS_WEIGHT,
  EFFECTIVENESS_SCALE,
  type FrameworkCategoryMap,
  buildFrameworkCategoryMapFromContext,
  normalizeCategoryName,
  resolveCategoryFromFramework,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import {
  type Assessment,
  type AssessmentWizardDraft,
  deriveRadarData,
  getHistoricalQuestionScores,
  calculateScoreDelta,
} from "@/features/home/assessment/assessment-domain";
import type { EvidenceRecord, Objective } from "@/features/home/shared/models";
import {
  Info,
  ClipboardList,
  Trash2,
  History,
  Award,
  AlertTriangle,
  UserCheck,
  Radar as RadarIcon,
  BarChartHorizontal,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CustomRadarTick = (props: any) => {
  const { x, y, payload, cx, cy } = props;
  const value = payload?.value ?? "";
  const fullLabel = String(value);
  const maxLabelLength = 18;
  const displayLabel =
    fullLabel.length > maxLabelLength ? `${fullLabel.slice(0, maxLabelLength - 1)}…` : fullLabel;

  let textAnchor: "start" | "middle" | "end" = "middle";
  if (x > cx + 10) textAnchor = "start";
  if (x < cx - 10) textAnchor = "end";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <title>{fullLabel}</title>
      <text
        textAnchor={textAnchor}
        fill="#4b5563"
        fontSize={11}
        className="font-medium cursor-help"
        style={{ pointerEvents: "all" }}
      >
        <tspan x={0} dy={0}>
          {displayLabel}
        </tspan>
      </text>
    </g>
  );
};

function SectionHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div className="min-w-0">
        <div className="text-sm font-bold" style={{ color: C.navy }}>
          {title}
        </div>
        {sub && (
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {sub}
          </div>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} style={style}>
      {children}
    </td>
  );
}

function HierarchicalMatrix({
  data,
  latest,
  previousCompleted,
  evidence,
  objectives,
  categoryMap,
  selectedEngineerId,
  onCreateObjective,
}: {
  data: ReturnType<typeof deriveRadarData>;
  latest: Assessment | undefined;
  previousCompleted: Assessment | undefined;
  evidence: EvidenceRecord[];
  objectives: Objective[];
  categoryMap: FrameworkCategoryMap;
  selectedEngineerId: string | null;
  onCreateObjective: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isManagerWorkspace = Boolean(selectedEngineerId);
  const [showUnmappedHistory, setShowUnmappedHistory] = useState(false);
  const categoryEntries = useMemo(() => Object.entries(categoryMap), [categoryMap]);
  const categoryNames = useMemo(
    () => categoryEntries.map(([category]) => category),
    [categoryEntries],
  );

  const changeLozenge = (delta: number) =>
    delta > 0
      ? "bg-green-100 text-green-800"
      : delta < 0
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-800";

  const gapLozenge = (gap: number) =>
    gap <= 0
      ? "bg-green-100 text-green-800"
      : gap >= 1
        ? "bg-red-100 text-red-800"
        : gap >= 0.5
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-800";

  const calculateProgressTowardsTarget = (previous: number, current: number, target: number) => {
    const remainingGap = target - previous;
    if (Math.abs(remainingGap) < 0.001) {
      return current === target ? 100 : 0;
    }
    return +(((current - previous) / remainingGap) * 100).toFixed(1);
  };

  const unmappedHistory = useMemo(() => {
    const unmappedAssessmentCategories = (latest?.categories ?? []).filter(
      (category) =>
        !categoryNames.some(
          (activeCategory) =>
            normalizeCategoryName(activeCategory) === normalizeCategoryName(category.categoryName),
        ),
    );
    const unmappedEvidence = evidence.filter((record) => {
      const matched =
        resolveCategoryFromFramework(record.category ?? "", categoryNames) ??
        resolveCategoryFromFramework(record.competency ?? "", categoryNames);
      return !matched;
    });
    const unmappedObjectives = objectives.filter((objective) => {
      const matched = resolveCategoryFromFramework(objective.competency ?? "", categoryNames);
      return !matched;
    });
    return {
      assessmentCategories: unmappedAssessmentCategories,
      evidence: unmappedEvidence,
      objectives: unmappedObjectives,
    };
  }, [categoryNames, evidence, latest?.categories, objectives]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ background: "#F4F5F7", color: C.subtle }}>
          <tr className="text-left text-[11px] uppercase tracking-wider">
            <Th>Competency / Question</Th>
            <Th>Previous</Th>
            <Th>Current</Th>
            <Th>Delta</Th>
            <Th>Target</Th>
            <Th>Progress toward Target (%)</Th>
            <Th>Gap</Th>
            <Th>Evidence Logged</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {categoryEntries.map(([categoryName, details]) => {
            const row =
              data.find(
                (entry) =>
                  entry.competency === categoryName ||
                  normalizeCategoryName(entry.competency) === normalizeCategoryName(categoryName),
              ) ??
              data.find((entry) => resolveCategoryFromFramework(entry.competency, [categoryName]));
            const subs = details.items ?? [];
            const latestCat = latest?.categories.find(
              (c) =>
                c.categoryName === categoryName ||
                normalizeCategoryName(c.categoryName) === normalizeCategoryName(categoryName),
            );
            const isOpen = !!open[categoryName];
            const subScores = subs.map((sub) =>
              getHistoricalQuestionScores(latest, categoryName, sub, previousCompleted),
            );
            const prevAvg =
              subScores.length === 0
                ? DEFAULT_EFFECTIVENESS_WEIGHT
                : +(
                    subScores.reduce((sum, score) => sum + score.previous, 0) / subScores.length
                  ).toFixed(2);
            const curAvg =
              subScores.length === 0
                ? DEFAULT_EFFECTIVENESS_WEIGHT
                : +(
                    subScores.reduce((sum, score) => sum + score.current, 0) / subScores.length
                  ).toFixed(2);
            const targetAvg =
              subScores.length === 0
                ? (row?.target ?? 4)
                : +(
                    subScores.reduce((sum, score) => sum + score.target, 0) / subScores.length
                  ).toFixed(2);
            const gapAvg = +(targetAvg - curAvg).toFixed(2);
            const delta = calculateScoreDelta(prevAvg, curAvg);
            const progressToTarget = calculateProgressTowardsTarget(prevAvg, curAvg, targetAvg);
            const evidenceCount = evidence.filter((record) => {
              const matchedCategory =
                resolveCategoryFromFramework(record.category ?? "", categoryNames) ??
                resolveCategoryFromFramework(record.competency ?? "", categoryNames);
              return matchedCategory === categoryName;
            }).length;
            return (
              <React.Fragment key={categoryName}>
                <tr
                  className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                  style={{ borderColor: C.border }}
                  onClick={() => setOpen((s) => ({ ...s, [categoryName]: !s[categoryName] }))}
                >
                  <Td className="font-semibold" style={{ color: C.navy }}>
                    <span className="inline-flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown size={14} style={{ color: C.subtle }} />
                      </motion.span>
                      {categoryName}
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-500 rounded-md">
                        {subs.length} questions
                      </span>
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{prevAvg.toFixed(2)}</Td>
                  <Td style={{ color: C.navy, fontWeight: 600 }}>{curAvg.toFixed(2)}</Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(delta)}`}
                    >
                      {delta > 0 ? `+${delta}` : `${delta}`}
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{targetAvg.toFixed(2)}</Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(progressToTarget)}`}
                    >
                      {progressToTarget > 0 ? `+${progressToTarget}%` : `${progressToTarget}%`}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(gapAvg)}`}
                    >
                      {gapAvg > 0 ? `+${gapAvg}` : `${gapAvg}`}
                    </span>
                  </Td>
                  <Td style={{ color: C.navy, fontWeight: 600 }}>{evidenceCount}</Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isManagerWorkspace) return;
                        onCreateObjective();
                      }}
                      disabled={isManagerWorkspace}
                      className="text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded border hover:border-[#0052CC] transition-colors"
                      style={{ borderColor: C.border, color: C.primary }}
                    >
                      <Plus size={12} />
                      Create Objective
                    </button>
                  </Td>
                </tr>
                {isOpen &&
                  subs.map((sub) => {
                    const historical = getHistoricalQuestionScores(
                      latest,
                      categoryName,
                      sub,
                      previousCompleted,
                    );
                    const prev = historical.previous;
                    const cur = historical.current;
                    const tgt = historical.target;
                    const note = historical.note;
                    const scale = EFFECTIVENESS_SCALE[Math.max(0, Math.min(4, cur - 1))];
                    const subGap = +(tgt - cur).toFixed(2);
                    const subDelta = calculateScoreDelta(prev, cur);
                    const subProgress = calculateProgressTowardsTarget(prev, cur, tgt);
                    return (
                      <tr
                        key={categoryName + sub}
                        className="border-t bg-[#FAFBFC] hover:bg-[#F4F5F7] transition-colors"
                        style={{ borderColor: C.border }}
                      >
                        <Td className="pl-12" style={{ color: C.slate }}>
                          <div className="text-[13px] leading-snug" style={{ color: C.navy }}>
                            {sub}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: C.subtle }}>
                            Score: {cur} - {scale.label}
                          </div>
                        </Td>
                        <Td style={{ color: C.slate }}>{prev}</Td>
                        <Td style={{ color: C.navy, fontWeight: 600 }}>{cur}</Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subDelta)}`}
                          >
                            {subDelta > 0 ? `+${subDelta}` : `${subDelta}`}
                          </span>
                        </Td>
                        <Td style={{ color: C.slate }}>{tgt}</Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subProgress)}`}
                          >
                            {subProgress > 0 ? `+${subProgress}%` : `${subProgress}%`}
                          </span>
                        </Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(subGap)}`}
                          >
                            {subGap > 0 ? `+${subGap}` : `${subGap}`}
                          </span>
                        </Td>
                        <Td style={{ color: C.subtle }}>-</Td>
                        <Td>
                          <button
                            onClick={() => {
                              if (isManagerWorkspace) return;
                              onCreateObjective();
                            }}
                            disabled={isManagerWorkspace}
                            className="text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded border hover:border-[#0052CC] transition-colors"
                            style={{ borderColor: C.border, color: C.primary }}
                          >
                            <Plus size={11} />
                            Create Objective
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
          {(unmappedHistory.assessmentCategories.length > 0 ||
            unmappedHistory.evidence.length > 0 ||
            unmappedHistory.objectives.length > 0) && (
            <>
              <tr className="border-t" style={{ borderColor: C.border, background: "#FFF8E6" }}>
                <Td className="font-semibold" style={{ color: C.navy }}>
                  <button
                    type="button"
                    onClick={() => setShowUnmappedHistory((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-left"
                  >
                    <ChevronDown
                      size={14}
                      style={{ transform: showUnmappedHistory ? "rotate(0deg)" : "rotate(-90deg)" }}
                    />
                    Unmapped History
                  </button>
                </Td>
                <td className="px-4 py-3 align-middle" colSpan={8} style={{ color: C.subtle }}>
                  Legacy records from categories not present in the current framework.
                </td>
              </tr>
              {showUnmappedHistory &&
                unmappedHistory.assessmentCategories.map((category) => (
                  <tr
                    key={`unmapped-${category.categoryName}`}
                    className="border-t bg-[#FFFDF5]"
                    style={{ borderColor: C.border }}
                  >
                    <Td className="pl-12" style={{ color: C.navy }}>
                      {category.categoryName}
                    </Td>
                    <Td style={{ color: C.slate }}>-</Td>
                    <Td style={{ color: C.slate }}>{category.categoryCurrentAvg.toFixed(2)}</Td>
                    <Td style={{ color: C.slate }}>-</Td>
                    <Td style={{ color: C.slate }}>{category.categoryTarget.toFixed(2)}</Td>
                    <Td style={{ color: C.slate }}>-</Td>
                    <Td style={{ color: C.slate }}>
                      {(category.categoryTarget - category.categoryCurrentAvg).toFixed(2)}
                    </Td>
                    <Td style={{ color: C.slate }}>
                      {
                        unmappedHistory.evidence.filter((record) =>
                          normalizeCategoryName(
                            record.category ?? record.competency ?? "",
                          ).includes(normalizeCategoryName(category.categoryName)),
                        ).length
                      }
                    </Td>
                    <Td style={{ color: C.subtle }}>-</Td>
                  </tr>
                ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function RadarView({
  data,
  assessments,
  evidence,
  objectives,
  wizardDraft,
  selectedEngineerId,
  onCreateObjective,
  onStartReview,
  onResumeDraft,
  onDiscardDraft,
  onOpenHistory,
}: {
  data: ReturnType<typeof deriveRadarData>;
  assessments: Assessment[];
  evidence: EvidenceRecord[];
  objectives: Objective[];
  wizardDraft: AssessmentWizardDraft | null;
  selectedEngineerId: string | null;
  onCreateObjective: () => void;
  onStartReview: () => void;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
  onOpenHistory: () => void;
}) {
  const completedAssessments = useMemo(
    () =>
      assessments
        .filter((assessment) => assessment.status === "Finalized")
        .sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()),
    [assessments],
  );
  const current = useMemo(
    () => +(data.reduce((s, d) => s + d.current, 0) / data.length).toFixed(2),
    [data],
  );
  const readiness = Math.round((current / 4) * 100);
  const top = [...data].sort((a, b) => b.current - a.current)[0];
  const gap = [...data].sort((a, b) => b.target - b.current - (a.target - a.current))[0];
  const [chartMode, setChartMode] = useState<"radar" | "bar">("radar");
  const latest = completedAssessments[0] ?? assessments[0];
  const previousCompleted = completedAssessments[1];
  const { categories, getQuestionsForCategory } = useFramework();
  const frameworkCategoryMap = useMemo(() => {
    if (categories.length > 0) {
      return buildFrameworkCategoryMapFromContext(categories, getQuestionsForCategory);
    }
    return data.reduce<FrameworkCategoryMap>((acc, row) => {
      const matchingAssessmentCategory = latest?.categories.find(
        (category) =>
          category.categoryName === row.competency ||
          normalizeCategoryName(category.categoryName) === normalizeCategoryName(row.competency),
      );
      acc[row.competency] = {
        summary: matchingAssessmentCategory?.summary ?? "",
        items: (matchingAssessmentCategory?.questions ?? []).map(
          (question) => question.questionText,
        ),
      };
      return acc;
    }, {});
  }, [categories, data, getQuestionsForCategory, latest?.categories]);
  const categoryEntries = useMemo(
    () => Object.entries(frameworkCategoryMap),
    [frameworkCategoryMap],
  );
  const frameworkCategoryNames = useMemo(
    () => categoryEntries.map(([categoryName]) => categoryName),
    [categoryEntries],
  );
  const chartData = useMemo(() => {
    const evidenceCounts = evidence.reduce<Record<string, number>>((acc, record) => {
      const matchedCategory =
        resolveCategoryFromFramework(record.category ?? "", frameworkCategoryNames) ??
        resolveCategoryFromFramework(record.competency ?? "", frameworkCategoryNames);
      if (!matchedCategory) return acc;
      acc[matchedCategory] = (acc[matchedCategory] ?? 0) + 1;
      return acc;
    }, {});
    return data.map((r) => {
      const latestCat = latest?.categories.find(
        (c) =>
          c.categoryName === r.competency ||
          normalizeCategoryName(c.categoryName) === normalizeCategoryName(r.competency),
      );
      const previousCat = previousCompleted?.categories.find(
        (c) =>
          c.categoryName === r.competency ||
          normalizeCategoryName(c.categoryName) === normalizeCategoryName(r.competency),
      );
      const comparisonPreviousAvg =
        previousCat && previousCat.questions.length > 0
          ? previousCat.questions.reduce((sum, question) => sum + question.currentScore, 0) /
            previousCat.questions.length
          : latestCat && latestCat.questions.length > 0
            ? latestCat.questions.reduce((sum, question) => sum + question.previousScore, 0) /
              latestCat.questions.length
            : DEFAULT_EFFECTIVENESS_WEIGHT;
      const previous = +Math.min(4, (comparisonPreviousAvg / 5) * 4).toFixed(2);
      return {
        competency: r.competency,
        previous,
        current: r.current,
        target: r.target,
        evidenceCount: evidenceCounts[r.competency] ?? 0,
      };
    });
  }, [data, evidence, frameworkCategoryNames, latest, previousCompleted]);
  const dynamicBarChartHeight = Math.max(320, chartData.length * 36 + 48);
  const formatRelativeSync = (dateValue: string | undefined): string => {
    if (!dateValue) return "No synced assessment yet";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "Sync date unavailable";
    const elapsedMs = Date.now() - parsedDate.getTime();
    if (elapsedMs < 0) return "Just synced";
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    if (elapsedDays === 0) return "today";
    if (elapsedDays === 1) return "1 day ago";
    return `${elapsedDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {wizardDraft && (
          <motion.div
            key="ongoing-assessment-draft-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="p-5" style={{ background: "#F4F5F7" }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-2.5">
                  <Info size={16} className="mt-0.5 shrink-0" style={{ color: C.primary }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: C.navy }}>
                      In-Progress Assessment
                    </div>
                    <div className="text-sm mt-1" style={{ color: C.slate }}>
                      You have an ongoing self-assessment draft that was last modified on{" "}
                      {formatDisplayDate(wizardDraft.savedAt)}.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PrimaryBtn onClick={onResumeDraft}>
                    <ClipboardList size={14} />
                    Resume Assessment
                  </PrimaryBtn>
                  <GhostBtn onClick={onDiscardDraft}>
                    <Trash2 size={14} />
                    Discard Draft
                  </GhostBtn>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-sm" style={{ color: C.subtle }}>
        Assessment of current scores vs Level 4 target across the competency framework.
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Assessment Wizard
            </div>
            <div className="text-sm mt-1" style={{ color: C.navy }}>
              {wizardDraft
                ? `Ongoing assessment detected. Draft saved ${formatDisplayDate(wizardDraft.savedAt)}.`
                : "Start a new assessment or open history from here."}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GhostBtn onClick={onOpenHistory}>
              <History size={14} />
              Assessment History
            </GhostBtn>
            <PrimaryBtn onClick={onStartReview}>
              <ClipboardList size={14} />
              {wizardDraft ? "Resume Ongoing Assessment" : "Start Assessment Wizard"}
            </PrimaryBtn>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: C.subtle }}
          >
            Overall Readiness
          </div>
          <div className="text-3xl font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {readiness}%
          </div>
          <div
            className="mt-3 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#EBECF0" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${readiness}%`, background: C.green }}
            />
          </div>
          <div className="text-xs mt-2" style={{ color: C.subtle }}>
            Toward Level 4 threshold
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Top Strength
            </div>
            <Award size={18} style={{ color: C.green }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {top.competency}
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            {top.current.toFixed(2)} / 4
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Primary Gap
            </div>
            <AlertTriangle size={18} style={{ color: C.red }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {gap.competency}
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Gap of {(gap.target - gap.current).toFixed(2)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Manager Status
            </div>
            <UserCheck size={18} style={{ color: C.primary }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            On Track
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Last sync: {formatRelativeSync(latest?.dateCompleted)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="p-6 h-fit col-span-1 order-1 lg:order-2 lg:col-span-1 lg:sticky lg:top-24">
          <SectionHeader
            title="Visual Gap Analysis"
            sub={
              chartMode === "radar"
                ? "Holistic shape: current score vs Level 4 target"
                : "Side-by-side comparison: previous, current, and target per category"
            }
            right={
              <div
                className="inline-flex items-center rounded border overflow-hidden"
                style={{ borderColor: C.border }}
              >
                <button
                  type="button"
                  onClick={() => setChartMode("radar")}
                  aria-pressed={chartMode === "radar"}
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors"
                  style={{
                    background: chartMode === "radar" ? C.primarySoft : "#fff",
                    color: chartMode === "radar" ? C.primary : C.slate,
                  }}
                >
                  <RadarIcon size={13} />
                  Radar
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("bar")}
                  aria-pressed={chartMode === "bar"}
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors border-l"
                  style={{
                    borderColor: C.border,
                    background: chartMode === "bar" ? C.primarySoft : "#fff",
                    color: chartMode === "bar" ? C.primary : C.slate,
                  }}
                >
                  <BarChartHorizontal size={13} />
                  Bar
                </button>
              </div>
            }
          />
          <div className="flex items-center gap-4 text-xs mt-3" style={{ color: C.slate }}>
            {chartMode === "bar" && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.slate }} />
                Previous
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#0052CC" }} />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#00B8D9" }} />
              Target L4
            </span>
          </div>
          <div
            className="mt-4"
            style={chartMode === "bar" ? { height: dynamicBarChartHeight } : undefined}
          >
            {chartMode === "radar" ? (
              <div className="w-full bg-white p-1 rounded-xl">
                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius="78%"
                    margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
                  >
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="competency" tick={<CustomRadarTick />} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 4]}
                      tick={{ fill: C.subtle, fontSize: 10 }}
                    />
                    <Radar
                      name="Target L4"
                      dataKey="target"
                      stroke="#00B8D9"
                      fill="#00B8D9"
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#0052CC"
                      fill="#0052CC"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <RTooltip
                      contentStyle={{
                        background: "#fff",
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                      formatter={(v) => `${Number(v).toFixed(2)} / 4`}
                    />
                    <Legend wrapperStyle={{ display: "none" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 15, left: 10, bottom: 20 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid horizontal={false} stroke={C.border} />
                  <XAxis
                    type="number"
                    domain={[0, 4]}
                    tick={{ fill: C.subtle, fontSize: 10 }}
                    stroke={C.border}
                  />
                  <YAxis
                    type="category"
                    dataKey="competency"
                    width={165}
                    dx={-5}
                    tick={{ fill: C.navy, fontSize: 11, fontWeight: 600, textAnchor: "end" }}
                    stroke={C.border}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    formatter={(v) => `${Number(v).toFixed(2)} / 4`}
                  />
                  <Legend wrapperStyle={{ display: "none" }} />
                  <Bar
                    dataKey="previous"
                    name="Previous"
                    fill={C.slate}
                    radius={[0, 2, 2, 0]}
                    barSize={6}
                  />
                  <Bar
                    dataKey="current"
                    name="Current"
                    fill="#0052CC"
                    radius={[0, 2, 2, 0]}
                    barSize={6}
                  />
                  <Bar
                    dataKey="target"
                    name="Target L4"
                    fill="#00B8D9"
                    radius={[0, 2, 2, 0]}
                    barSize={6}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden col-span-1 lg:col-span-2 order-2 lg:order-1">
          <div className="p-5 border-b" style={{ borderColor: C.border }}>
            <SectionHeader
              title="Hierarchical Gap Analysis"
              sub="Expand a category to see specific competency questions and their 1-5 effectiveness rating"
            />
          </div>
          <HierarchicalMatrix
            data={data}
            latest={latest}
            previousCompleted={previousCompleted}
            evidence={evidence}
            objectives={objectives}
            categoryMap={frameworkCategoryMap}
            selectedEngineerId={selectedEngineerId}
            onCreateObjective={onCreateObjective}
          />
        </Card>
      </div>
    </div>
  );
}
