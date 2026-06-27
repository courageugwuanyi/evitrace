import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Archive,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Link as LinkIcon,
  Pin,
  Save,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import {
  Badge,
  C,
  Dropdown,
  GhostBtn,
  Input,
  PrimaryBtn,
  Select,
  SourceChip,
  SourceIcon,
} from "@/features/home/shared/ui-kit";
import { ConfirmDialog } from "@/features/home/shared/overlays";
import {
  type EvidenceMatch,
  type EvidenceRecord,
  type EvidenceStatus,
} from "@/features/home/shared/models";
import {
  type InboxConfirmPayload,
  type InboxViewItem,
} from "@/features/home/shell/home-route-contracts";
import {
  resolveFrameworkCategoryEntries,
  type FrameworkCategoryMap,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import { MatchBadge } from "@/features/home/views/evidence-view";

type EvidenceItem = EvidenceRecord;

export function EvidenceSlideover({
  item,
  frameworkMatrix,
  onClose,
  onPin,
  onSave,
  onArchive,
}: {
  item: EvidenceItem;
  frameworkMatrix: unknown;
  onClose: () => void;
  onPin: (item: EvidenceItem) => void;
  onSave: (updated: EvidenceItem) => void;
  onArchive: (id: string) => void;
}) {
  const [draft, setDraft] = useState<EvidenceItem>(item);
  const categoryEntries = useMemo(
    () => resolveFrameworkCategoryEntries(frameworkMatrix),
    [frameworkMatrix],
  );
  const categoryMap = useMemo(
    () => Object.fromEntries(categoryEntries) as FrameworkCategoryMap,
    [categoryEntries],
  );
  const categories = categoryEntries.map(([categoryName]) => categoryName);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const objectiveLinked = item.source === "Objective" || Boolean(item.linkageKey);
  const dirty = !objectiveLinked && JSON.stringify(draft) !== JSON.stringify(item);
  const update = <K extends keyof EvidenceItem>(k: K, v: EvidenceItem[K]) =>
    setDraft((d) => (objectiveLinked ? d : { ...d, [k]: v }));
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
        className="absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Evidence Log</span>
              <ChevronRight size={12} />
              <span
                className="font-semibold truncate max-w-[220px] md:max-w-[320px]"
                style={{ color: C.slate }}
                title={item.title}
              >
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPin(item)}
                className="p-1.5 rounded hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
                title="Pin evidence to workspace"
              >
                <Pin size={16} />
              </button>
              <button
                onClick={() => setConfirmArchive(true)}
                className="p-1.5 rounded hover:bg-[#FFEBE6]"
                style={{ color: C.slate }}
                title="Archive evidence"
              >
                <Archive size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#F4F5F7] ml-1"
                style={{ color: C.slate }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          {objectiveLinked ? (
            <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
              {draft.title}
            </div>
          ) : (
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className="text-xl font-bold mt-2 leading-snug w-full bg-transparent outline-none border border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:bg-white rounded px-1 -mx-1 py-0.5"
              style={{ color: C.navy }}
            />
          )}
          <div
            className="flex flex-wrap items-center gap-2 mt-3 text-xs"
            style={{ color: C.subtle }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDisplayDate(item.date)}
            </span>
            <SourceChip source={draft.source} />
            {draft.status === "Reviewed" ? (
              <Badge tone="success" icon={<CheckCircle size={11} />}>
                Reviewed
              </Badge>
            ) : (
              <Badge tone="warning" icon={<Clock size={11} />}>
                Pending Review
              </Badge>
            )}
            <MatchBadge match={draft.matchState} />
          </div>
          {objectiveLinked && (
            <div className="text-[11px] mt-2" style={{ color: C.subtle }}>
              Logged from Objectives. Edit this objective in the Objectives board.
            </div>
          )}
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-8">
          <section>
            <div
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: C.subtle }}
            >
              Competency Mapping
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Category
                </div>
                <Dropdown
                  value={categories.includes(draft.category) ? draft.category : ""}
                  options={categories}
                  placeholder="Select a competency category…"
                  onChange={(nextCat) => {
                    update("category", nextCat);
                    // Reset subcategory to the first question under the new category
                    const firstSub = categoryMap[nextCat]?.items[0] ?? "";
                    update("competency", firstSub);
                  }}
                  disabled={objectiveLinked}
                />
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Subcategory / Question
                </div>
                <Dropdown
                  value={
                    (categoryMap[draft.category]?.items ?? []).includes(draft.competency)
                      ? draft.competency
                      : ""
                  }
                  options={categoryMap[draft.category]?.items ?? []}
                  placeholder={
                    categories.includes(draft.category)
                      ? "Select a subcategory / question…"
                      : "Pick a category first"
                  }
                  onChange={(val) => update("competency", val)}
                  disabled={objectiveLinked || !categories.includes(draft.category)}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Description & Reflection
              </div>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full min-h-[160px] resize-y rounded border p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              style={{ borderColor: C.border, color: C.slate, overflowWrap: "anywhere" }}
              readOnly={objectiveLinked}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Links & Artifacts
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Source
                </div>
                {objectiveLinked ? (
                  <Input value={draft.source} readOnly />
                ) : (
                  <Select value={draft.source} onChange={(e) => update("source", e.target.value)}>
                    {[
                      "Bitbucket",
                      "GitHub",
                      "GitLab",
                      "Jira",
                      "Slack",
                      "Teams",
                      "Confluence",
                      "Figma",
                      "Trello",
                      "Excel",
                      "PowerPoint",
                      "Word",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                )}
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Link
                </div>
                <div className="flex gap-2">
                  <Input
                    value={draft.link}
                    onChange={(e) => update("link", e.target.value)}
                    placeholder="example.com/path or full URL"
                    icon={<LinkIcon size={14} />}
                    readOnly={objectiveLinked}
                  />
                  {draft.link && (
                    <GhostBtn
                      onClick={() => {
                        const u = /^https?:\/\//i.test(draft.link)
                          ? draft.link
                          : `https://${draft.link}`;
                        window.open(u, "_blank", "noopener");
                      }}
                    >
                      <ExternalLink size={12} /> Open
                    </GhostBtn>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Manager Review
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Review Status
                </div>
                <Select
                  value={draft.status}
                  onChange={(e) => update("status", e.target.value as EvidenceStatus)}
                  disabled={objectiveLinked}
                >
                  <option>Pending Review</option>
                  <option>Reviewed</option>
                </Select>
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Competency Match
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["Yes", "Somewhat", "No", "Unset"] as EvidenceMatch[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => update("matchState", m)}
                      disabled={objectiveLinked}
                      className="px-2 py-1.5 rounded border text-xs font-semibold transition-colors"
                      style={{
                        borderColor: draft.matchState === m ? C.primary : C.border,
                        background: draft.matchState === m ? C.primarySoft : "#fff",
                        color: draft.matchState === m ? C.primary : C.slate,
                      }}
                    >
                      {m === "Unset" ? "Not Set" : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: C.subtle }}
              >
                Manager Assessment
              </div>
              <textarea
                value={draft.managerNotes}
                onChange={(e) => update("managerNotes", e.target.value)}
                placeholder="Manager corroborates context, asks for more detail, suggests rewording, or links related artifacts."
                className="w-full min-h-[150px] resize-y rounded border bg-white p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                style={{
                  borderColor: C.border,
                  color: C.slate,
                  overflowWrap: "anywhere",
                }}
                readOnly={objectiveLinked}
              />
            </div>
          </section>
        </div>

        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          {!objectiveLinked && (
            <PrimaryBtn
              onClick={() => {
                onSave(draft);
              }}
              disabled={!dirty}
            >
              <Save size={14} />
              Save Changes
            </PrimaryBtn>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {confirmArchive && (
          <ConfirmDialog
            title="Archive this evidence?"
            description="Archiving removes the item from the active log. You can restore or permanently delete it from the View Archived tab."
            confirmLabel="Archive"
            onCancel={() => setConfirmArchive(false)}
            onConfirm={() => {
              setConfirmArchive(false);
              onArchive(item.id);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================ */
/*       SLIDE-OVER 3: REVIEW & EDIT AUTO-CAPTURED EVIDENCE     */
/* ============================================================ */

export function InboxReviewSlideover({
  item,
  frameworkMatrix,
  onClose,
  onConfirm,
  onDismiss,
}: {
  item: InboxViewItem | null;
  frameworkMatrix: unknown;
  onClose: () => void;
  onConfirm: (payload: InboxConfirmPayload) => void;
  onDismiss: () => void;
}) {
  const safeItem: InboxViewItem = item ?? {
    id: "",
    source: "Unknown source",
    icon: null,
    title: "",
    suggestion: [],
    when: "",
    isSample: false,
  };
  const hasItemData = Boolean(safeItem.id);
  const categoryEntries = useMemo(
    () => resolveFrameworkCategoryEntries(frameworkMatrix),
    [frameworkMatrix],
  );
  const categoryMap = useMemo(
    () => Object.fromEntries(categoryEntries) as FrameworkCategoryMap,
    [categoryEntries],
  );
  const inboxCats = categoryEntries.map(([categoryName]) => categoryName);
  const suggestionText = Array.isArray(safeItem.suggestion)
    ? safeItem.suggestion.join(" ").toLowerCase()
    : typeof safeItem.suggestion === "string"
      ? safeItem.suggestion.toLowerCase()
      : "";
  const initialCat =
    inboxCats.find((c) => suggestionText.includes(c.toLowerCase())) ?? inboxCats[0] ?? "";
  const [title, setTitle] = useState(safeItem.title || "Untitled action");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [subcategory, setSubcategory] = useState(categoryMap[initialCat]?.items[0] ?? "");
  const sourceLabel = safeItem.source || "Unknown source";
  const whenLabel = safeItem.when || "recently";
  const itemTitle = safeItem.title || "Untitled action";

  function onCatChange(v: string) {
    setCategory(v);
    setSubcategory(categoryMap[v]?.items[0] ?? "");
  }
  useEffect(() => {
    if (!inboxCats.includes(category)) {
      setCategory(initialCat);
      setSubcategory(categoryMap[initialCat]?.items[0] ?? "");
      return;
    }
    const options = categoryMap[category]?.items ?? [];
    if (!options.includes(subcategory)) {
      setSubcategory(options[0] ?? "");
    }
  }, [inboxCats, category, subcategory, initialCat, categoryMap]);
  useEffect(() => {
    setTitle(safeItem.title || "Untitled action");
  }, [safeItem.id, safeItem.title]);
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
        className="absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: C.subtle }}>
              <Sparkles size={12} style={{ color: C.primary }} />
              <span className="font-semibold uppercase tracking-wider" style={{ color: C.slate }}>
                Review Auto-Captured Event
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#F4F5F7]"
              style={{ color: C.slate }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="text-[13px] mt-2" style={{ color: C.subtle }}>
            The AI captured this event {whenLabel}. Confirm details before saving to your evidence
            log.
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!hasItemData && (
            <div
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: C.border, color: C.subtle }}
            >
              Loading action details...
            </div>
          )}
          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Evidence Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 h-10 rounded border text-sm bg-[#FAFBFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </section>

          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Source Link
            </label>
            <div
              className="flex items-center justify-between gap-2 px-3 py-2 rounded border"
              style={{ borderColor: C.border, background: "#FAFBFC" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{ background: "#FFFFFF", color: C.slate, border: `1px solid ${C.border}` }}
                >
                  <SourceIcon source={sourceLabel} size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold" style={{ color: C.navy }}>
                    {sourceLabel}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: C.subtle }}>
                    {itemTitle}
                  </div>
                </div>
              </div>
              <button
                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white"
                style={{ color: C.primary }}
              >
                Open
                <ExternalLink size={12} />
              </button>
            </div>
          </section>

          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Description & Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="The AI captured this event, but please add context. What did you learn? What was the technical challenge?"
              className="w-full min-h-[150px] resize-y rounded border bg-[#FAFBFC] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} style={{ color: C.primary }} />
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: C.subtle }}
              >
                AI Competency Mapping
              </label>
            </div>
            <div className="flex items-start gap-2 mb-3 p-2.5 rounded bg-blue-50 text-blue-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <div className="text-[12px] leading-snug">
                AI Suggestion:{" "}
                {safeItem.suggestion?.length
                  ? safeItem.suggestion.join(", ")
                  : "No suggestions provided"}
                .
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Category
                </div>
                <Select value={category} onChange={(e) => onCatChange(e.target.value)}>
                  {inboxCats.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Subcategory / Question
                </div>
                <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {(categoryMap[category]?.items ?? []).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: C.border, background: "#FAFBFC" }}
        >
          <button
            onClick={onDismiss}
            disabled={!hasItemData}
            className="px-3 h-9 rounded text-sm font-medium hover:bg-[#FFEBE6] transition-colors"
            style={{ color: C.red }}
          >
            {safeItem.isSample ? "Close Sample" : "Dismiss Event"}
          </button>
          <PrimaryBtn
            disabled={!hasItemData}
            onClick={() =>
              onConfirm({
                title,
                description,
                category,
                subcategory,
              })
            }
          >
            <CheckCircle size={14} />
            Confirm & Save
          </PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}
