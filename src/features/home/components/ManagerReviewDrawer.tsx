import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, TriangleAlert, X } from "lucide-react";

interface ManagerReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemDescription: string;
  onConfirmReview: (status: "verified" | "modification_required", notes: string) => Promise<void>;
}

export function ManagerReviewDrawer({
  isOpen,
  onClose,
  itemTitle,
  itemDescription,
  onConfirmReview,
}: ManagerReviewDrawerProps) {
  const [reviewStatus, setReviewStatus] = useState<"verified" | "modification_required">(
    "verified",
  );
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReviewStatus("verified");
    setFeedbackNotes("");
  }, [itemTitle]);

  if (!isOpen) return null;

  // Interlock: block change requests without concrete notes.
  const isInterlockTriggered =
    reviewStatus === "modification_required" && feedbackNotes.trim().length === 0;

  const handleSubmit = async () => {
    if (isInterlockTriggered) return;

    setSubmitting(true);
    try {
      await onConfirmReview(reviewStatus, feedbackNotes);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                Inspection Pane
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Workspace Guidelines
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Item Title
              </label>
              <h4 className="text-sm font-bold leading-snug text-slate-800">{itemTitle}</h4>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Content Description
              </label>
              <p className="whitespace-pre-wrap rounded-lg border border-slate-200/60 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {itemDescription}
              </p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Review Status Lozenges
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus("verified")}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                    reviewStatus === "verified"
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      reviewStatus === "verified" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <span className="mt-1 block text-xs font-bold">Verified</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus("modification_required")}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                    reviewStatus === "modification_required"
                      ? "border-amber-500 bg-amber-50/40 text-amber-900 ring-2 ring-amber-500/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      reviewStatus === "modification_required" ? "text-amber-600" : "text-slate-400"
                    }`}
                  />
                  <span className="mt-1 block text-xs font-bold">Needs Modification</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Justification Notes{" "}
                {reviewStatus === "modification_required" && (
                  <span className="font-bold text-rose-500">* Required</span>
                )}
              </label>
              <textarea
                rows={4}
                value={feedbackNotes}
                onChange={(event) => setFeedbackNotes(event.target.value)}
                placeholder={
                  reviewStatus === "modification_required"
                    ? "Please outline exact adjustment criteria so this item can be revised."
                    : "Optional verification notes."
                }
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {isInterlockTriggered && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Workspace policy requires specific change criteria before submitting.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isInterlockTriggered || submitting}
              className={`h-8 rounded-lg px-4 text-xs font-bold text-white transition-colors ${
                isInterlockTriggered
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : reviewStatus === "modification_required"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {submitting
                ? "Processing..."
                : reviewStatus === "modification_required"
                  ? "Request Changes"
                  : "Approve and Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
