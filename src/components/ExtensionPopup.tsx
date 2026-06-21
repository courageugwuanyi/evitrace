import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
  Plus,
  Settings,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useInsertEvidence } from "@/lib/api/evidence";
import { useSettingsQuery } from "@/lib/api/settings";
import { supabase } from "@/lib/supabase";

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
  category?: string;
  capability?: string;
  referenceLinks: string[];
  userId: string;
};

const DEFAULT_CATEGORY_MAP: Record<string, string[]> = {
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
const WEB_APP_BASE_URL = "http://192.168.1.130:8080";
const SETTINGS_URL = `${WEB_APP_BASE_URL}/?tab=settings`;
const PROFILE_SETTINGS_URL = `${WEB_APP_BASE_URL}/?tab=settings&section=profile`;
const BRAND_ICON_SRC = "/icons/icon128.png?v=20260621";
const KNOWLEDGE_LOG_STORAGE_KEY_PREFIX = "evitrace.extension.knowledgeLog";

type BrowserTab = { id?: number; url?: string; windowId?: number };
type ChromeApi = {
  tabs?: {
    query: (queryInfo: Record<string, unknown>, callback: (tabs: BrowserTab[]) => void) => void;
    update: (tabId: number, updateProperties: { active?: boolean; url?: string }) => void;
    create: (createProperties: { url: string }) => void;
  };
  windows?: {
    update: (windowId: number, updateInfo: { focused?: boolean }) => void;
  };
  storage?: {
    local?: {
      get: (keys: string[], callback: (stored: Record<string, unknown>) => void) => void;
    };
  };
  runtime?: {
    sendMessage: (
      message: Record<string, unknown>,
      callback?: (response: { ok?: boolean; reason?: string } | undefined) => void,
    ) => void;
  };
};

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src={BRAND_ICON_SRC}
      alt="Evitrace"
      width={size}
      height={size}
      className="rounded object-cover shrink-0"
    />
  );
}

