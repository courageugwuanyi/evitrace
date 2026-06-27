import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Archive,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  Link as LinkIcon,
  Lock,
  Paperclip,
  Pencil,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Share2,
  Target,
  Trash2,
  UploadCloud,
  Wrench,
  X,
} from "lucide-react";
import {
  Badge,
  C,
  Field,
  GhostBtn,
  Input,
  PrimaryBtn,
  Select,
} from "@/features/home/shared/ui-kit";
import { Backdrop, ConfirmDialog, Textarea } from "@/features/home/shared/overlays";
import { type Objective, type SuccessCriterion } from "@/features/home/shared/models";
import {
  COMPETENCY_DESC,
  resolveCategoryFromFramework,
  resolveFrameworkCategoryMap,
} from "@/features/home/shared/framework-taxonomy";
import { toLocalDateString } from "@/lib/datetime";
import { CountdownBadge } from "@/features/home/views/objectives-view";

export function CreateObjectiveModal({
  frameworkMatrix,
  onClose,
  onSubmit,
}: {
  frameworkMatrix: unknown;
  onClose: () => void;
  onSubmit: (o: Omit<Objective, "id" | "status">) => void;
}) {
  const categoryMap = useMemo(
    () => resolveFrameworkCategoryMap(frameworkMatrix),
    [frameworkMatrix],
  );
  const objCategories = useMemo(() => {
    const matrixCategories = ((frameworkMatrix as { categories?: Record<string, unknown> } | null)
      ?.categories ?? {}) as Record<string, unknown>;
    const dynamicKeys = Object.keys(matrixCategories || {});
    if (dynamicKeys.length > 0) return dynamicKeys;
    return Object.keys(categoryMap);
  }, [categoryMap, frameworkMatrix]);
  const [competency, setCompetency] = useState(objCategories[0] ?? "");
  const [subcategory, setSubcategory] = useState(
    categoryMap[objCategories[0] ?? ""]?.items[0] ?? "",
  );
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [startDate, setStartDate] = useState(toLocalDateString());
  const [s, setS] = useState("");
  const [m, setM] = useState("");
  const [a, setA] = useState("");
  const [r, setR] = useState("");
  const [timeboundDate, setTimeboundDate] = useState("");
  const [learn, setLearn] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);
  const [demonstrate, setDemonstrate] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);
  const [share, setShare] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);

  function onCatChange(v: string) {
    setCompetency(v);
    setSubcategory(categoryMap[v]?.items[0] ?? "");
  }

  useEffect(() => {
    if (!objCategories.includes(competency)) {
      const fallbackCategory = objCategories[0] ?? "";
      setCompetency(fallbackCategory);
      setSubcategory(categoryMap[fallbackCategory]?.items[0] ?? "");
      return;
    }
    const options = categoryMap[competency]?.items ?? [];
    if (!options.includes(subcategory)) {
      setSubcategory(options[0] ?? "");
    }
  }, [categoryMap, competency, objCategories, subcategory]);

  useEffect(() => {
    if (!startDate || !timeboundDate) return;
    if (timeboundDate < startDate) {
      setTimeboundDate(startDate);
    }
  }, [startDate, timeboundDate]);

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl border max-h-[90vh] overflow-hidden flex flex-col"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              New Objective
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Create SMART Objective
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-5 flex-1 overflow-hidden">
          {/* Form */}
          <div className="col-span-3 p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="text-[11px]" style={{ color: C.subtle }}>
                Fields marked <span style={{ color: "#DE350B" }}>*</span> are required.
              </div>
              <Field label="Objective Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short, action-oriented title"
                />
              </Field>
              <Field label="Objective Statement" required>
                <Textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe what you intend to achieve and why it matters."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Start Date (Authored Date)"
                  required
                  hint="Defaults to today and represents when the objective starts."
                >
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    icon={<Calendar size={14} />}
                  />
                </Field>
                <Field label="Target Category" required>
                  <Select value={competency} onChange={(e) => onCatChange(e.target.value)}>
                    {objCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Target Subcategory / Question" required>
                <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {(categoryMap[competency]?.items ?? []).map((sc) => (
                    <option key={sc}>{sc}</option>
                  ))}
                </Select>
                <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: C.subtle }}>
                  {categoryMap[competency]?.summary || COMPETENCY_DESC[competency] || ""}
                </div>
              </Field>
            </div>

            <hr style={{ borderColor: C.border }} />

            <div className="space-y-4">
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: C.subtle }}
              >
                SMART Breakdown
              </div>
              <SmartField
                letter="S"
                name="Specific"
                hint="Clearly state who, what action, and context. Avoid vague verbs like 'understand'."
                value={s}
                onChange={setS}
              />
              <SmartField
                letter="M"
                name="Measurable"
                hint="Define how you will evaluate success (e.g., a completed project or assessment)."
                value={m}
                onChange={setM}
              />
              <SmartField
                letter="A"
                name="Achievable"
                hint="Ensure it is realistic based on your current skills, resources, and time."
                value={a}
                onChange={setA}
              />
              <SmartField
                letter="R"
                name="Relevant"
                hint="How does this align with your promotion goals?"
                value={r}
                onChange={setR}
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: C.primary }}
                  >
                    T
                  </div>
                  <div className="text-sm font-semibold" style={{ color: C.navy }}>
                    Time-bound
                    <span className="ml-0.5" style={{ color: "#DE350B" }}>
                      *
                    </span>
                  </div>
                </div>
                <Input
                  type="date"
                  value={timeboundDate}
                  onChange={(e) => setTimeboundDate(e.target.value)}
                  min={startDate || undefined}
                  icon={<Calendar size={14} />}
                />
                <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                  Completion date. Dates earlier than Start Date are disabled.
                </div>
              </div>
            </div>

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Learn"
              icon={BookOpen}
              tone="info"
              evidenceLabel="Materials Used"
              evidencePlaceholder="Link to docs, videos, courses"
              rows={learn}
              onChange={setLearn}
              criteriaPlaceholder="What will you learn?"
            />

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Demonstrate"
              icon={Wrench}
              tone="warning"
              evidenceLabel="Evidence"
              evidencePlaceholder="Link to PR, code snippet, doc"
              rows={demonstrate}
              onChange={setDemonstrate}
              criteriaPlaceholder="How will you apply what you learned?"
            />

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Share"
              icon={Share2}
              tone="success"
              evidenceLabel="Presentation Artifacts"
              evidencePlaceholder="Link to slides, YouTube, doc"
              rows={share}
              onChange={setShare}
              criteriaPlaceholder="How will you teach others?"
            />
          </div>

          {/* Guidance */}
          <aside
            className="col-span-2 border-l p-6 overflow-y-auto"
            style={{ borderColor: C.border, background: C.bg }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} style={{ color: C.primary }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Writing Effective Objectives
              </div>
            </div>

            <div
              className="p-3 rounded border mb-4"
              style={{ background: C.primarySoft, borderColor: "transparent" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1"
                style={{ color: C.primary }}
              >
                Pro Tip - Bloom's Taxonomy
              </div>
              <div className="text-xs leading-relaxed" style={{ color: C.navy }}>
                Rely on observable action verbs (identify, analyze, demonstrate). Instead of
                "understand the new software", use "execute core data-entry tasks".
              </div>
            </div>

            <div
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: C.subtle }}
            >
              Examples
            </div>
            <div
              className="p-3 rounded border mb-2 text-xs"
              style={{ borderColor: C.border, background: "#fff" }}
            >
              <div className="font-bold mb-1" style={{ color: C.red }}>
                Weak
              </div>
              <div style={{ color: C.slate }}>"Get better at system design."</div>
            </div>
            <div
              className="p-3 rounded border text-xs"
              style={{ borderColor: C.border, background: "#fff" }}
            >
              <div className="font-bold mb-1" style={{ color: "#006644" }}>
                SMART
              </div>
              <div style={{ color: C.slate }}>
                "By Q1 end, author and present 2 RFCs for the search platform re-architecture,
                reviewed by a Staff engineer, and reduce p95 query latency by 30% in staging."
              </div>
            </div>
          </aside>
        </div>

        <div
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!title.trim() || !statement.trim() || !startDate || !timeboundDate}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                competency: competency.trim(),
                targetSubcategory: subcategory.trim(),
                due: timeboundDate,
                statement: statement.trim(),
                dateAuthored: startDate,
                specific: s,
                measurable: m,
                achievable: a,
                relevant: r,
                timebound: timeboundDate,
                successCriteria: {
                  learn: learn.filter((x) => x.criteria.trim()),
                  demonstrate: demonstrate.filter((x) => x.criteria.trim()),
                  share: share.filter((x) => x.criteria.trim()),
                },
              })
            }
          >
            Submit for Manager Approval
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function SmartField({
  letter,
  name,
  hint,
  value,
  onChange,
}: {
  letter: string;
  name: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
          style={{ background: C.primary }}
        >
          {letter}
        </div>
        <div className="text-sm font-semibold" style={{ color: C.navy }}>
          {name}
        </div>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: C.subtle }}>
          Optional
        </span>
      </div>
      <Textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
        {hint}
      </div>
    </div>
  );
}

