import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Pin,
  Search,
  TableProperties,
  Trash2,
  X,
} from "lucide-react";
import { useFramework } from "@/context/FrameworkContext";
import { extractFirstLink } from "@/features/home/shared/text-utils";
import { formatDisplayDate, formatEvidenceDateParts } from "@/features/home/shared/formatters";
import { C, Card, GhostBtn, Badge, SourceChip, Input, Select } from "@/features/home/shared/ui-kit";
import { ConfirmDialog } from "@/features/home/shared/overlays";
import { toLocalDateString } from "@/lib/datetime";
import { type EvidenceMatch, type EvidenceRecord } from "@/features/home/shared/models";

type EvidenceItem = EvidenceRecord;

export function EvidenceView({
  rows,
  readOnly,
  managerReviewEnabled = false,
  onOpenRow,
  pinnedEvidenceIds,
  onTogglePin,
  onArchive,
  onPermanentDelete,
  onRestore,
}: {
  rows: EvidenceRecord[];
  readOnly: boolean;
  managerReviewEnabled?: boolean;
  onOpenRow: (r: EvidenceItem) => void;
  pinnedEvidenceIds: Set<string>;
  onTogglePin: (r: EvidenceItem) => void;
  onArchive: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const { categories: frameworkCategories } = useFramework();
  const [q, setQ] = useState("");
  const [comp, setComp] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<EvidenceItem | null>(null);
  const [confirmBulkDeleteIds, setConfirmBulkDeleteIds] = useState<string[] | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const visible = rows.filter((r) => (showArchived ? r.isArchived : !r.isArchived));
  const filtered = visible.filter(
    (r) =>
      (q === "" || r.title.toLowerCase().includes(q.toLowerCase())) &&
      (comp === "All" || r.competency === comp) &&
      (status === "All" || r.status === status) &&
      (source === "All" || r.source === source),
  );
  const filteredIds = filtered.map((row) => row.id);
  const competencyOptions = useMemo(() => {
    if (frameworkCategories.length > 0) return frameworkCategories;
    return [
      ...new Set(rows.map((row) => row.competency).filter((value) => value.trim().length > 0)),
    ].sort((a, b) => a.localeCompare(b));
  }, [frameworkCategories, rows]);
  const selectedVisibleIds = filteredIds.filter((id) => selectedRows.has(id));
  const hasVisibleRows = filteredIds.length > 0;
  const allVisibleExpanded = hasVisibleRows && filteredIds.every((id) => expandedRows.has(id));
  const allVisibleSelected = hasVisibleRows && filteredIds.every((id) => selectedRows.has(id));
  const bulkActionLabel = showArchived ? "Delete Selected" : "Archive Selected";
  const totalColumns = showArchived ? 13 : 11;

  function toggleRowExpanded(rowId: string) {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function expandAllVisibleRows() {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function collapseAllVisibleRows() {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  }

  function toggleExpandVisibleRows() {
    if (allVisibleExpanded) {
      collapseAllVisibleRows();
      return;
    }
    expandAllVisibleRows();
  }

  function toggleRowSelected(rowId: string) {
    setSelectedRows((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function toggleSelectAllVisibleRows() {
    setSelectedRows((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <div
          className="inline-flex rounded border overflow-hidden"
          style={{ borderColor: C.border }}
        >
          <button
            onClick={() => setShowArchived(false)}
            className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
            style={{
              background: !showArchived ? C.primarySoft : "#fff",
              color: !showArchived ? C.primary : C.slate,
            }}
          >
            <TableProperties size={12} /> Active Log
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 border-l"
            style={{
              background: showArchived ? C.primarySoft : "#fff",
              color: showArchived ? C.primary : C.slate,
              borderColor: C.border,
            }}
          >
            <Archive size={12} /> View Archived ({rows.filter((r) => r.isArchived).length})
          </button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-4 border-b space-y-3" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-72">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by title or keyword…"
                icon={<Search size={14} />}
              />
            </div>
            <div className="w-40">
              <Select icon={<Calendar size={14} />} defaultValue="all">
                <option value="all">All dates</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This quarter</option>
              </Select>
            </div>
            <div className="w-48">
              <Select
                icon={<Filter size={14} />}
                value={comp}
                onChange={(e) => setComp(e.target.value)}
              >
                <option>All</option>
                {competencyOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="w-44">
              <Select
                icon={<Filter size={14} />}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All</option>
                <option>Pending Review</option>
                <option>Reviewed</option>
              </Select>
            </div>
            <div className="w-40">
              <Select
                icon={<Filter size={14} />}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option>All</option>
                <option>Bitbucket</option>
                <option>Jira</option>
                <option>GitHub</option>
                <option>GitLab</option>
                <option>Slack</option>
                <option>Teams</option>
                <option>Confluence</option>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs" style={{ color: C.subtle }}>
              {filtered.length} of {visible.length} items
            </div>
            <GhostBtn onClick={toggleExpandVisibleRows} disabled={!hasVisibleRows}>
              {allVisibleExpanded ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {allVisibleExpanded ? "Collapse All" : "Expand All"}
            </GhostBtn>
            <GhostBtn
              onClick={() => setConfirmBulkDeleteIds([...selectedVisibleIds])}
              disabled={readOnly || selectedVisibleIds.length === 0}
              className="hover:bg-[#FFEBE6]"
              style={{ color: C.red }}
            >
              <Archive size={14} />
              {bulkActionLabel} ({selectedVisibleIds.length})
            </GhostBtn>
            <GhostBtn
              onClick={() => {
                const header = [
                  "ID",
                  "Date",
                  "Source",
                  "Category",
                  "Competency",
                  "Title",
                  "Description",
                  "Link",
                  "Status",
                  "Match",
                  "Manager Notes",
                  "Archived",
                ];
                const escape = (v: unknown) => {
                  const s = v == null ? "" : String(v);
                  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const csv = [
                  header.join(","),
                  ...filtered.map((r) =>
                    [
                      r.id,
                      r.date,
                      r.source,
                      r.category,
                      r.competency,
                      r.title,
                      r.description,
                      r.link,
                      r.status,
                      r.matchState,
                      r.managerNotes,
                      r.isArchived ? "Yes" : "No",
                    ]
                      .map(escape)
                      .join(","),
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `evidence-log-${toLocalDateString()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} />
              Export Data
            </GhostBtn>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <table
            className={`w-full text-sm table-fixed ${showArchived ? "min-w-[1760px]" : "min-w-[1520px]"}`}
          >
            <colgroup>
              <col className="w-10" />
              <col className="w-10" />
              <col className="w-32" />
              <col className="w-36" />
              <col className="w-40" />
              <col className="w-48" />
              <col className="w-[22%]" />
              <col className="w-[30%]" />
              <col className="w-44" />
              <col className="w-36" />
              <col className="w-36" />
              {showArchived && <col className="w-[100px]" />}
              {showArchived && <col className="w-[120px]" />}
            </colgroup>
            <thead style={{ background: "#F4F5F7", color: C.subtle }}>
              <tr className="text-left text-[11px] uppercase tracking-wider">
                <Th className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisibleRows}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                    aria-label={
                      allVisibleSelected ? "Deselect all visible rows" : "Select all visible rows"
                    }
                  />
                </Th>
                <Th className="w-10" />
                <Th className="w-32">Date</Th>
                <Th className="w-36">Source</Th>
                <Th className="w-40">Category</Th>
                <Th className="w-48">Competency</Th>
                <Th className="w-full">Title</Th>
                <Th className="w-full">Description</Th>
                <Th className="w-44">Link</Th>
                <Th className="w-36">Match</Th>
                <Th className="w-36">Status</Th>
                {showArchived && <Th>Archived</Th>}
                {showArchived && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isExpanded = expandedRows.has(r.id);
                const isSelected = selectedRows.has(r.id);
                const isPinned = pinnedEvidenceIds.has(r.id);
                const rawLink = (r.link ?? "").trim();
                const parsedLink = extractFirstLink(rawLink);
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      onClick={() =>
                        !showArchived && (!readOnly || managerReviewEnabled) && onOpenRow(r)
                      }
                      className={`group relative border-t hover:bg-[#FAFBFC] transition-colors ${
                        showArchived || (readOnly && !managerReviewEnabled) ? "" : "cursor-pointer"
                      }`}
                      style={{ borderColor: C.border }}
                    >
                      <Td className="w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleRowSelected(r.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300"
                          aria-label={`Select row ${r.title}`}
                        />
                      </Td>
                      <Td className="w-10">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRowExpanded(r.id);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F5F7]"
                          style={{ color: C.slate }}
                          aria-label={isExpanded ? "Collapse row details" : "Expand row details"}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </Td>
                      <Td className="w-32 whitespace-nowrap">
                        <EvidenceDateCell date={r.date} />
                      </Td>
                      <Td className="w-36">
                        <span className="inline-flex max-w-full truncate align-middle">
                          <SourceChip source={r.source} />
                        </span>
                      </Td>
                      <Td className="w-40">
                        <span className="inline-flex max-w-full truncate align-middle">
                          <Badge tone="neutral">{r.category}</Badge>
                        </span>
                      </Td>
                      <Td className="w-48" style={{ color: C.slate }}>
                        <span className="block truncate">{r.competency}</span>
                      </Td>
                      <Td className="max-w-md font-semibold relative" style={{ color: C.navy }}>
                        {!showArchived && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onTogglePin(r);
                            }}
                            className={`absolute top-3 right-3 p-1 rounded-md border shadow-sm transition-all duration-150 cursor-pointer ${
                              isPinned
                                ? "opacity-100 text-indigo-600 bg-indigo-50 border-indigo-200"
                                : "opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400 hover:text-indigo-600"
                            }`}
                            title={
                              isPinned
                                ? "Unpin evidence from workspace"
                                : "Pin evidence to workspace"
                            }
                            aria-label={isPinned ? `Unpin ${r.title}` : `Pin ${r.title}`}
                          >
                            <Pin size={14} />
                          </button>
                        )}
                        <span className={`block truncate ${showArchived ? "" : "pr-9"}`}>
                          {r.title}
                        </span>
                      </Td>
                      <Td className="max-w-md" style={{ color: C.slate }}>
                        <span className="block truncate">{r.description}</span>
                      </Td>
                      <Td className="w-44" style={{ color: C.slate }}>
                        {rawLink ? (
                          parsedLink ? (
                            <a
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex max-w-full items-center gap-1 truncate hover:underline"
                              style={{ color: C.primary }}
                              href={parsedLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={12} />
                              <span className="truncate">Open</span>
                            </a>
                          ) : (
                            <span className="block truncate">{rawLink}</span>
                          )
                        ) : (
                          <span style={{ color: C.subtle }}>-</span>
                        )}
                      </Td>
                      <Td className="w-36">
                        <MatchBadge match={r.matchState} />
                      </Td>
                      <Td className="w-36">
                        {r.status === "Reviewed" ? (
                          <Badge tone="success" icon={<CheckCircle size={11} />}>
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge tone="warning" icon={<Clock size={11} />}>
                            Pending Review
                          </Badge>
                        )}
                      </Td>
                      {showArchived && (
                        <Td className="w-28 whitespace-nowrap" style={{ color: C.slate }}>
                          {r.archivedDate ? formatDisplayDate(r.archivedDate) : "-"}
                        </Td>
                      )}
                      {showArchived && (
                        <Td className="w-36">
                          <div
                            className="flex items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              onClick={() => onRestore(r.id)}
                              className="px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#F4F5F7]"
                              style={{ color: C.primary }}
                              title="Restore"
                            >
                              <ArchiveRestore size={12} /> Restore
                            </button>
                            <button
                              onClick={() => setConfirmDelete(r)}
                              className="px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#FFEBE6]"
                              style={{ color: C.red }}
                              title="Permanently Delete"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </Td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr className="border-t" style={{ borderColor: C.border }}>
                        <td
                          colSpan={totalColumns}
                          className="px-4 py-4 bg-gray-50 dark:bg-gray-900/40"
                        >
                          <div className="w-full max-w-6xl space-y-3 pr-6">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C]">
                                Title
                              </div>
                              <p
                                className="mt-1 text-sm whitespace-pre-wrap wrap-break-word"
                                style={{ color: C.navy }}
                              >
                                {r.title || "-"}
                              </p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C]">
                                Link
                              </div>
                              {rawLink ? (
                                parsedLink ? (
                                  <a
                                    href={parsedLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex items-center gap-1 text-sm break-all hover:underline"
                                    style={{ color: C.primary }}
                                  >
                                    {rawLink}
                                    <ExternalLink size={12} />
                                  </a>
                                ) : (
                                  <p
                                    className="mt-1 text-sm whitespace-pre-wrap wrap-break-word"
                                    style={{ color: C.slate }}
                                  >
                                    {rawLink}
                                  </p>
                                )
                              ) : (
                                <p className="mt-1 text-sm" style={{ color: C.subtle }}>
                                  -
                                </p>
                              )}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C]">
                                Description
                              </div>
                              <p
                                className="mt-1 text-sm whitespace-pre-wrap wrap-break-word"
                                style={{ color: C.slate }}
                              >
                                {r.description || "-"}
                              </p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C]">
                                Manager Notes
                              </div>
                              <p
                                className="mt-1 text-sm whitespace-pre-wrap wrap-break-word"
                                style={{ color: C.slate }}
                              >
                                {r.managerNotes || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="text-center py-12 text-sm"
                    style={{ color: C.subtle }}
                  >
                    {showArchived ? "No archived evidence." : "No evidence matches your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            destructive
            title="Permanently delete evidence?"
            description={`"${confirmDelete.title}" will be permanently removed. This action cannot be undone.`}
            confirmLabel="Delete permanently"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              onPermanentDelete(confirmDelete.id);
              setConfirmDelete(null);
            }}
          />
        )}
        {confirmBulkDeleteIds && (
          <ConfirmDialog
            destructive
            title={`${showArchived ? "Delete" : "Archive"} ${confirmBulkDeleteIds.length} rows?`}
            description={
              showArchived
                ? "Selected archived rows will be permanently deleted. This action cannot be undone."
                : "Selected rows will be moved to archive."
            }
            confirmLabel={showArchived ? "Delete selected" : "Archive selected"}
            cancelLabel="Cancel"
            onCancel={() => setConfirmBulkDeleteIds(null)}
            onConfirm={() => {
              if (showArchived) {
                confirmBulkDeleteIds.forEach((id) => onPermanentDelete(id));
              } else {
                confirmBulkDeleteIds.forEach((id) => onArchive(id));
              }
              setExpandedRows((previous) => {
                const next = new Set(previous);
                confirmBulkDeleteIds.forEach((id) => next.delete(id));
                return next;
              });
              setSelectedRows((previous) => {
                const next = new Set(previous);
                confirmBulkDeleteIds.forEach((id) => next.delete(id));
                return next;
              });
              setConfirmBulkDeleteIds(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function MatchBadge({ match }: { match: EvidenceMatch }) {
  if (match === "Yes")
    return (
      <Badge tone="success" icon={<CheckCircle2 size={11} />}>
        Match: Yes
      </Badge>
    );
  if (match === "No")
    return (
      <Badge tone="danger" icon={<X size={11} />}>
        Match: No
      </Badge>
    );
  if (match === "Somewhat")
    return (
      <Badge tone="warning" icon={<AlertCircle size={11} />}>
        Somewhat
      </Badge>
    );
  return <Badge tone="neutral">Not Set</Badge>;
}

function EvidenceDateCell({ date }: { date: string }) {
  const parts = formatEvidenceDateParts(date);
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-[12px] font-semibold" style={{ color: C.navy }}>
        {parts.dayMonth}
      </span>
      {parts.year && (
        <span className="text-[11px]" style={{ color: C.subtle }}>
          {parts.year}
        </span>
      )}
    </span>
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