function getChromeApi() {
  return (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;
}

function getKnowledgeLogStorageKey(userId: string) {
  return `${KNOWLEDGE_LOG_STORAGE_KEY_PREFIX}.${userId || "anonymous"}`;
}

function openOrFocusTab(url: string, chromeApi: ChromeApi | undefined) {
  if (chromeApi?.tabs?.query && chromeApi?.tabs?.update && chromeApi?.tabs?.create) {
    chromeApi.tabs.query({}, (tabs: BrowserTab[]) => {
      const exactMatch = tabs.find((tab) => tab.url === url);
      const webAppMatch = tabs.find((tab) => tab.url?.startsWith(WEB_APP_BASE_URL));
      const target = exactMatch ?? webAppMatch;
      if (target?.id) {
        chromeApi.tabs.update(target.id, { active: true, url });
        if (typeof target.windowId === "number" && chromeApi.windows?.update) {
          chromeApi.windows.update(target.windowId, { focused: true });
        }
        return;
      }
      chromeApi.tabs.create({ url });
    });
    return;
  }
  window.open(url, "_blank");
}

function polishText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function inferCompetency(title: string, description: string, categories: string[]) {
  const resolveCategory = (candidate: string): string | null => {
    const normalizedCandidate = candidate.trim().toLowerCase();
    return (
      categories.find((category) => category.trim().toLowerCase() === normalizedCandidate) ??
      categories.find(
        (category) =>
          category.trim().toLowerCase().includes(normalizedCandidate) ||
          normalizedCandidate.includes(category.trim().toLowerCase()),
      ) ??
      null
    );
  };
  const raw = `${title} ${description}`.toLowerCase();
  if (/(design|architecture|scal|resilien|trade[- ]?off)/.test(raw)) {
    const mapped = resolveCategory("System Design");
    if (mapped) return { competency: mapped, category: mapped };
  }
  if (/(incident|rca|debug|root cause|metric|analysis)/.test(raw)) {
    const mapped = resolveCategory("Analytical Thinking");
    if (mapped) return { competency: mapped, category: mapped };
  }
  if (/(stakeholder|present|communicat|rfc|align)/.test(raw)) {
    const mapped = resolveCategory("Communication");
    if (mapped) return { competency: mapped, category: mapped };
  }
  const fallback = resolveCategory("Delivery") ?? categories[0] ?? "Delivery";
  return { competency: fallback, category: fallback };
}

function defaultPromptState(): PromptState {
  return {
    schedule: ["16:00"],
    timezone: "UTC+00:00 (GMT/UTC Standard)",
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
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const successBannerTimeoutRef = useRef<number | null>(null);

  const [tab, setTab] = useState<TabMode>("evidence");
  const [promptState, setPromptState] = useState<PromptState>(defaultPromptState());
  const [knowledgeLog, setKnowledgeLog] = useState<KnowledgeEntry[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [competency, setCompetency] = useState("");
  const [activeFrameworkMatrix, setActiveFrameworkMatrix] = useState<unknown | null>(null);

  const [challenge, setChallenge] = useState("");
  const [lesson, setLesson] = useState("");
  const [knowledgeCategory, setKnowledgeCategory] = useState("");
  const [knowledgeCapability, setKnowledgeCapability] = useState("");
  const [knowledgeReferenceInput, setKnowledgeReferenceInput] = useState("");
  const [knowledgeReferenceLinks, setKnowledgeReferenceLinks] = useState<string[]>([]);

  const categoryMap = useMemo(() => {
    const rawCategories =
      (activeFrameworkMatrix &&
      typeof activeFrameworkMatrix === "object" &&
      !Array.isArray(activeFrameworkMatrix)
        ? (activeFrameworkMatrix as Record<string, unknown>).categories
        : null) ?? null;
    if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) {
      return DEFAULT_CATEGORY_MAP;
    }
    const parsed = Object.entries(rawCategories as Record<string, unknown>).reduce<
      Record<string, string[]>
    >((acc, [categoryName, payload]) => {
      if (!payload || typeof payload !== "object") return acc;
      const items = Array.isArray((payload as Record<string, unknown>).items)
        ? ((payload as Record<string, unknown>).items as unknown[])
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter((item) => item.length > 0)
        : [];
      if (items.length > 0) acc[categoryName] = items;
      return acc;
    }, {});
    return Object.keys(parsed).length > 0 ? parsed : DEFAULT_CATEGORY_MAP;
  }, [activeFrameworkMatrix]);
  const competencies = useMemo(() => Object.keys(categoryMap), [categoryMap]);

  const knowledgeReferenceInputValid =
    !knowledgeReferenceInput || /^https?:\/\/\S+\.\S+/i.test(knowledgeReferenceInput);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setActiveFrameworkMatrix(null);
      return () => {
        cancelled = true;
      };
    }
    const loadFramework = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("active_framework_id")
          .eq("id", userId)
          .maybeSingle();
        if (profileError) throw profileError;

        const activeFrameworkId = (profile?.active_framework_id as string | null) ?? null;
        if (activeFrameworkId) {
          const { data: activeFramework, error: frameworkError } = await supabase
            .from("competency_frameworks")
            .select("matrix")
            .eq("id", activeFrameworkId)
            .maybeSingle();
          if (frameworkError) throw frameworkError;
          if (activeFramework?.matrix && !cancelled) {
            setActiveFrameworkMatrix(activeFramework.matrix as unknown);
            return;
          }
        }

        const { data: fallbackFramework, error: fallbackError } = await supabase
          .from("competency_frameworks")
          .select("matrix")
          .or(`is_system_default.eq.true,user_id.eq.${userId}`)
          .order("is_system_default", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fallbackError) throw fallbackError;
        if (!cancelled) {
          setActiveFrameworkMatrix((fallbackFramework?.matrix as unknown) ?? null);
        }
      } catch {
        if (!cancelled) {
          setActiveFrameworkMatrix(null);
        }
      }
    };
    void loadFramework();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const categoryOptions = competencies;
    if (categoryOptions.length === 0) return;
    if (!categoryOptions.includes(category)) {
      const nextCategory = categoryOptions[0];
      setCategory(nextCategory);
      setCompetency(nextCategory);
      setSubcategory(categoryMap[nextCategory]?.[0] ?? "");
    } else {
      const subOptions = categoryMap[category] ?? [];
      if (!subOptions.includes(subcategory)) {
        setSubcategory(subOptions[0] ?? "");
      }
      if (competency !== category) {
        setCompetency(category);
      }
    }

    if (!categoryOptions.includes(knowledgeCategory)) {
      const nextCategory = categoryOptions[0];
      setKnowledgeCategory(nextCategory);
      setKnowledgeCapability(categoryMap[nextCategory]?.[0] ?? "");
    } else {
      const knowledgeOptions = categoryMap[knowledgeCategory] ?? [];
      if (!knowledgeOptions.includes(knowledgeCapability)) {
        setKnowledgeCapability(knowledgeOptions[0] ?? "");
      }
    }
  }, [
    category,
    categoryMap,
    competencies,
    competency,
    knowledgeCapability,
    knowledgeCategory,
    subcategory,
  ]);

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
            typeof stored.evitrace_timezone === "string"
              ? stored.evitrace_timezone
              : "UTC+00:00 (GMT/UTC Standard)",
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
    if (!chromeApi?.runtime?.sendMessage || !settings) return;
    const notifications = settings.notifications;
    chromeApi.runtime.sendMessage({
      type: "UPDATE_PROMPT_CONFIG",
      scheduleTimes: notifications.dailyReminder ? notifications.extensionPromptTimes : [],
      snoozeMinutes: notifications.extensionSnoozeMinutes,
      weekdaysOnly: notifications.extensionWeekdaysOnly,
      timezone: notifications.extensionTimezone || "UTC+00:00 (GMT/UTC Standard)",
    });
  }, [chromeApi?.runtime?.sendMessage, settings]);

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

  useEffect(() => {
    return () => {
      if (successBannerTimeoutRef.current !== null) {
        window.clearTimeout(successBannerTimeoutRef.current);
      }
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
    category.trim().length > 0 &&
    subcategory.trim().length > 0 &&
    competency.trim().length > 0;

  const canSaveKnowledge =
    Boolean(userId) &&
    challenge.trim().length > 0 &&
    lesson.trim().length > 0 &&
    knowledgeCategory.trim().length > 0 &&
    knowledgeCapability.trim().length > 0 &&
    knowledgeReferenceInputValid;

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(getKnowledgeLogStorageKey(userId));
    if (!raw) {
      setKnowledgeLog([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Array<
        KnowledgeEntry & {
          referenceLink?: string;
        }
      >;
      if (!Array.isArray(parsed)) return;
      const normalized = parsed.map((entry) => ({
        ...entry,
        referenceLinks: Array.isArray(entry.referenceLinks)
          ? entry.referenceLinks.filter((link): link is string => typeof link === "string")
          : entry.referenceLink
            ? [entry.referenceLink]
            : [],
      }));
      setKnowledgeLog(normalized.slice(0, 40));
    } catch {
      setKnowledgeLog([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    window.localStorage.setItem(
      getKnowledgeLogStorageKey(userId),
      JSON.stringify(knowledgeLog.slice(0, 40)),
    );
  }, [knowledgeLog, userId]);

  function handleOpenSettings() {
    openOrFocusTab(SETTINGS_URL, chromeApi);
  }

  function showSuccessBannerMessage(message: string) {
    setSuccessBanner(message);
    if (successBannerTimeoutRef.current !== null) {
      window.clearTimeout(successBannerTimeoutRef.current);
    }
    successBannerTimeoutRef.current = window.setTimeout(() => {
      setSuccessBanner(null);
      successBannerTimeoutRef.current = null;
    }, 3000);
  }

  function handleOpenProfileSettings() {
    setShowProfileMenu(false);
    openOrFocusTab(PROFILE_SETTINGS_URL, chromeApi);
  }

  function handleAiAssist() {
    if (!title.trim() && !description.trim()) {
      toast.info("Enter title or description first.");
      return;
    }
    const mapped = inferCompetency(title, description, competencies);
    setCategory(mapped.category);
    setCompetency(mapped.competency);
    setSubcategory(categoryMap[mapped.category]?.[0] ?? "");
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
        category: category.trim(),
        competency: competency.trim(),
        title: title.trim(),
        description: `${description.trim()}\n\nSubcategory: ${subcategory.trim()}`,
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
          showSuccessBannerMessage("Evidence captured successfully!");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleSaveKnowledge() {
    if (!canSaveKnowledge || !userId || isSavingKnowledge) return;
    const referencesSummary =
      knowledgeReferenceLinks.length > 0
        ? `\n\nReference Links:\n${knowledgeReferenceLinks.map((link) => `- ${link}`).join("\n")}`
        : "";
    const categorySummary = `\n\nCategory: ${knowledgeCategory.trim()}\nCapability Item: ${knowledgeCapability.trim()}`;
    const payload = {
      user_id: userId,
      title: challenge.trim(),
      description: `${lesson.trim()}${categorySummary}${referencesSummary}`,
      reference_links: knowledgeReferenceLinks,
    };
    setIsSavingKnowledge(true);
    void supabase
      .from("knowledge_items")
      .insert(payload as never)
      .then(({ error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }
        const entry: KnowledgeEntry = {
          id: `k-${Date.now()}`,
          createdAt: new Date().toISOString(),
          challenge: challenge.trim(),
          lesson: lesson.trim(),
          category: knowledgeCategory.trim(),
          capability: knowledgeCapability.trim(),
          referenceLinks: knowledgeReferenceLinks,
          userId,
        };
        setKnowledgeLog((previous) => [entry, ...previous].slice(0, 40));
        setChallenge("");
        setLesson("");
        setKnowledgeCategory(competencies[0] ?? "");
        setKnowledgeCapability(categoryMap[competencies[0] ?? ""]?.[0] ?? "");
        setKnowledgeReferenceInput("");
        setKnowledgeReferenceLinks([]);
        showSuccessBannerMessage("Knowledge log saved!");
      })
      .finally(() => {
        setIsSavingKnowledge(false);
      });
  }

  function handleAddKnowledgeReference() {
    const trimmed = knowledgeReferenceInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    setKnowledgeReferenceLinks((previous) => {
      if (previous.some((link) => link.toLowerCase() === trimmed.toLowerCase())) return previous;
      return [...previous, trimmed];
    });
    setKnowledgeReferenceInput("");
  }

  function handleRemoveKnowledgeReference(linkToRemove: string) {
    setKnowledgeReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
  }

  function handleSnooze() {
    if (!chromeApi?.runtime?.sendMessage) return;
    chromeApi.runtime.sendMessage(
      { type: "SNOOZE_PROMPT" },
      (response: { ok?: boolean; snoozeMinutes?: number }) => {
      if (response?.ok) {
        setPromptState((state) => ({ ...state, snoozeCount: 1 }));
        toast.success(
          `Snoozed for ${
            response.snoozeMinutes ??
            settings?.notifications.extensionSnoozeMinutes ??
            promptState.snoozeMinutes
          } minutes`,
        );
      } else {
        toast.info("Snooze already used for this prompt.");
      }
      },
    );
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
      <div
        className="w-full h-full bg-white border rounded-lg p-4"
        style={{ borderColor: "#DFE1E6" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="text-sm font-bold text-[#172B4D]">Evitrace</span>
          </div>
          <button onClick={onDismiss} className="p-1 rounded hover:bg-[#F4F5F7] text-[#42526E]">
            <X size={14} />
          </button>
        </div>
        <div
          className="mt-4 rounded-md border p-4 bg-linear-to-b from-[#F7FAFF] to-[#FFFFFF]"
          style={{ borderColor: "#C7D7FE" }}
        >
          <div className="text-sm font-semibold text-[#172B4D]">Welcome to Evitrace!</div>
          <div className="mt-2 text-xs leading-relaxed text-[#42526E]">
            Please sign in or create an account on the web platform to start capturing your career
            evidence.
          </div>
          <button
            type="button"
            onClick={() => openOrFocusTab(`${WEB_APP_BASE_URL}/`, chromeApi)}
            className="mt-4 h-10 w-full rounded text-sm font-semibold text-white"
            style={{ background: "#0052CC" }}
          >
            Open Web App
          </button>
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
            <BrandMark size={28} />
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
                  <button
                    type="button"
                    onClick={handleOpenProfileSettings}
                    className="w-full text-left text-[11px] font-semibold text-[#172B4D] hover:text-[#0052CC]"
                  >
                    {user.fullName || "Unnamed user"}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenProfileSettings}
                    className="mt-0.5 w-full text-left text-[11px] text-[#6B778C] break-all hover:text-[#0052CC]"
                  >
                    {user.email}
                  </button>
                  <div
                    className="mt-1.5 pt-1.5 border-t text-[11px] text-[#42526E]"
                    style={{ borderColor: "#DFE1E6" }}
                  >
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
        {successBanner ? (
          <div
            className="mb-3 rounded border px-3 py-2 bg-[#E3FCEF]"
            style={{ borderColor: "#57D9A3" }}
          >
            <div className="text-xs font-semibold text-[#006644]">{successBanner}</div>
          </div>
        ) : null}
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
                Title <span className="text-[#DE350B]">*</span>
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
                Description / Context <span className="normal-case font-medium">(optional)</span>
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
                Source Link <span className="normal-case font-medium">(optional)</span>
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
                Competency Category <span className="text-[#DE350B]">*</span>
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
                {competencies.map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Subcategory <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none truncate"
                style={{ borderColor: "#DFE1E6" }}
                title={subcategory}
                disabled={!category}
              >
                <option value="">
                  {category ? "Select subcategory" : "Select category first"}
                </option>
                {category
                  ? (categoryMap[category] ?? []).map((item) => (
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
                Core Activity / Challenge <span className="text-[#DE350B]">*</span>
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
                Solution / Lesson Learned <span className="text-[#DE350B]">*</span>
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
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Competency Category <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={knowledgeCategory}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  setKnowledgeCategory(nextCategory);
                  setKnowledgeCapability(categoryMap[nextCategory]?.[0] ?? "");
                }}
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none"
                style={{ borderColor: "#DFE1E6" }}
              >
                <option value="">Select category</option>
                {competencies.map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                Capability Item <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={knowledgeCapability}
                onChange={(event) => setKnowledgeCapability(event.target.value)}
                className="w-full h-10 rounded border px-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none truncate"
                style={{ borderColor: "#DFE1E6" }}
                disabled={!knowledgeCategory}
              >
                <option value="">
                  {knowledgeCategory ? "Select capability item" : "Select category first"}
                </option>
                {(categoryMap[knowledgeCategory] ?? []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#6B778C]">
                External Reference Links <span className="normal-case font-medium">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B778C]"
                  />
                  <input
                    value={knowledgeReferenceInput}
                    onChange={(event) => setKnowledgeReferenceInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddKnowledgeReference();
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-9 rounded border pl-8 pr-3 text-sm text-[#172B4D] bg-[#F4F5F7] focus:bg-white outline-none"
                    style={{ borderColor: "#DFE1E6" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddKnowledgeReference}
                  className="h-9 px-2.5 rounded border text-[11px] font-semibold text-[#0052CC] inline-flex items-center gap-1"
                  style={{ borderColor: "#DFE1E6" }}
                >
                  <Plus size={12} />
                  Add Reference Link
                </button>
              </div>
              {!knowledgeReferenceInputValid ? (
                <div className="mt-1 text-[11px] text-[#DE350B]">
                  Enter a valid URL starting with http:// or https://
                </div>
              ) : null}
              {knowledgeReferenceLinks.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {knowledgeReferenceLinks.map((link) => (
                    <span
                      key={link}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-[#0052CC] bg-[#DEEBFF]"
                      style={{ borderColor: "#B3D4FF" }}
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        Link
                        <ExternalLink size={11} />
                      </a>
                      <button
                        type="button"
                        aria-label={`Remove reference link ${link}`}
                        onClick={() => handleRemoveKnowledgeReference(link)}
                        className="rounded-full p-0.5 hover:bg-[#B3D4FF]"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded border p-2.5 bg-[#FAFBFC]" style={{ borderColor: "#DFE1E6" }}>
              <div className="text-[11px] font-semibold text-[#42526E] mb-1">
                Recent Knowledge Logs
              </div>
              {knowledgeLog.length === 0 ? (
                <div className="text-[11px] text-[#6B778C]">No entries yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {knowledgeLog.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-[11px] text-[#42526E]">
                      <span className="font-semibold">{entry.challenge}</span>
                      <div className="text-[#6B778C]">{entry.lesson}</div>
                      {entry.referenceLinks?.length ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entry.referenceLinks.map((link) => (
                            <a
                              key={link}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-[#0052CC] hover:underline"
                              style={{ borderColor: "#B3D4FF", background: "#DEEBFF" }}
                            >
                              External reference
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      ) : null}
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
            disabled={!canSaveKnowledge || isSavingKnowledge}
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