function CriteriaSection({
  title,
  icon: Icon,
  tone,
  evidenceLabel,
  evidencePlaceholder,
  rows,
  onChange,
  criteriaPlaceholder,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  tone: "info" | "warning" | "success";
  evidenceLabel: string;
  evidencePlaceholder: string;
  rows: SuccessCriterion[];
  onChange: (rows: SuccessCriterion[]) => void;
  criteriaPlaceholder: string;
}) {
  const update = (i: number, patch: Partial<SuccessCriterion>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, { criteria: "", evidence: "", attachments: [] }]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: C.primary }} />
          <div className="text-sm font-bold" style={{ color: C.navy }}>
            {title}
          </div>
          <Badge tone={tone}>{rows.length}</Badge>
        </div>
        <GhostBtn onClick={add}>
          <Plus size={12} />
          Add row
        </GhostBtn>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="p-3 rounded border space-y-2"
            style={{ borderColor: C.border, background: "#FAFBFC" }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={row.criteria}
                  onChange={(e) => update(i, { criteria: e.target.value })}
                  placeholder={criteriaPlaceholder}
                />
                <Input
                  value={row.evidence}
                  onChange={(e) => update(i, { evidence: e.target.value })}
                  placeholder={`${evidenceLabel}: ${evidencePlaceholder}`}
                  icon={<LinkIcon size={12} />}
                />
              </div>
              <button
                onClick={() => remove(i)}
                className="p-1.5 rounded hover:bg-[#FFEBE6]"
                style={{ color: C.red }}
                title="Remove row"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div
            className="text-xs px-3 py-4 rounded border border-dashed text-center"
            style={{ borderColor: C.border, color: C.subtle }}
          >
            No criteria added yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*       OVERLAY: OBJECTIVE DETAILS SLIDE-OVER                  */
/* ============================================================ */

export function ObjectiveSlideover({
  objective,
  frameworkMatrix,
  onClose,
  onPin,
  onSave,
  onChangeStatus,
  onArchive,
}: {
  objective: Objective;
  frameworkMatrix: unknown;
  onClose: () => void;
  onPin: (o: Objective) => void;
  onSave: (o: Objective) => void;
  onChangeStatus: (o: Objective, next: Objective["status"]) => void;
  onArchive: (o: Objective) => void;
}) {
  const categoryMap = useMemo(
    () => resolveFrameworkCategoryMap(frameworkMatrix),
    [frameworkMatrix],
  );
  const objCategories = useMemo(() => {
    const matrixCategories = ((frameworkMatrix as { categories?: Record<string, unknown> } | null)
      ?.categories ?? {}) as Record<string, unknown>;
    const dynamicKeys = Object.keys(matrixCategories || {});
    if (dynamicKeys.length > 0) return dynamicKeys;
    return Object.keys(categoryMap);
  }, [categoryMap, frameworkMatrix]);
  const initialCompetency =
    resolveCategoryFromFramework(objective.competency, objCategories) ?? objCategories[0] ?? "";
  const [smartOpen, setSmartOpen] = useState(false);
  const [title, setTitle] = useState(objective.title);
  const [competency, setCompetency] = useState(initialCompetency);
  const [targetSubcategory, setTargetSubcategory] = useState(() => {
    const subcategoryOptions = categoryMap[initialCompetency]?.items ?? [];
    if (objective.targetSubcategory && subcategoryOptions.includes(objective.targetSubcategory)) {
      return objective.targetSubcategory;
    }
    return subcategoryOptions[0] ?? "";
  });
  const [links, setLinks] = useState(objective.links ?? []);
  const [newLink, setNewLink] = useState("");
  const [notes, setNotes] = useState(objective.notes ?? "");
  const [statement, setStatement] = useState(objective.statement ?? "");
  const [criteria, setCriteria] = useState(
    objective.successCriteria ?? { learn: [], demonstrate: [], share: [] },
  );
  const isTodo = objective.status === "Pending Approval";
  const locked = objective.status === "Completed";
  const readOnly = !isTodo;
  const [editMode, setEditMode] = useState(false);
  const isEditable = isTodo && editMode;
  const [confirmArchive, setConfirmArchive] = useState(false);

  function onObjectiveCategoryChange(nextCategory: string) {
    setCompetency(nextCategory);
    setTargetSubcategory(categoryMap[nextCategory]?.items[0] ?? "");
  }

  useEffect(() => {
    if (!objCategories.includes(competency)) {
      const fallbackCategory =
        resolveCategoryFromFramework(objective.competency, objCategories) ?? objCategories[0] ?? "";
      setCompetency(fallbackCategory);
      const fallbackOptions = categoryMap[fallbackCategory]?.items ?? [];
      const fallbackSubcategory =
        objective.targetSubcategory && fallbackOptions.includes(objective.targetSubcategory)
          ? objective.targetSubcategory
          : (fallbackOptions[0] ?? "");
      setTargetSubcategory(fallbackSubcategory);
      return;
    }
    const options = categoryMap[competency]?.items ?? [];
    if (!options.includes(targetSubcategory)) {
      const preferredSubcategory =
        objective.targetSubcategory && options.includes(objective.targetSubcategory)
          ? objective.targetSubcategory
          : (options[0] ?? "");
      setTargetSubcategory(preferredSubcategory);
    }
  }, [
    categoryMap,
    competency,
    objCategories,
    objective.competency,
    objective.targetSubcategory,
    targetSubcategory,
  ]);

  function buildUpdated(): Objective {
    return {
      ...objective,
      title,
      competency,
      targetSubcategory,
      notes,
      links,
      statement,
      successCriteria: criteria,
    };
  }

  const nextStatus: Objective["status"] | null =
    objective.status === "Pending Approval"
      ? "In Progress"
      : objective.status === "In Progress"
        ? "Completed"
        : null;
  const nextLabel =
    objective.status === "Pending Approval"
      ? "Approve & Move to In Progress"
      : objective.status === "In Progress"
        ? "Mark as Completed"
        : "";
  const statusBadgeClass =
    objective.status === "Completed"
      ? "text-emerald-700 bg-emerald-50"
      : objective.status === "In Progress"
        ? "text-sky-700 bg-sky-50"
        : "text-amber-700 bg-amber-50";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(9, 30, 66, 0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-0 h-full w-full md:w-[48%] bg-white shadow-2xl flex flex-col overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Objectives</span>
              <ChevronRight size={12} />
              <span
                className="font-semibold truncate max-w-[220px] md:max-w-[320px]"
                style={{ color: C.slate }}
                title={objective.title}
              >
                {objective.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPin(objective)}
                title="Pin objective to workspace"
                className="p-1.5 rounded hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
              >
                <Pin size={16} />
              </button>
              {isTodo && (
                <button
                  onClick={() => setEditMode((v) => !v)}
                  title={editMode ? "Done editing" : "Edit"}
                  className="p-1.5 rounded hover:bg-[#F4F5F7]"
                  style={{ color: editMode ? C.primary : C.slate }}
                >
                  <Pencil size={16} />
                </button>
              )}
              {!locked && (
                <button
                  onClick={() => {
                    setConfirmArchive(true);
                  }}
                  title="Archive"
                  className="p-1.5 rounded hover:bg-[#FFEBE6]"
                  style={{ color: C.red }}
                >
                  <Archive size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            {isEditable ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-3 mb-4 h-11 text-xl font-bold tracking-tight text-slate-900 leading-snug"
                placeholder="Objective title"
              />
            ) : (
              <div className="text-xl font-bold tracking-tight text-slate-900 mb-4 leading-snug mt-3">
                {title}
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${statusBadgeClass}`}
              >
                {locked && <Lock size={10} />}
                {objective.status}
              </span>
              <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50">
                {competency}
              </span>
              <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100">
                {targetSubcategory || "No subcategory selected"}
              </span>
              <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-violet-700 bg-violet-50">
                Due {objective.due || "Not set"}
              </span>
              <CountdownBadge due={objective.due} />
            </div>
            {readOnly && (
              <span className="text-xs text-slate-500">
                {locked ? "Locked - read only" : "Read only after moving out of To Do"}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
          {/* SMART accordion */}
          <div className="rounded border" style={{ borderColor: C.border }}>
            <button
              onClick={() => setSmartOpen((x) => !x)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold"
              style={{ color: C.navy }}
            >
              <span>SMART Details</span>
              <motion.span
                animate={{ rotate: smartOpen ? 180 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {smartOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 text-sm" style={{ color: C.slate }}>
                    {(
                      [
                        ["S", "Specific", objective.specific],
                        ["M", "Measurable", objective.measurable],
                        ["A", "Achievable", objective.achievable],
                        ["R", "Relevant", objective.relevant],
                        ["T", "Time-bound", objective.timebound],
                      ] as const
                    ).map(([k, n, v]) => (
                      <div key={k}>
                        <div
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: C.primary }}
                        >
                          {k} - {n}
                        </div>
                        <div className="mt-0.5">
                          {v || <span style={{ color: C.subtle }}>Not provided</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Competency Mapping
              </label>
              <div className="h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                {competency || "Not provided"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Category
              </label>
              {isEditable ? (
                <select
                  value={competency}
                  onChange={(e) => onObjectiveCategoryChange(e.target.value)}
                  className="h-10 w-full px-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  {objCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <div className="h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  {competency}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Subcategory / Question
              </label>
              {isEditable ? (
                <select
                  value={targetSubcategory}
                  onChange={(e) => setTargetSubcategory(e.target.value)}
                  className="h-10 w-full px-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  {(categoryMap[competency]?.items ?? []).map((sc) => (
                    <option key={sc}>{sc}</option>
                  ))}
                </select>
              ) : (
                <div className="min-h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700">
                  {targetSubcategory || "Not provided"}
                </div>
              )}
            </div>
          </section>

          {/* Objective Statement */}
          {(objective.statement || isEditable) && (
            <section
              className="p-4 rounded border"
              style={{ borderColor: C.border, background: "#FAFBFC" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: C.subtle }}
              >
                Objective Statement
              </div>
              {isEditable ? (
                <Textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe what you intend to achieve and why it matters."
                />
              ) : (
                <div className="text-sm leading-relaxed break-words" style={{ color: C.navy }}>
                  {statement || <span style={{ color: C.subtle }}>No statement.</span>}
                </div>
              )}
              <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
                {objective.dateAuthored && (
                  <div className="text-[11px]" style={{ color: C.subtle }}>
                    Authored {objective.dateAuthored} - Time-bound {objective.due}
                  </div>
                )}
                <CountdownBadge due={objective.due} />
              </div>
            </section>
          )}

          {/* Success Criteria - Learn / Demonstrate / Share */}
          {(criteria || isEditable) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} style={{ color: C.slate }} />
                <div className="text-sm font-bold" style={{ color: C.navy }}>
                  Success Criteria
                </div>
              </div>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "learn" as const,
                      label: "Learn",
                      icon: BookOpen,
                      tone: "info" as const,
                      evidenceLabel: "Materials Used",
                      evidencePlaceholder: "Link to docs, videos, courses",
                      criteriaPlaceholder: "What will you learn?",
                    },
                    {
                      key: "demonstrate" as const,
                      label: "Demonstrate",
                      icon: Wrench,
                      tone: "warning" as const,
                      evidenceLabel: "Evidence",
                      evidencePlaceholder: "Link to PR, code snippet, doc",
                      criteriaPlaceholder: "How will you apply what you learned?",
                    },
                    {
                      key: "share" as const,
                      label: "Share",
                      icon: Share2,
                      tone: "success" as const,
                      evidenceLabel: "Presentation Artifacts",
                      evidencePlaceholder: "Link to slides, YouTube, doc",
                      criteriaPlaceholder: "How will you teach others?",
                    },
                  ] as const
                ).map(
                  ({
                    key,
                    label,
                    icon: Icon,
                    tone,
                    evidenceLabel,
                    evidencePlaceholder,
                    criteriaPlaceholder,
                  }) => {
                    const rows = criteria[key] ?? [];
                    if (isEditable) {
                      return (
                        <div
                          key={key}
                          className="rounded border p-3"
                          style={{ borderColor: C.border }}
                        >
                          <CriteriaSection
                            title={label}
                            icon={Icon}
                            tone={tone}
                            evidenceLabel={evidenceLabel}
                            evidencePlaceholder={evidencePlaceholder}
                            rows={rows}
                            onChange={(next) => setCriteria((c) => ({ ...c, [key]: next }))}
                            criteriaPlaceholder={criteriaPlaceholder}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        key={key}
                        className="rounded border overflow-hidden"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="px-4 py-2.5 flex items-center justify-between border-b"
                          style={{ borderColor: C.border, background: "#FAFBFC" }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} style={{ color: C.primary }} />
                            <span className="text-sm font-semibold" style={{ color: C.navy }}>
                              {label}
                            </span>
                          </div>
                          <Badge tone={tone}>{rows.length} criteria</Badge>
                        </div>
                        <div className="divide-y" style={{ borderColor: C.border }}>
                          {rows.map((r, i) => (
                            <div
                              key={i}
                              className="px-4 py-3 grid grid-cols-[1fr_auto] gap-3 items-start min-w-0"
                              style={{ borderColor: C.border }}
                            >
                              <div className="min-w-0">
                                <div
                                  className="text-sm leading-snug break-words"
                                  style={{ color: C.navy }}
                                >
                                  {r.criteria}
                                </div>
                                <div
                                  className="text-[11px] mt-1 flex items-center gap-1 break-all"
                                  style={{ color: C.subtle }}
                                >
                                  <Paperclip size={11} />
                                  Evidence: {r.evidence}
                                </div>
                              </div>
                              {r.evidence && /^https?:\/\//i.test(r.evidence) ? (
                                <button
                                  onClick={() => window.open(r.evidence, "_blank", "noopener")}
                                  className="text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]"
                                  style={{ borderColor: C.border, color: C.primary }}
                                  title="Open evidence link"
                                >
                                  <ExternalLink size={11} />
                                  Open
                                </button>
                              ) : r.done ? (
                                <Badge tone="success">Done</Badge>
                              ) : null}
                            </div>
                          ))}
                          {rows.length === 0 && (
                            <div className="px-4 py-3 text-xs" style={{ color: C.subtle }}>
                              No criteria added.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          )}

          {/* Links */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Learning Resources
              </div>
            </div>
            <div className="space-y-2">
              {links.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded border gap-2"
                  style={{ borderColor: C.border }}
                >
                  {isEditable ? (
                    <Input
                      value={l.label}
                      onChange={(e) =>
                        setLinks((arr) =>
                          arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)),
                        )
                      }
                      placeholder="Label"
                    />
                  ) : (
                    <span
                      className="text-sm truncate min-w-0 max-w-[360px]"
                      style={{ color: C.navy }}
                      title={l.label}
                    >
                      {l.label}
                    </span>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => window.open(l.url, "_blank", "noopener")}
                      className="text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]"
                      style={{ borderColor: C.border, color: C.primary }}
                      title="Open link"
                    >
                      <ExternalLink size={11} />
                      Open
                    </button>
                    {isEditable && (
                      <button
                        onClick={() => setLinks((arr) => arr.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded hover:bg-[#FFEBE6]"
                        style={{ color: C.red }}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <div className="text-xs" style={{ color: C.subtle }}>
                  No resources added yet.
                </div>
              )}
              {isEditable && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Add URL..."
                  />
                  <GhostBtn
                    onClick={() => {
                      if (!newLink) return;
                      setLinks((l) => [
                        ...l,
                        { label: newLink.replace(/^https?:\/\//, ""), url: newLink },
                      ]);
                      setNewLink("");
                    }}
                  >
                    <Plus size={14} />
                    Add
                  </GhostBtn>
                </div>
              )}
            </div>
          </section>

          {/* Evidence & Artifacts */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Evidence & Artifacts
              </div>
            </div>
            {isEditable ? (
              <div
                className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:border-[#0052CC] transition-colors"
                style={{ borderColor: C.border }}
              >
                <UploadCloud size={28} className="mx-auto" style={{ color: C.primary }} />
                <div className="text-sm font-semibold mt-2" style={{ color: C.navy }}>
                  Drop files here or click to upload
                </div>
                <div className="text-xs mt-1" style={{ color: C.subtle }}>
                  PDF, images, or code snippets
                </div>
              </div>
            ) : (
              <div className="text-xs" style={{ color: C.subtle }}>
                {locked
                  ? "Locked - artifacts are read-only."
                  : "Enter edit mode to upload artifacts."}
              </div>
            )}
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Learning Log & Notes
              </div>
            </div>
            <Textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What are your key takeaways so far? Summarize your findings here."
              disabled={!isEditable}
              readOnly={!isEditable}
            />
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <div className="flex items-center gap-2">
            <GhostBtn onClick={onClose}>Close</GhostBtn>
            {locked && (
              <GhostBtn onClick={() => onChangeStatus(objective, "In Progress")}>
                <RotateCcw size={14} />
                Revert to In Progress
              </GhostBtn>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditable && (
              <GhostBtn
                onClick={() => {
                  onSave(buildUpdated());
                  setEditMode(false);
                }}
              >
                <Save size={14} />
                Save changes
              </GhostBtn>
            )}
            {nextStatus && (
              <PrimaryBtn onClick={() => onChangeStatus(buildUpdated(), nextStatus)}>
                <CheckCircle size={16} />
                {nextLabel}
              </PrimaryBtn>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {confirmArchive && (
          <ConfirmDialog
            title="Archive this objective?"
            description="Archived objectives are removed from the Kanban board but can be restored from the Archive view. They will not be permanently deleted."
            confirmLabel="Archive"
            destructive
            onCancel={() => setConfirmArchive(false)}
            onConfirm={() => {
              setConfirmArchive(false);
              onArchive(objective);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
