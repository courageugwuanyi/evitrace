import { motion } from "framer-motion";
import { ChevronRight, Download, Trash2, X } from "lucide-react";
import { Badge, C, Card, GhostBtn } from "@/features/home/shared/ui-kit";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import { type Assessment, triggerAssessmentPdfDownload } from "@/features/home/assessment/assessment-domain";

type AssessmentsArchiveTableProps = {
  assessments: Assessment[];
  onOpen: (assessment: Assessment) => void;
  onDelete: (assessmentId: string) => void;
};

type AssessmentHistoryModalProps = {
  assessments: Assessment[];
  currentId: string | null;
  onDelete: (assessmentId: string) => void;
  onClose: () => void;
  onOpen: (assessment: Assessment) => void;
};

function TableHeadCell({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function TableCell({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`.trim()} style={style}>
      {children}
    </td>
  );
}

export function AssessmentsArchiveTable({
  assessments,
  onOpen,
  onDelete,
}: AssessmentsArchiveTableProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 border-b" style={{ borderColor: C.border }}>
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Assessment Archive
        </h3>
        <p className="text-xs mt-1" style={{ color: C.subtle }}>
          All historical performance assessments. Click a row to open the full report.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "#F4F5F7", color: C.subtle }}>
            <tr className="text-left text-[11px] uppercase tracking-wider">
              <TableHeadCell>Review Period</TableHeadCell>
              <TableHeadCell>Date Completed</TableHeadCell>
              <TableHeadCell>Manager</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Overall Readiness</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 && (
              <tr>
                <TableCell>
                  <span style={{ color: C.subtle }}>No assessments yet.</span>
                </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
              </tr>
            )}
            {assessments.map((assessment) => {
              const date = formatDisplayDate(assessment.dateCompleted);
              const statusTone: "success" | "warning" | "info" =
                assessment.status === "Finalized"
                  ? "success"
                  : assessment.status === "Draft"
                    ? "warning"
                    : "info";
              const pct = assessment.overallReadinessScore;

              return (
                <tr
                  key={assessment.id}
                  onClick={() => onOpen(assessment)}
                  className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                  style={{ borderColor: C.border }}
                >
                  <TableCell className="font-semibold" style={{ color: C.navy }}>
                    {assessment.reviewPeriod}
                    <div className="text-[11px] font-normal" style={{ color: C.subtle }}>
                      {assessment.id}
                    </div>
                  </TableCell>
                  <TableCell style={{ color: C.slate }}>{date}</TableCell>
                  <TableCell style={{ color: C.slate }}>{assessment.managerName}</TableCell>
                  <TableCell>
                    <Badge tone={statusTone}>{assessment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "#EBECF0" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: pct >= 75 ? C.green : C.primary }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{ color: C.navy }}>
                        {pct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {assessment.status === "Finalized" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            triggerAssessmentPdfDownload(assessment);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border hover:border-[#0052CC] transition-colors"
                          style={{ borderColor: C.border, color: C.primary }}
                          aria-label={`Download ${assessment.reviewPeriod} PDF`}
                        >
                          <Download size={12} />
                          Download PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(assessment.id);
                        }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#FFEBE6]"
                        style={{ color: C.red }}
                        aria-label={`Delete assessment ${assessment.reviewPeriod}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#F4F5F7]"
                        style={{ color: C.subtle }}
                        aria-label="Open report"
                      >
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AssessmentHistoryModal({
  assessments,
  currentId,
  onDelete,
  onClose,
  onOpen,
}: AssessmentHistoryModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(9, 30, 66, 0.54)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-md shadow-xl border"
        style={{ borderColor: C.border }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="px-5 h-14 flex items-center justify-between border-b"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
              Assessment History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]"
            style={{ color: C.subtle }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {assessments.length === 0 && (
            <div className="text-sm text-center py-8" style={{ color: C.subtle }}>
              No assessments yet. Finalize a performance review to start the log.
            </div>
          )}
          {assessments.map((assessment) => {
            const isCurrent = assessment.id === currentId;
            const date = formatDisplayDate(assessment.dateCompleted);

            return (
              <div
                key={assessment.id}
                onClick={() => onOpen(assessment)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(assessment);
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-full text-left p-3 rounded border hover:border-[#0052CC] hover:bg-[#F4F5F7] transition-colors"
                style={{
                  borderColor: isCurrent ? C.primary : C.border,
                  background: isCurrent ? C.primarySoft : "#FAFBFC",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold" style={{ color: C.navy }}>
                    {assessment.reviewPeriod}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCurrent && <Badge tone="info">Current</Badge>}
                    <Badge tone={assessment.status === "Finalized" ? "success" : "warning"}>
                      {assessment.status}
                    </Badge>
                    {assessment.status === "Finalized" && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          triggerAssessmentPdfDownload(assessment);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border hover:border-[#0052CC]"
                        style={{ borderColor: C.border, color: C.primary }}
                      >
                        <Download size={11} />
                        PDF
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(assessment.id);
                      }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#FFEBE6]"
                      style={{ color: C.red }}
                      aria-label={`Delete assessment ${assessment.reviewPeriod}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="text-xs" style={{ color: C.subtle }}>
                    {date} &middot; {assessment.id} &middot; Mgr {assessment.managerName}
                  </div>
                  <div className="text-xs font-bold" style={{ color: C.primary }}>
                    {assessment.overallReadinessScore}% readiness
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="px-5 h-14 flex items-center justify-end border-t"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}
