import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle, Clock3, Settings, Sparkles, UserCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useInsertEvidence } from "@/lib/api/evidence";
import { useAddFeedback } from "@/lib/api/feedback";
import { useSettingsQuery } from "@/lib/api/settings";

type TabMode = "evidence" | "knowledge";

type PromptState = {
  schedule: string[];
  timezone: string;
  currentPromptLabel: string;
  promptActive: boolean;
  snoozeCount: number;
  snoozeMinutes: number;
};

type KnowledgeEntry = {
  id: string;
  createdAt: string;
  challenge: string;
  lesson: string;
  userId: string;
};

const CATEGORY_MAP: Record<string, string[]> = {
  Delivery: [
    "Executes predictably and hits commitments",
    "Plans and scopes work with low churn",
    "Coordinates cross-functional delivery",
  ],
  "System Design": [
    "Designs scalable architecture",
    "Evaluates trade-offs and risks",
    "Builds resilience and observability",
  ],
  Communication: [
    "Writes clear updates and RFCs",
    "Aligns stakeholders across teams",
    "Presents decisions and outcomes clearly",
  ],
  "Analytical Thinking": [
    "Debugs using hypothesis-driven analysis",
    "Uses metrics to validate changes",
    "Identifies systemic root causes",
  ],
};

const COMPETENCIES = Object.keys(CATEGORY_MAP);

function getChromeApi() {
  return (globalThis as typeof globalThis & { chrome?: any }).chrome;
}

function polishText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function inferCompetency(title: string, description: string) {
  const raw = `${title} ${description}`.toLowerCase();
  if (/(design|architecture|scal|resilien|trade[- ]?off)/.test(raw)) {
    return { competency: "System Design", category: "System Design" };
  }
  if (/(incident|rca|debug|root cause|metric|analysis)/.test(raw)) {
    return { competency: "Analytical Thinking", category: "Analytical Thinking" };
  }
  if (/(stakeholder|present|communicat|rfc|align)/.test(raw)) {
    return { competency: "Communication", category: "Communication" };
  }
  return { competency: "Delivery", category: "Delivery" };
}

function defaultPromptState(): PromptState {
  return {
    schedule: ["16:00"],
    timezone: "GMT",
    currentPromptLabel: "",
    promptActive: false,
    snoozeCount: 0,
    snoozeMinutes: 15,
  };
}

