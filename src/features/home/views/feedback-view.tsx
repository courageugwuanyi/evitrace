import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Link as LinkIcon, MessageCircleHeart, Save, Send, Share2, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useAddFeedback, useFeedbackQuery } from "@/lib/api/feedback";
import { toLocalDateString } from "@/lib/datetime";
import type { FrameworkCategoryDefinition } from "@/features/home/shared/framework-taxonomy";
import { buildFeedbackScoreMap, resolveFrameworkCategoryEntries, resolveFrameworkEffectivenessScale } from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import { Badge, C, Card, Field, GhostBtn, Input, Pill, PrimaryBtn, Select } from "@/features/home/shared/ui-kit";
import { useFramework } from "@/context/FrameworkContext";

type FeedbackType = "Manager Requested" | "Ad-hoc" | "Peer Review";

function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  const tone: "info" | "success" | "neutral" =
    type === "Manager Requested" ? "info" : type === "Peer Review" ? "success" : "neutral";
  return <Badge tone={tone}>{type}</Badge>;
}

type SeniorityBand = "Junior / Associate" | "Mid-Level" | "Senior / Lead / Staff";

const SENIORITY_TEMPLATE: Record<
  SeniorityBand,
  {
    prompt: string;
    focusAreas: string[];
    requestFocusSeed: string;
  }
> = {
  "Junior / Associate": {
    prompt: "Template tuned for early-career growth and execution consistency.",
    focusAreas: [
      "Learning acceleration and speed of skill acquisition.",
      "Executing assigned ticket mechanics with clarity and quality.",
      "Applying pull request code review notes in follow-up work.",
    ],
    requestFocusSeed:
      "How effectively am I applying code review feedback and accelerating my learning on assigned tickets?",
  },
  "Mid-Level": {
    prompt: "Template tuned for independent delivery and broader team contribution.",
    focusAreas: [
      "Feature branch ownership from planning through merge readiness.",
      "Prompt pull request testing and issue resolution.",
      "Self-sufficient debugging and active cross-functional participation.",
    ],
    requestFocusSeed:
      "How effectively am I owning features end-to-end, testing PRs promptly, and collaborating across functions?",
  },
  "Senior / Lead / Staff": {
    prompt: "Template tuned for technical leadership and organizational impact.",
    focusAreas: [
      "Scalable systems architecture and long-term maintainability.",
      "Technical mentorship and raising engineering standards.",
      "Risk mitigation, trade-off decisions, and product alignment.",
    ],
    requestFocusSeed:
      "How effectively am I driving scalable architecture, mentoring others, and balancing engineering risk with product goals?",
  },
};

function resolveSeniorityBand(level: string | undefined): SeniorityBand {
  const value = (level ?? "").trim().toLowerCase();
  if (value.includes("junior") || value.includes("associate")) return "Junior / Associate";
  if (value.includes("senior") || value.includes("lead") || value.includes("staff")) {
    return "Senior / Lead / Staff";
  }
  return "Mid-Level";
}

function normalizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function FeedbackTextarea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C9AFF] focus:border-[#2684FF]"
      style={{ borderColor: C.border, color: C.navy }}
    />
  );
}

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(9, 30, 66, 0.54)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

