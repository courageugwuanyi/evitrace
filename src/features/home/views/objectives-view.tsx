import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  GripVertical,
  Lock,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge, C, Card, GhostBtn, PrimaryBtn } from "@/features/home/shared/ui-kit";
import type { Objective } from "@/features/home/shared/models";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function OverlayBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(9, 30, 66, 0.54)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

function ObjectiveConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <OverlayBackdrop onClose={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {destructive ? (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-base font-bold" style={{ color: C.navy }}>
                {title}
              </div>
              <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                {description}
              </div>
            </div>
          </div>
        </div>
        <div
          className="px-5 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onCancel}>{cancelLabel}</GhostBtn>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors"
            style={{ background: destructive ? C.red : C.primary }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </OverlayBackdrop>
  );
}

function parseDateLoose(s?: string): Date | null {
  if (!s) return null;
  const cleaned = s.replace(/^Complete by\s+/i, "");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function weeksBetween(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
}

export function CountdownBadge({ due }: { due?: string }) {
  const d = parseDateLoose(due);
  if (!d) return null;
  const weeks = weeksBetween(new Date(), d);
  if (weeks < 0) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
        Overdue by {Math.abs(weeks)} wk
      </span>
    );
  }
  if (weeks === 0) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        Due this week
      </span>
    );
  }
  if (weeks <= 1) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        Last week remaining
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
      {weeks} weeks remaining
    </span>
  );
}

function ObjectiveTableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

