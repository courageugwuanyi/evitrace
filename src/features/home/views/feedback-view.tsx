import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  getEngineerFeedbackDossier,
  getIncomingFeedbackRequests,
  getOutgoingFeedbackRequests,
  requestPeerFeedback,
  submitPeerFeedback,
} from "@/lib/api/feedback";
import { sendNotification } from "@/lib/api/notifications.functions";
import { supabase } from "@/lib/supabase";
import type { ThreeSixtyFeedback } from "@/lib/database.types";
import { Card, PrimaryBtn, C, Select } from "@/features/home/shared/ui-kit";

type FeedbackViewMode = "my_insights" | "requests";
type RelationshipType = ThreeSixtyFeedback["relationship_type"];
type ExecutionVector = NonNullable<ThreeSixtyFeedback["execution_vector"]>;

type TeamMember = {
  id: string;
  fullName: string;
  jobTitle: string;
  avatarUrl: string | null;
};

type FormStateByRequest = Record<
  string,
  {
    continueText: string;
    stopText: string;
    startText: string;
    vector: ExecutionVector;
  }
>;

const RELATION_OPTIONS: Array<{ value: RelationshipType; label: string }> = [
  { value: "peer_engineer", label: "Peer Engineer" },
  { value: "ux_partner", label: "UX Partner" },
  { value: "product_manager", label: "Product Manager" },
  { value: "pmm_partner", label: "PMM" },
  { value: "quality_engineer", label: "Quality Engineer" },
];

const EXECUTION_VECTOR_OPTIONS: Array<{ value: ExecutionVector; label: string }> = [
  { value: "working_below", label: "Working below current level baseline" },
  { value: "meeting_expectations", label: "Fully meeting level expectations" },
  { value: "executing_above", label: "Actively executing at the next level up" },
];