function AskFeedbackModal({
  initialFocus,
  onClose,
  onSubmit,
}: {
  initialFocus: string;
  onClose: () => void;
  onSubmit: (reviewer: string, focus: string) => void;
}) {
  const [reviewer, setReviewer] = useState("");
  const [focus, setFocus] = useState(initialFocus);
  const canSend = reviewer.trim().length > 0 && focus.trim().length > 0;

  return (
    <ModalBackdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border"
        style={{ borderColor: C.border }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <MessageCircleHeart size={16} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Request 360 Feedback
              </div>
              <div className="text-xs" style={{ color: C.subtle }}>
                Responses can be submitted anonymously.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Reviewer (name or email)">
            <Input
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              placeholder="e.g. Daniela Espitia"
            />
          </Field>
          <Field label="Focus area">
            <FeedbackTextarea
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              rows={4}
              placeholder="What would you like feedback on? e.g. Collaboration on the payments migration."
            />
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            onClick={() => canSend && onSubmit(reviewer.trim(), focus.trim())}
            disabled={!canSend}
          >
            <Send size={14} />
            Send Request
          </PrimaryBtn>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}

export function FeedbackView() {
  const { userId, user } = useAuth();
  const { categories, getQuestionsForCategory, currentFramework } = useFramework();
  const feedbackUserId = userId ?? "";
  const { data: items = [] } = useFeedbackQuery(feedbackUserId);
  const addFeedbackMutation = useAddFeedback(feedbackUserId);
  const [filter, setFilter] = useState<"All" | FeedbackType>("All");
  const [asking, setAsking] = useState(false);
  const [seniorityBand, setSeniorityBand] = useState<SeniorityBand>(() =>
    resolveSeniorityBand(user?.currentLevel),
  );
  const [seniorityOverridden, setSeniorityOverridden] = useState(false);
  const categoryEntries = useMemo(() => {
    if (categories.length > 0) {
      return categories.map(
        (categoryName) =>
          [
            categoryName,
            {
              summary: "",
              items: getQuestionsForCategory(categoryName),
            },
          ] as [string, FrameworkCategoryDefinition],
      );
    }
    return resolveFrameworkCategoryEntries(currentFramework?.matrix ?? null);
  }, [categories, currentFramework?.matrix, getQuestionsForCategory]);
  const effectivenessScale = useMemo(
    () => resolveFrameworkEffectivenessScale(currentFramework?.matrix ?? null),
    [currentFramework?.matrix],
  );
  const defaultScaleValue =
    effectivenessScale.find((point) => point.value === 3)?.value ?? effectivenessScale[0]?.value ?? 1;
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(() =>
    buildFeedbackScoreMap(categoryEntries, defaultScaleValue),
  );
  const [strengthNarrative, setStrengthNarrative] = useState("");
  const [improvementNarrative, setImprovementNarrative] = useState("");
  const [nextSkillNarrative, setNextSkillNarrative] = useState("");
  const [externalSurveyDraft, setExternalSurveyDraft] = useState("");
  const [externalSurveyUrl, setExternalSurveyUrl] = useState("");
  const [requestLink, setRequestLink] = useState("");

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((item) => item.type === filter)),
    [items, filter],
  );
  const activeTemplate = SENIORITY_TEMPLATE[seniorityBand];
  const ratedItemsCount = useMemo(
    () => categoryEntries.reduce((sum, [, details]) => sum + details.items.length, 0),
    [categoryEntries],
  );
  const avgScore = useMemo(
    () =>
      Number(
        (
          Object.values(scores)
            .flatMap((itemScores) => Object.values(itemScores))
            .reduce((sum, score) => sum + score, 0) /
          Math.max(ratedItemsCount, 1)
        ).toFixed(2),
      ),
    [ratedItemsCount, scores],
  );

  const canSubmitEvaluation =
    strengthNarrative.trim().length > 0 &&
    improvementNarrative.trim().length > 0 &&
    nextSkillNarrative.trim().length > 0;

  useEffect(() => {
    if (!seniorityOverridden) {
      setSeniorityBand(resolveSeniorityBand(user?.currentLevel));
    }
  }, [user?.currentLevel, seniorityOverridden]);

  useEffect(() => {
    if (typeof window === "undefined" || !feedbackUserId) return;
    const saved = window.localStorage.getItem(`evitrace.external-feedback-url.${feedbackUserId}`);
    if (!saved) return;
    setExternalSurveyUrl(saved);
    setExternalSurveyDraft(saved);
  }, [feedbackUserId]);

  useEffect(() => {
    setScores((previous) => {
      const next = buildFeedbackScoreMap(categoryEntries, defaultScaleValue);
      categoryEntries.forEach(([category, details]) => {
        details.items.forEach((item) => {
          const previousValue = previous[category]?.[item];
          if (typeof previousValue === "number") {
            next[category][item] = previousValue;
          }
        });
      });
      return next;
    });
  }, [categoryEntries, defaultScaleValue]);

  function updateCapabilityScore(category: string, item: string, value: number) {
    setScores((previous) => ({
      ...previous,
      [category]: {
        ...(previous[category] ?? {}),
        [item]: value,
      },
    }));
  }

  function saveExternalSurveyUrl() {
    if (!feedbackUserId) {
      toast.error("Please sign in before saving external survey links.");
      return;
    }
    if (!externalSurveyDraft.trim()) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`evitrace.external-feedback-url.${feedbackUserId}`);
      }
      setExternalSurveyUrl("");
      toast.success("External survey link removed");
      return;
    }
    const normalized = normalizeExternalUrl(externalSurveyDraft);
    if (!normalized) {
      toast.error("Please provide a valid HTTP(S) URL.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`evitrace.external-feedback-url.${feedbackUserId}`, normalized);
    }
    setExternalSurveyUrl(normalized);
    setExternalSurveyDraft(normalized);
    toast.success("External survey link saved");
  }

  function buildRequestLink() {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    params.set("tab", "feedback");
    params.set("request", "1");
    if (feedbackUserId) params.set("profile", feedbackUserId);
    if (user?.fullName) params.set("engineer", user.fullName);
    if (user?.team) params.set("team", user.team);
    params.set("seniority", seniorityBand);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${params.toString()}`;
  }

  function handleRequestFeedbackLink() {
    const nextLink = buildRequestLink();
    if (!nextLink) {
      toast.error("Unable to generate feedback request link.");
      return;
    }
    setRequestLink(nextLink);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(nextLink)
        .then(() => toast.success("Request feedback link copied"))
        .catch(() => toast.success("Request feedback link generated"));
      return;
    }
    toast.success("Request feedback link generated");
  }

  function submitQualitativeEvaluation() {
    if (!canSubmitEvaluation) {
      toast.error("Please complete all mandatory qualitative prompts.");
      return;
    }
    const scoreRows = categoryEntries.flatMap(([categoryName, details]) =>
      details.items.map((item) => {
        const currentScore = scores[categoryName]?.[item] ?? defaultScaleValue;
        const scoreLabel = effectivenessScale.find((point) => point.value === currentScore)?.label ?? "";
        return `- Category: ${categoryName} | Item: ${item} | Effectiveness: ${currentScore}${scoreLabel ? ` (${scoreLabel})` : ""}`;
      }),
    );
    const payload =
      `Seniority Template: ${seniorityBand}\n` +
      `Framework Matrix Average (1-5): ${avgScore}\n` +
      `Framework Ratings:\n${scoreRows.join("\n")}\n` +
      `Strength: ${strengthNarrative.trim()}\n` +
      `Improvement Example: ${improvementNarrative.trim()}\n` +
      `Next Skill: ${nextSkillNarrative.trim()}`;

    addFeedbackMutation.mutate(
      {
        date: toLocalDateString(),
        provider: "Self 360 Evaluation",
        type: "Ad-hoc",
        notes: payload,
        anonymous: false,
      },
      {
        onSuccess: () => {
          toast.success("360 evaluation saved");
        },
      },
    );
  }

  function addRequest(reviewer: string, focus: string) {
    addFeedbackMutation.mutate(
      {
        date: toLocalDateString(),
        provider: reviewer,
        type: "Manager Requested",
        notes: `Requested feedback on: ${focus}. Awaiting response.`,
        anonymous: false,
      },
      {
        onSuccess: () => {
          setAsking(false);
          toast.success("Feedback request sent");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 px-6 py-8 md:px-8">
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-lg font-semibold" style={{ color: C.navy }}>
                360-Degree Feedback
              </div>
              <div className="text-sm mt-1" style={{ color: C.subtle }}>
                Seniority-tailored 360 survey, qualitative coaching inputs, and historical feedback in one workspace.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill active={filter === "All"} onClick={() => setFilter("All")}>
                All
              </Pill>
              <Pill
                active={filter === "Manager Requested"}
                onClick={() => setFilter("Manager Requested")}
              >
                Manager Requested
              </Pill>
              <Pill active={filter === "Peer Review"} onClick={() => setFilter("Peer Review")}>
                Peer
              </Pill>
              <Pill active={filter === "Ad-hoc"} onClick={() => setFilter("Ad-hoc")}>
                Ad-hoc
              </Pill>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-7 min-h-[220px] h-auto flex flex-col gap-4 justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Ask for feedback
            </div>
            <div className="text-xs mt-1" style={{ color: C.subtle }}>
              Generate a shareable request link or log a direct feedback request with full-text prompts.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <GhostBtn
              onClick={handleRequestFeedbackLink}
              className="w-full h-auto min-h-[2.75rem] px-4 py-2.5 justify-center whitespace-normal break-words leading-snug"
            >
              <Share2 size={14} />
              Request Feedback Link
            </GhostBtn>
            <PrimaryBtn
              onClick={() => setAsking(true)}
              className="w-full h-auto min-h-[2.75rem] px-4 py-2.5 justify-center whitespace-normal break-words leading-snug"
            >
              <Send size={14} />
              Log Feedback Request
            </PrimaryBtn>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            Historical Feedback
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Received and requested feedback entries, ordered by date.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wide"
                style={{ background: "#F4F5F7", color: C.subtle }}
              >
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Provider</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Type</th>
                <th className="px-4 py-3 font-semibold">Feedback Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: C.subtle }}
                  >
                    No feedback in this filter yet.
                  </td>
                </tr>
              )}
              {filtered.map((feedbackItem) => (
                <tr key={feedbackItem.id} className="border-t align-top" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.slate }}>
                    {formatDisplayDate(feedbackItem.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                        style={{ background: feedbackItem.anonymous ? "#6B778C" : "#5243AA" }}
                      >
                        {feedbackItem.anonymous
                          ? "?"
                          : feedbackItem.provider
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                      </div>
                      <span className="font-semibold" style={{ color: C.navy }}>
                        {feedbackItem.provider}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <FeedbackTypeBadge type={feedbackItem.type} />
                  </td>
                  <td className="px-4 py-3" style={{ color: C.slate }}>
                    <div className="max-w-2xl leading-relaxed">{feedbackItem.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-end">
          <Field
            label="Feedback Template Seniority Tier"
            hint="Defaults to your profile level, but you can override it for a custom review context."
          >
            <Select
              value={seniorityBand}
              onChange={(event) => {
                setSeniorityOverridden(true);
                setSeniorityBand(event.target.value as SeniorityBand);
              }}
            >
              <option value="Junior / Associate">Junior / Associate</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior / Lead / Staff">Senior / Lead / Staff</option>
            </Select>
          </Field>
          <div className="text-xs rounded border px-3 py-2" style={{ borderColor: C.border, color: C.slate }}>
            Active profile: <span className="font-semibold" style={{ color: C.navy }}>{user?.currentLevel || "Not set"}</span>
          </div>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: C.border, background: "#F8FAFF" }}>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            {activeTemplate.prompt}
          </div>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5" style={{ color: C.slate }}>
            {activeTemplate.focusAreas.map((focus) => (
              <li key={focus}>{focus}</li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Corporate Competency Evaluation Matrix
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              Rate each framework item using your active matrix effectiveness scale.
            </div>
          </div>
          <Badge tone="info">Average Score: {avgScore.toFixed(2)} / 5</Badge>
        </div>
        <div className="space-y-3">
          {categoryEntries.map(([categoryName, details]) => (
            <div key={categoryName} className="border rounded-lg p-3" style={{ borderColor: C.border }}>
              <div className="text-sm font-semibold" style={{ color: C.navy }}>
                {categoryName}
              </div>
              {details.summary && (
                <div className="text-xs mt-0.5 leading-relaxed" style={{ color: C.subtle }}>
                  {details.summary}
                </div>
              )}
              <div className="mt-3 space-y-2">
                {details.items.map((item) => (
                  <div
                    key={`${categoryName}-${item}`}
                    className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 border rounded-lg px-3 py-3"
                    style={{ borderColor: C.border }}
                  >
                    <div className="text-xs leading-relaxed" style={{ color: C.slate }}>
                      {item}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {effectivenessScale.map((point) => {
                        const active = (scores[categoryName]?.[item] ?? defaultScaleValue) === point.value;
                        return (
                          <button
                            key={`${categoryName}-${item}-${point.value}`}
                            type="button"
                            onClick={() => updateCapabilityScore(categoryName, item, point.value)}
                            title={`${point.value} - ${point.label}`}
                            className="w-8 h-8 rounded border text-xs font-semibold transition-colors"
                            style={{
                              borderColor: active ? C.primary : C.border,
                              color: active ? C.primary : C.slate,
                              background: active ? C.primarySoft : "#fff",
                            }}
                          >
                            {point.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-1">
          <Field
            label="What specific technical or collaborative strength does this engineer demonstrate that significantly impacts the team's success?"
            required
          >
            <FeedbackTextarea
              value={strengthNarrative}
              onChange={(event) => setStrengthNarrative(event.target.value)}
              rows={4}
              placeholder="Describe the strongest recurring contribution and why it matters."
            />
          </Field>
          <Field
            label="Can you share an example of a recent project or pull request (PR) where this engineer could have improved their approach, code quality, or communication?"
            required
          >
            <FeedbackTextarea
              value={improvementNarrative}
              onChange={(event) => setImprovementNarrative(event.target.value)}
              rows={4}
              placeholder="Reference a concrete project, pull request, or communication moment."
            />
          </Field>
          <Field
            label="What is the single most important skill this engineer should focus on next to advance to the next level?"
            required
          >
            <FeedbackTextarea
              value={nextSkillNarrative}
              onChange={(event) => setNextSkillNarrative(event.target.value)}
              rows={4}
              placeholder="Identify one high-leverage skill and the expected impact."
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <PrimaryBtn onClick={submitQualitativeEvaluation} disabled={!canSubmitEvaluation}>
            <Save size={14} />
            Save 360 Evaluation
          </PrimaryBtn>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            Share Links & External Platform Configuration
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Add one central survey URL (Google Forms, Typeform, Confluence Forms, etc.) and share a profile-aware request link.
          </div>
        </div>
        <Field label="External Survey URL" optional>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={externalSurveyDraft}
              onChange={(event) => setExternalSurveyDraft(event.target.value)}
              placeholder="https://forms.gle/... or https://typeform.com/..."
            />
            <GhostBtn onClick={saveExternalSurveyUrl} className="sm:whitespace-nowrap">
              <Save size={14} />
              Save Anchor
            </GhostBtn>
          </div>
        </Field>
        {externalSurveyUrl && (
          <a
            href={externalSurveyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: C.primary }}
          >
            <ExternalLink size={12} />
            Open external survey anchor
          </a>
        )}
        <Field label="Request Feedback Link" optional>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={requestLink}
              readOnly
              placeholder="Click 'Request Feedback' above to generate a profile-aware link."
            />
            <GhostBtn onClick={handleRequestFeedbackLink} className="sm:whitespace-nowrap">
              <LinkIcon size={14} />
              Generate
            </GhostBtn>
          </div>
        </Field>
      </Card>

      <AnimatePresence>
        {asking && (
          <AskFeedbackModal
            initialFocus={activeTemplate.requestFocusSeed}
            onClose={() => setAsking(false)}
            onSubmit={addRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