function ObjectiveTableCell({
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

function ArchivedObjectivesTable({
  items,
  onRestore,
  onDelete,
  formatObjectiveCode,
  formatDisplayDate,
}: {
  items: Objective[];
  onRestore: (o: Objective) => void;
  onDelete: (o: Objective) => void;
  formatObjectiveCode: (o: Objective) => string;
  formatDisplayDate: (value: string | Date) => string;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: C.bg }}
          >
            <Archive size={20} style={{ color: C.subtle }} />
          </div>
          <div className="text-base font-bold" style={{ color: C.navy }}>
            No archived objectives
          </div>
          <div className="text-sm mt-1" style={{ color: C.subtle }}>
            Objectives you archive will appear here.
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr
              className="text-left text-[11px] font-semibold uppercase tracking-wider border-b"
              style={{ background: C.bg, borderColor: C.border, color: C.subtle }}
            >
              <ObjectiveTableHeader>Objective</ObjectiveTableHeader>
              <ObjectiveTableHeader>Category</ObjectiveTableHeader>
              <ObjectiveTableHeader>Authored</ObjectiveTableHeader>
              <ObjectiveTableHeader>Archived</ObjectiveTableHeader>
              <ObjectiveTableHeader className="text-right">Actions</ObjectiveTableHeader>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                className="border-b last:border-0 hover:bg-[#FAFBFC]"
                style={{ borderColor: C.border }}
              >
                <ObjectiveTableCell>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: C.subtle }}
                  >
                    {formatObjectiveCode(o)}
                  </div>
                  <div className="line-clamp-2 font-medium" style={{ color: C.navy }}>
                    {o.title}
                  </div>
                </ObjectiveTableCell>
                <ObjectiveTableCell>
                  <Badge tone="info">{o.competency}</Badge>
                </ObjectiveTableCell>
                <ObjectiveTableCell className="whitespace-nowrap" style={{ color: C.slate }}>
                  {o.dateAuthored ?? "-"}
                </ObjectiveTableCell>
                <ObjectiveTableCell className="whitespace-nowrap" style={{ color: C.slate }}>
                  {o.archivedDate ? formatDisplayDate(o.archivedDate) : "-"}
                </ObjectiveTableCell>
                <ObjectiveTableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onRestore(o)}
                      title="Restore to active board"
                      className="p-1.5 rounded hover:bg-[#DEEBFF]"
                      style={{ color: C.primary }}
                    >
                      <ArchiveRestore size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(o)}
                      title="Permanently delete"
                      className="p-1.5 rounded hover:bg-[#FFEBE6]"
                      style={{ color: C.red }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </ObjectiveTableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ObjectiveCard({
  o,
  readOnly = false,
  onOpen,
  isPinned,
  onTogglePin,
  onDragStart,
  onDragEnd,
  dragging,
  formatObjectiveCode,
}: {
  o: Objective;
  readOnly?: boolean;
  onOpen: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragging?: boolean;
  formatObjectiveCode: (o: Objective) => string;
}) {
  const statusIcon =
    o.status === "Completed" ? (
      <CheckCircle size={13} style={{ color: C.green }} />
    ) : (
      <Clock size={13} style={{ color: C.amber }} />
    );
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative w-full text-left"
      draggable={!readOnly && o.status !== "Completed"}
      onDragStart={(e) => {
        if (readOnly) return;
        (e as unknown as React.DragEvent).dataTransfer?.setData("text/plain", o.id);
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      style={{ opacity: dragging ? 0.4 : 1 }}
    >
      <Card className="relative p-4 hover:border-[#0052CC] transition-colors cursor-pointer" onClick={onOpen}>
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onTogglePin();
          }}
          className={`absolute top-3 right-3 p-1 rounded-md border shadow-sm transition-all duration-150 cursor-pointer ${
            isPinned
              ? "opacity-100 text-indigo-600 bg-indigo-50 border-indigo-200"
              : "opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400 hover:text-indigo-600"
          }`}
          title={isPinned ? "Unpin objective from workspace" : "Pin objective to workspace"}
          aria-label={isPinned ? `Unpin ${o.title}` : `Pin ${o.title}`}
        >
          <Pin size={14} />
        </button>
        <div className="flex items-center justify-between">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: C.subtle }}
          >
            {formatObjectiveCode(o)}
          </div>
          {o.status !== "Completed" && <GripVertical size={14} style={{ color: C.subtle }} />}
          {o.status === "Completed" && <Lock size={12} style={{ color: C.subtle }} />}
        </div>
        <div className="text-sm font-semibold mt-1 leading-snug" style={{ color: C.navy }}>
          {o.title}
        </div>
        <div className="mt-3">
          <Badge tone="info">{o.competency}</Badge>
        </div>
        <div
          className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]"
          style={{ borderColor: C.border, color: C.slate }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {o.due}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            {statusIcon}
            {o.status}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export function ObjectivesView({
  items,
  readOnly,
  onOpen,
  onCreate,
  pinnedObjectiveIds,
  onTogglePin,
  onMove,
  onRestore,
  onDelete,
  formatObjectiveCode,
  formatDisplayDate,
}: {
  items: Objective[];
  readOnly: boolean;
  onOpen: (o: Objective) => void;
  onCreate: () => void;
  pinnedObjectiveIds: Set<string>;
  onTogglePin: (o: Objective) => void;
  onMove: (id: string, status: Objective["status"]) => void;
  onRestore: (o: Objective) => void;
  onDelete: (o: Objective) => void;
  formatObjectiveCode: (o: Objective) => string;
  formatDisplayDate: (value: string | Date) => string;
}) {
  const cols: { id: Objective["status"]; label: string; tone: "warning" | "info" | "success" }[] = [
    { id: "Pending Approval", label: "To Do / Not Started", tone: "warning" },
    { id: "In Progress", label: "In Progress", tone: "info" },
    { id: "Completed", label: "Completed", tone: "success" },
  ];
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Objective["status"] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Objective | null>(null);

  const active = items.filter((i) => !i.isArchived);
  const archived = items.filter((i) => i.isArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PrimaryBtn onClick={onCreate} className="whitespace-nowrap" disabled={readOnly}>
            <Plus size={16} />
            <span className="hidden sm:inline">Create Objective</span>
            <span className="sm:hidden">Create</span>
          </PrimaryBtn>
          <div className="text-sm hidden md:block" style={{ color: C.subtle }}>
            {showArchived
              ? "Read-only archive of past objectives."
              : "Drag cards between columns to update status, or open one to edit."}
          </div>
        </div>
        <GhostBtn onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? <Eye size={14} /> : <Archive size={14} />}
          {showArchived ? `Back to Board` : `View Archived (${archived.length})`}
        </GhostBtn>
      </div>

      {showArchived ? (
        <ArchivedObjectivesTable
          items={archived}
          onRestore={onRestore}
          onDelete={(o) => setConfirmDelete(o)}
          formatObjectiveCode={formatObjectiveCode}
          formatDisplayDate={formatDisplayDate}
        />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {cols.map((col) => {
            const list = active.filter((i) => i.status === col.id);
            const isOver = overCol === col.id;
            return (
              <div
                key={col.id}
                className="space-y-3 rounded-lg p-2 -m-2 transition-colors"
                style={{ background: isOver ? C.primarySoft : "transparent" }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverCol(null);
                  if (dragId) {
                    onMove(dragId, col.id);
                    setDragId(null);
                  }
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={col.tone}>{col.label}</Badge>
                    <span className="text-xs font-semibold" style={{ color: C.subtle }}>
                      {list.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {list.map((o) => (
                    <ObjectiveCard
                      key={o.id}
                      o={o}
                      readOnly={readOnly}
                      onOpen={() => onOpen(o)}
                      isPinned={pinnedObjectiveIds.has(o.id)}
                      onTogglePin={() => onTogglePin(o)}
                      onDragStart={() => setDragId(o.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      dragging={dragId === o.id}
                      formatObjectiveCode={formatObjectiveCode}
                    />
                  ))}
                  {list.length === 0 && (
                    <div
                      className="border border-dashed rounded p-6 text-center text-xs"
                      style={{ borderColor: C.border, color: C.subtle }}
                    >
                      {isOver ? "Drop to move here" : "Nothing here yet."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <ObjectiveConfirmDialog
            title="Permanently delete this objective?"
            description="This action cannot be undone. All criteria, evidence links, and history for this objective will be removed."
            confirmLabel="Yes, delete permanently"
            destructive
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              onDelete(confirmDelete);
              setConfirmDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