function EmptySlate({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function requestLabel(member: TeamMember | null): string {
  if (!member) return "";
  return member.jobTitle ? `${member.fullName} (${member.jobTitle})` : member.fullName;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function shuffleStrings(values: string[]): string[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return fallback;
}

function formatDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function addMonths(base: Date, months: number): Date {
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function FeedbackView() {
  const { userId } = useAuth();
  const activeUserId = userId ?? "";
  const [activeView, setActiveView] = useState<FeedbackViewMode>("my_insights");
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [selectedRelationType, setSelectedRelationType] =
    useState<RelationshipType>("peer_engineer");
  const [expandedIncomingId, setExpandedIncomingId] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<ThreeSixtyFeedback[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ThreeSixtyFeedback[]>([]);
  const [dossierRows, setDossierRows] = useState<ThreeSixtyFeedback[]>([]);
  const [requestCadenceMonths, setRequestCadenceMonths] = useState<1 | 2 | 3 | 6>(3);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);
  const [formState, setFormState] = useState<FormStateByRequest>({});

  const { data: teammates = [] } = useQuery({
    queryKey: ["three-sixty-team-members", activeUserId],
    enabled: Boolean(activeUserId),
    queryFn: async (): Promise<TeamMember[]> => {
      if (!activeUserId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, job_title, avatar_url")
        .neq("id", activeUserId)
        .order("full_name", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (
        (data ?? []) as Array<{
          id: string;
          full_name: string | null;
          job_title: string | null;
          avatar_url: string | null;
        }>
      )
        .filter((row) => Boolean(row.id) && Boolean(row.full_name))
        .map((row) => ({
          id: row.id,
          fullName: row.full_name ?? "Unknown teammate",
          jobTitle: row.job_title ?? "",
          avatarUrl: row.avatar_url ?? null,
        }));
    },
  });

  const loadFeedbackData = useCallback(async () => {
    if (!activeUserId) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setDossierRows([]);
      setIsBootstrapping(false);
      return;
    }
    setIsBootstrapping(true);
    try {
      const [incoming, dossier, outgoing] = await Promise.all([
        getIncomingFeedbackRequests(),
        getEngineerFeedbackDossier(activeUserId),
        getOutgoingFeedbackRequests(activeUserId),
      ]);
      setIncomingRequests(incoming);
      setDossierRows(dossier);
      setOutgoingRequests(outgoing);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load feedback data."));
    } finally {
      setIsBootstrapping(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    void loadFeedbackData();
  }, [loadFeedbackData]);

  const submittedCount = dossierRows.length;
  const thresholdMet = submittedCount >= 3;
  const pendingCount = incomingRequests.length;
  const uniqueRequestedReviewerCount = useMemo(
    () => new Set(outgoingRequests.map((row) => row.reviewer_id)).size,
    [outgoingRequests],
  );
  const reviewersNeededForAnonymousCohort = Math.max(0, 3 - uniqueRequestedReviewerCount);
  const hasMinimumAnonymousPool = uniqueRequestedReviewerCount >= 3;
  const isSmallAvailableTeam = teammates.length > 0 && teammates.length < 3;
  const latestByReviewer = useMemo(() => {
    const byReviewer = new Map<string, ThreeSixtyFeedback>();
    for (const row of outgoingRequests) {
      const existing = byReviewer.get(row.reviewer_id);
      if (!existing) {
        byReviewer.set(row.reviewer_id, row);
        continue;
      }
      if (new Date(row.created_at).getTime() > new Date(existing.created_at).getTime()) {
        byReviewer.set(row.reviewer_id, row);
      }
    }
    return byReviewer;
  }, [outgoingRequests]);
  const selectedReviewerLatestRequest = selectedReviewerId
    ? latestByReviewer.get(selectedReviewerId)
    : undefined;
  const nextEligibleDate = selectedReviewerLatestRequest
    ? addMonths(new Date(selectedReviewerLatestRequest.created_at), requestCadenceMonths)
    : null;
  const canRequestSelectedReviewer = !nextEligibleDate || Date.now() >= nextEligibleDate.getTime();

  const shuffledContinue = useMemo(
    () =>
      shuffleStrings(
        dossierRows
          .map((row) => row.continue_feedback?.trim() ?? "")
          .filter((value) => value.length > 0),
      ),
    [dossierRows],
  );
  const shuffledStop = useMemo(
    () =>
      shuffleStrings(
        dossierRows
          .map((row) => row.stop_feedback?.trim() ?? "")
          .filter((value) => value.length > 0),
      ),
    [dossierRows],
  );
  const shuffledStart = useMemo(
    () =>
      shuffleStrings(
        dossierRows
          .map((row) => row.start_feedback?.trim() ?? "")
          .filter((value) => value.length > 0),
      ),
    [dossierRows],
  );

  async function handleRequestPeerFeedback() {
    if (!activeUserId) {
      toast.error("Please sign in to request feedback.");
      return;
    }
    if (!selectedReviewerId) {
      toast.error("Select a teammate first.");
      return;
    }
    if (!canRequestSelectedReviewer && nextEligibleDate) {
      toast.error(
        `Request already sent recently. You can send the next request on ${formatDateLabel(nextEligibleDate.toISOString())}.`,
      );
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await requestPeerFeedback(activeUserId, selectedReviewerId, selectedRelationType);
      try {
        await sendNotification({
          data: {
            userId: selectedReviewerId,
            type: "feedback",
            title: "New 360 feedback request",
            description:
              "A teammate requested your Start/Stop/Continue feedback. Open Teammate Requests to respond.",
          },
        });
      } catch {
        // Best-effort only; request should still succeed.
      }
      setSelectedReviewerId("");
      setSelectedRelationType("peer_engineer");
      toast.success("Review request sent");
      await loadFeedbackData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send request."));
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  async function handleSubmitEvaluation(request: ThreeSixtyFeedback) {
    const currentForm = formState[request.id];
    if (!currentForm) {
      toast.error("Complete all required fields first.");
      return;
    }
    if (
      currentForm.continueText.trim().length === 0 ||
      currentForm.stopText.trim().length === 0 ||
      currentForm.startText.trim().length === 0
    ) {
      toast.error("All three text sections are required.");
      return;
    }
    setIsSubmittingEvaluation(true);
    try {
      await submitPeerFeedback(request.id, {
        continueText: currentForm.continueText.trim(),
        stopText: currentForm.stopText.trim(),
        startText: currentForm.startText.trim(),
        vector: currentForm.vector,
      });
      toast.success("Evaluation submitted");
      setIncomingRequests((previous) => previous.filter((item) => item.id !== request.id));
      setExpandedIncomingId(null);
      setFormState((previous) => {
        const next = { ...previous };
        delete next[request.id];
        return next;
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit evaluation."));
    } finally {
      setIsSubmittingEvaluation(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full mt-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">360 Feedback</h2>
          <p className="text-sm text-slate-500">
            Confidential Start/Stop/Continue loops with threshold-gated anonymity.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveView("my_insights")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeView === "my_insights"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveView("requests")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeView === "requests"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Teammate Requests{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        </div>
      </div>

      {activeView === "my_insights" ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
          <Card className="p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Nominate Peer Pool</h3>
              <p className="mt-1 text-xs text-slate-500">
                Add cross-functional reviewers for this quarter feedback cycle.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Teammate</span>
                <Select
                  value={selectedReviewerId}
                  onChange={(event) => setSelectedReviewerId(event.target.value)}
                >
                  <option value="">Select teammate</option>
                  {teammates.map((member) => (
                    <option key={member.id} value={member.id}>
                      {requestLabel(member)}
                    </option>
                  ))}
                </Select>
              </label>
              {isSmallAvailableTeam ? (
                <div className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                  <p className="font-semibold text-amber-900">🔒 More Reviewers Needed for Anonymity</p>
                  <p className="mt-1">
                    To keep feedback strictly anonymous, you need a minimum of{" "}
                    <strong>3 different reviewers</strong>.
                  </p>
                  <p className="mt-1">
                    <strong>Next Step:</strong> Expand your list by adding cross-functional
                    teammates, such as a PM, UX Designer, QA, or adjacent engineering partners.
                  </p>
                </div>
              ) : null}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Relationship type</span>
                <div className="flex flex-wrap gap-2">
                  {RELATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRelationType(option.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        selectedRelationType === option.value
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <PrimaryBtn
                type="button"
                onClick={handleRequestPeerFeedback}
                disabled={isSubmittingRequest || !selectedReviewerId || !canRequestSelectedReviewer}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
                style={{ background: "#4F46E5" }}
              >
                {isSubmittingRequest ? <Loader2 size={14} className="animate-spin" /> : null}
                Request Review
              </PrimaryBtn>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  Request cadence guardrail
                </span>
                <p className="text-xs text-slate-500">
                  Restrict how often this teammate can receive a new request from you.
                </p>
                <Select
                  value={String(requestCadenceMonths)}
                  onChange={(event) =>
                    setRequestCadenceMonths(Number(event.target.value) as 1 | 2 | 3 | 6)
                  }
                >
                  <option value="1">Every 1 month</option>
                  <option value="2">Every 2 months</option>
                  <option value="3">Every 3 months</option>
                  <option value="6">Every 6 months</option>
                </Select>
              </label>
              {selectedReviewerLatestRequest ? (
                <div className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                  Last request sent on {formatDateLabel(selectedReviewerLatestRequest.created_at)}.
                  {nextEligibleDate
                    ? ` Next eligible request date: ${formatDateLabel(nextEligibleDate.toISOString())}.`
                    : ""}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                {submittedCount} of 3 reviews submitted
              </div>
              <div
                className={`w-full rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
                  hasMinimumAnonymousPool
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {hasMinimumAnonymousPool
                  ? `Anonymous cohort ready: ${uniqueRequestedReviewerCount} distinct reviewers nominated.`
                  : `Anonymous cohort incomplete: add ${reviewersNeededForAnonymousCohort} more distinct reviewer${reviewersNeededForAnonymousCohort === 1 ? "" : "s"} to reach the 3-person minimum.`}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Request activity</p>
              {outgoingRequests.length === 0 ? (
                <p className="text-xs text-slate-500">No requests sent yet.</p>
              ) : (
                <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                  {outgoingRequests.slice(0, 8).map((row) => (
                    <div
                      key={row.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                    >
                      <div className="font-medium text-slate-800">
                        {row.profiles?.full_name ?? "Teammate"}
                      </div>
                      <div>
                        Sent {formatDateLabel(row.created_at)} -{" "}
                        {row.status === "pending" ? "Awaiting response" : "Submitted"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">My Insights</h3>
              <p className="mt-1 text-xs text-slate-500">
                Feedback is batch-released only when anonymity safeguards are satisfied.
              </p>
            </div>
            {isBootstrapping ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Loading feedback pool...
              </div>
            ) : !thresholdMet ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center max-w-md mx-auto my-8 space-y-4 font-sans">
                <div className="h-9 w-9 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-amber-600 font-bold text-xs">🔒</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Calibration Threshold Active
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500 font-bold">
                    Evaluation Status: {submittedCount} of 3 reviews completed
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  To safeguard anonymity and ensure balanced cross-functional perspectives,
                  performance feedback text blocks remain protected until at least three distinct
                  teammates submit their reviews.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">What to Continue</p>
                  {shuffledContinue.map((item, idx) => (
                    <p key={`continue-${idx}`} className="text-sm text-slate-700">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">What to Stop</p>
                  {shuffledStop.map((item, idx) => (
                    <p key={`stop-${idx}`} className="text-sm text-slate-700">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">What to Start</p>
                  {shuffledStart.map((item, idx) => (
                    <p key={`start-${idx}`} className="text-sm text-slate-700">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Teammate Requests</h3>
            <p className="mt-1 text-xs text-slate-500">
              Complete incoming review requests to support your peers.
            </p>
          </div>
          {isBootstrapping ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Loading requests...
            </div>
          ) : incomingRequests.length === 0 ? (
            <EmptySlate message="Your request queue is clear. Teammates' feedback invitations will appear here." />
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((request) => {
                const expanded = expandedIncomingId === request.id;
                const currentForm = formState[request.id] ?? {
                  continueText: "",
                  stopText: "",
                  startText: "",
                  vector: "meeting_expectations" as ExecutionVector,
                };
                const canSubmit =
                  currentForm.continueText.trim().length > 0 &&
                  currentForm.stopText.trim().length > 0 &&
                  currentForm.startText.trim().length > 0;
                const requesterName = request.profiles?.full_name || "Teammate";

                return (
                  <div key={request.id} className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                          {initialsFor(requesterName)}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {requesterName} requested your performance feedback for their quarter
                          review.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIncomingId((previous) =>
                            previous === request.id ? null : request.id,
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                      >
                        Complete Review (Takes 4m)
                        <ChevronDown
                          size={14}
                          className={`ml-2 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="space-y-4 px-4 py-4">
                            <label className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-600">
                                What does this person do exceptionally well that they should
                                CONTINUE doing?
                              </span>
                              <textarea
                                value={currentForm.continueText}
                                onChange={(event) =>
                                  setFormState((previous) => ({
                                    ...previous,
                                    [request.id]: {
                                      ...currentForm,
                                      continueText: event.target.value,
                                    },
                                  }))
                                }
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-600">
                                What should this person STOP doing or adjust to reduce team
                                friction?
                              </span>
                              <textarea
                                value={currentForm.stopText}
                                onChange={(event) =>
                                  setFormState((previous) => ({
                                    ...previous,
                                    [request.id]: {
                                      ...currentForm,
                                      stopText: event.target.value,
                                    },
                                  }))
                                }
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-600">
                                What is one concrete skill or focus area they should START learning
                                next?
                              </span>
                              <textarea
                                value={currentForm.startText}
                                onChange={(event) =>
                                  setFormState((previous) => ({
                                    ...previous,
                                    [request.id]: {
                                      ...currentForm,
                                      startText: event.target.value,
                                    },
                                  }))
                                }
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-600">
                                Workspace Execution Vector
                              </span>
                              <Select
                                value={currentForm.vector}
                                onChange={(event) =>
                                  setFormState((previous) => ({
                                    ...previous,
                                    [request.id]: {
                                      ...currentForm,
                                      vector: event.target.value as ExecutionVector,
                                    },
                                  }))
                                }
                              >
                                {EXECUTION_VECTOR_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </label>
                            <div className="flex justify-end pt-2">
                              <PrimaryBtn
                                type="button"
                                onClick={() => void handleSubmitEvaluation(request)}
                                disabled={!canSubmit || isSubmittingEvaluation}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                                style={{ background: C.green }}
                              >
                                {isSubmittingEvaluation ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : null}
                                Submit Evaluation
                              </PrimaryBtn>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