export function ExtensionPopup({
  onDismiss,
  onSave,
  standalone = false,
}: {
  onDismiss: () => void;
  onSave: () => void;
  standalone?: boolean;
}) {
  const chromeApi = getChromeApi();
  const { user, userId, loading } = useAuth();
  const safeUserId = userId ?? "";
  const { data: settings } = useSettingsQuery(safeUserId);
  const insertEvidenceMutation = useInsertEvidence(safeUserId);
  const addFeedbackMutation = useAddFeedback(safeUserId);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const [tab, setTab] = useState<TabMode>("evidence");
  const [promptState, setPromptState] = useState<PromptState>(defaultPromptState());
  const [knowledgeLog, setKnowledgeLog] = useState<KnowledgeEntry[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [competency, setCompetency] = useState("");

  const [challenge, setChallenge] = useState("");
  const [lesson, setLesson] = useState("");

  useEffect(() => {
    if (!chromeApi?.storage?.local) return;
    chromeApi.storage.local.get(
      [
        "evitrace_prompt_schedule",
        "evitrace_timezone",
        "evitrace_current_prompt_label",
        "evitrace_prompt_active",
        "evitrace_snooze_count",
        "evitrace_snooze_minutes",
      ],
      (stored: Record<string, unknown>) => {
        setPromptState({
          schedule: Array.isArray(stored.evitrace_prompt_schedule)
            ? (stored.evitrace_prompt_schedule as string[])
            : ["16:00"],
          timezone:
            typeof stored.evitrace_timezone === "string" ? stored.evitrace_timezone : "GMT",
          currentPromptLabel:
            typeof stored.evitrace_current_prompt_label === "string"
              ? stored.evitrace_current_prompt_label
              : "",
          promptActive: Boolean(stored.evitrace_prompt_active),
          snoozeCount: Number(stored.evitrace_snooze_count ?? 0),
          snoozeMinutes: Number(stored.evitrace_snooze_minutes ?? 15),
        });
      },
    );
  }, [chromeApi?.storage?.local]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const promptSummary = useMemo(() => {
    if (promptState.currentPromptLabel) return promptState.currentPromptLabel;
    if (settings) {
      const n = settings.notifications;
      const schedule = n.dailyReminder ? n.extensionPromptTimes.join(", ") : "Disabled";
      return `Prompt schedule: ${schedule} ${n.extensionTimezone}${n.extensionWeekdaysOnly ? " (Mon-Fri)" : ""}`;
    }
    return `Prompt schedule: ${promptState.schedule.join(", ")} ${promptState.timezone} (Mon-Fri)`;
  }, [promptState.currentPromptLabel, promptState.schedule, promptState.timezone, settings]);

  const canSaveEvidence =
    Boolean(userId) &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    subcategory.trim().length > 0 &&
    competency.trim().length > 0;

  const canSaveKnowledge = Boolean(userId) && challenge.trim().length > 0 && lesson.trim().length > 0;

  function handleOpenWebAuth(mode: "signin" | "signup") {
    const url = `http://localhost:3000/?auth=${mode}`;
    if (chromeApi?.tabs?.create) {
      chromeApi.tabs.create({ url });
    } else {
      window.open(url, "_blank");
    }
  }

  function handleOpenSettings() {
    window.open("http://localhost:3000/?tab=settings", "_blank");
  }

  function handleAiAssist() {
    if (!title.trim() && !description.trim()) {
      toast.info("Enter title or description first.");
      return;
    }
    const mapped = inferCompetency(title, description);
    setCategory(mapped.category);
    setCompetency(mapped.competency);
    setSubcategory(CATEGORY_MAP[mapped.category][0] ?? "");
    if (title.trim()) setTitle(polishText(title));
    if (description.trim()) setDescription(polishText(description));
    toast.success("AI assist applied: polished text + mapped competency.");
  }

  function handleSaveEvidence() {
    if (!canSaveEvidence) return;
    insertEvidenceMutation.mutate(
      {
        id: "",
        date: new Date().toISOString().slice(0, 10),
        source: promptState.promptActive ? "Extension Prompt" : "Extension Manual",
        category,
        competency,
        title: title.trim(),
        description: `${description.trim()}\n\nSubcategory: ${subcategory}`,
        link: sourceLink.trim(),
        status: "Pending Review",
        matchState: "Unset",
        managerNotes: "",
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setSourceLink("");
          setCategory("");
          setSubcategory("");
          setCompetency("");
          toast.success("Evidence saved.");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleSaveKnowledge() {
    if (!canSaveKnowledge) return;
    addFeedbackMutation.mutate(
      {
        date: new Date().toISOString().slice(0, 10),
        provider: "Self reflection",
        type: "Ad-hoc",
        notes: `Challenge: ${challenge.trim()}\n\nSolution/Lesson Learned: ${lesson.trim()}`,
        anonymous: false,
      },
      {
        onSuccess: () => {
          const entry: KnowledgeEntry = {
            id: `k-${Date.now()}`,
            createdAt: new Date().toISOString(),
            challenge: challenge.trim(),
            lesson: lesson.trim(),
            userId: userId ?? "unknown",
          };
          setKnowledgeLog((previous) => [entry, ...previous].slice(0, 40));
          setChallenge("");
          setLesson("");
          toast.success("Knowledge entry saved.");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleSnooze() {
    if (!chromeApi?.runtime?.sendMessage) return;
    chromeApi.runtime.sendMessage({ type: "SNOOZE_PROMPT" }, (response: { ok?: boolean }) => {
      if (response?.ok) {
        setPromptState((state) => ({ ...state, snoozeCount: 1 }));
        toast.success(
          `Snoozed for ${
            settings?.notifications.extensionSnoozeMinutes ?? promptState.snoozeMinutes
          } minutes`,
        );
      } else {
        toast.info("Snooze already used for this prompt.");
      }
    });
  }

  function handleCloseForNow() {
    if (chromeApi?.runtime?.sendMessage) {
      chromeApi.runtime.sendMessage({ type: "CLEAR_PROMPT_ACTIVE" });
    }
    onDismiss();
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white text-[#42526E] text-sm">
        Loading Evitrace...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-full bg-white border rounded-lg p-4" style={{ borderColor: "#DFE1E6" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#0052CC] text-white">
              <Clock3 size={14} />
            </div>
            <span className="text-sm font-bold text-[#172B4D]">Evitrace</span>
          </div>
          <button onClick={onDismiss} className="p-1 rounded hover:bg-[#F4F5F7] text-[#42526E]">
            <X size={14} />
          </button>
        </div>
        <div className="mt-4 rounded border p-3 bg-[#FAFBFC]" style={{ borderColor: "#DFE1E6" }}>
          <div className="text-sm font-semibold text-[#172B4D]">Session expired</div>
          <div className="mt-1 text-xs text-[#6B778C]">
            Sign in from the web app. Evitrace uses the web app as the single source of authentication.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleOpenWebAuth("signin")}
              className="h-9 px-3 rounded text-sm font-semibold text-white"
              style={{ background: "#0052CC" }}
            >
              Open Sign In
            </button>
            <button
              type="button"
              onClick={() => handleOpenWebAuth("signup")}
              className="h-9 px-3 rounded text-sm font-semibold border"
              style={{ borderColor: "#DFE1E6", color: "#42526E" }}
            >
              Open Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={
        standalone
          ? "w-full h-full rounded-lg shadow-none border bg-white flex flex-col overflow-hidden"
          : "fixed bottom-6 right-6 w-[460px] h-[580px] rounded-lg shadow-xl border bg-white z-40 flex flex-col overflow-hidden"
      }
      style={{ borderColor: "#DFE1E6" }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: "#DFE1E6" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#0052CC] text-white">
              <Clock3 size={14} />
            </div>
            <span className="text-sm font-bold text-[#172B4D]">Evitrace</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenSettings}
              className="p-1.5 rounded hover:bg-[#F4F5F7] text-[#42526E]"
              title="Open settings"
            >
              <Settings size={14} />
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((open) => !open)}
                className="p-1.5 rounded hover:bg-[#F4F5F7] text-[#42526E]"
                title="Open user menu"
              >
                <UserCircle2 size={14} />
              </button>
              {showProfileMenu ? (
                <div
                  className="absolute right-0 mt-1.5 w-56 rounded-md border bg-white shadow-lg p-2 z-10"
                  style={{ borderColor: "#DFE1E6" }}
                >
                  <div className="text-[11px] font-semibold text-[#172B4D]">
                    {user.fullName || "Unnamed user"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B778C] break-all">{user.email}</div>
                  <div className="mt-1.5 pt-1.5 border-t text-[11px] text-[#42526E]" style={{ borderColor: "#DFE1E6" }}>
                    Seniority:{" "}
                    <span className="font-semibold text-[#172B4D]">
                      {user.currentLevel || "Not set"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleCloseForNow}
              className="p-1.5 rounded hover:bg-[#F4F5F7] text-[#42526E]"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-[#6B778C]">
          <span className="font-medium">{promptSummary}</span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "#DFE1E6" }}>
          <button
            type="button"
            onClick={() => setTab("evidence")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              tab === "evidence" ? "bg-[#0052CC] text-white" : "text-[#42526E]"
            }`}
          >
            Capture Evidence
          </button>
          <button
            type="button"
            onClick={() => setTab("knowledge")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              tab === "knowledge" ? "bg-[#0052CC] text-white" : "text-[#42526E]"
            }`}
          >
            Log Knowledge
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {tab === "evidence" ? (
          <>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What did you accomplish?"
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none"
                style={{ borderColor: "#DFE1E6" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Description / Context
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Capture the challenge, action, and outcome."
                className="w-full px-3 py-2 text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none resize-none text-[#172B4D]"
                style={{ borderColor: "#DFE1E6" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Source Link
              </label>
              <input
                value={sourceLink}
                onChange={(event) => setSourceLink(event.target.value)}
                placeholder="https://example.com/reference"
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none"
                style={{ borderColor: "#DFE1E6" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Competency Category
              </label>
              <select
                value={category}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  setCategory(nextCategory);
                  setCompetency(nextCategory);
                  setSubcategory("");
                }}
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none"
                style={{ borderColor: "#DFE1E6" }}
              >
                <option value="">Select category</option>
                {COMPETENCIES.map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none truncate"
                style={{ borderColor: "#DFE1E6" }}
                title={subcategory}
                disabled={!category}
              >
                <option value="">{category ? "Select subcategory" : "Select category first"}</option>
                {category
                  ? CATEGORY_MAP[category].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  : null}
              </select>
              {subcategory ? (
                <div className="mt-1 text-[11px] text-[#6B778C] wrap-break-word">
                  Selected: <span className="font-medium text-[#42526E]">{subcategory}</span>
                </div>
              ) : null}
            </div>
            <div className="rounded border p-2.5 bg-[#FAFBFC]" style={{ borderColor: "#DFE1E6" }}>
              <div className="text-[11px] font-semibold text-[#42526E] flex items-center gap-1.5">
                <Bot size={12} />
                AI Support
              </div>
              <div className="mt-1 text-[11px] text-[#6B778C]">
                AI Assist maps the best competency from your title + context, then polishes wording
                for clarity without changing your technical meaning.
              </div>
              <button
                type="button"
                onClick={handleAiAssist}
                className="mt-2 h-8 px-2.5 rounded border text-[11px] font-semibold inline-flex items-center gap-1"
                style={{ borderColor: "#DFE1E6", color: "#0052CC" }}
              >
                <Sparkles size={12} />
                AI Assist (Map + Polish)
              </button>
              <div className="mt-1 text-[11px] text-[#6B778C]">
                Suggested competency:{" "}
                <span className="font-semibold text-[#172B4D]">
                  {competency || "Not mapped yet"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Challenge Encountered
              </label>
              <textarea
                rows={4}
                value={challenge}
                onChange={(event) => setChallenge(event.target.value)}
                placeholder="What challenge did you run into?"
                className="w-full px-3 py-2 text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none resize-none text-[#172B4D]"
                style={{ borderColor: "#DFE1E6" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Solution / Lesson Learned
              </label>
              <textarea
                rows={5}
                value={lesson}
                onChange={(event) => setLesson(event.target.value)}
                placeholder="What did you learn that you can reuse later?"
                className="w-full px-3 py-2 text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none resize-none text-[#172B4D]"
                style={{ borderColor: "#DFE1E6" }}
              />
            </div>
            <div className="rounded border p-2.5 bg-[#FAFBFC]" style={{ borderColor: "#DFE1E6" }}>
              <div className="text-[11px] font-semibold text-[#42526E] mb-1">Recent Knowledge Logs</div>
              {knowledgeLog.length === 0 ? (
                <div className="text-[11px] text-[#6B778C]">No entries yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {knowledgeLog.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-[11px] text-[#42526E]">
                      <span className="font-semibold">{entry.challenge}</span>
                      <div className="text-[#6B778C]">{entry.lesson}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div
        className="px-4 py-3 border-t flex items-center justify-between gap-2 bg-[#FAFBFC]"
        style={{ borderColor: "#DFE1E6" }}
      >
        <div className="flex items-center gap-2">
          {promptState.promptActive && promptState.snoozeCount === 0 && (
            <button
              type="button"
              onClick={handleSnooze}
              className="px-3 py-1.5 rounded text-sm font-semibold text-[#42526E] hover:bg-[#F4F5F7]"
            >
              Snooze
            </button>
          )}
          <button
            type="button"
            onClick={handleCloseForNow}
            className="px-3 py-1.5 rounded text-sm font-semibold text-[#42526E] hover:bg-[#F4F5F7]"
          >
            Close
          </button>
        </div>

        {tab === "evidence" ? (
          <button
            type="button"
            disabled={!canSaveEvidence || insertEvidenceMutation.isPending}
            onClick={handleSaveEvidence}
            className="px-3 py-1.5 rounded text-sm font-semibold text-white inline-flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "#0052CC" }}
          >
            <CheckCircle size={14} />
            Save Evidence
          </button>
        ) : (
          <button
            type="button"
            disabled={!canSaveKnowledge || addFeedbackMutation.isPending}
            onClick={handleSaveKnowledge}
            className="px-3 py-1.5 rounded text-sm font-semibold text-white inline-flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "#0052CC" }}
          >
            <CheckCircle size={14} />
            Save Knowledge
          </button>
        )}
      </div>
    </motion.div>
  );
}
