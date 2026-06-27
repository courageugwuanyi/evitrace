import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  useEvidenceQuery,
  useSaveEvidence,
  useArchiveEvidence,
  useRestoreEvidence,
  useDeleteEvidence,
  useInsertEvidence,
} from "@/lib/api/evidence";
import { useInboxQuery, useApproveInbox, useDismissInbox } from "@/lib/api/inbox";
import {
  useObjectivesQuery,
  useCreateObjective,
  useMoveObjective,
  useSaveObjective,
  useArchiveObjective,
  useRestoreObjective,
  useDeleteObjective,
} from "@/lib/api/objectives";
import {
  useAssessmentsQuery,
  useDeleteAssessment,
  useFinalizeAssessment,
  useUpdateOneOnOneTopics,
} from "@/lib/api/assessments";
import { useDashboardStats } from "@/lib/api/dashboard";
import { getManagerTeamOverview, signOffTransfer } from "@/lib/api/manager-invites.functions";
import { sendNotification } from "@/lib/api/notifications.functions";
import { supabase } from "@/lib/supabase";
import { formatUtcToLocal, toLocalDateString } from "@/lib/datetime";
import { generateSafeId } from "@/lib/utils/generateSafeId";
import { useFramework } from "@/context/FrameworkContext";
import { ManagerActionsPanel } from "@/components/ManagerActionsPanel";
import {
  C,
  BrandMark,
  Card,
  PrimaryBtn,
  GhostBtn,
  Pill,
  Badge,
  SourceIcon,
  SourceChip,
  Input,
  Select,
  Dropdown,
  Field,
} from "@/features/home/shared/ui-kit";
import { Backdrop, ConfirmDialog, Textarea } from "@/features/home/shared/overlays";
import { HomeAuthApp } from "@/features/home/auth/auth";
import { MANAGER_ONBOARDING_CONTEXT_KEY } from "@/features/home/shared/constants";
import {
  initialRadar,
  initialEvidence,
  initialInbox,
  initialObjectives,
  type EvidenceRecord,
  type Objective,
  type EvidenceStatus,
  type EvidenceMatch,
  type SuccessCriterion,
} from "@/features/home/shared/models";
import { SecureField } from "@/features/home/settings/profile-security";
import { useManagerRelationships } from "@/features/home/hooks/use-manager-relationships";
import { CountdownBadge, ObjectivesView } from "@/features/home/views/objectives-view";
import {
  type KnowledgeHubItem,
  type KnowledgeItemRow,
  parseKnowledgeItemRow,
} from "@/features/home/knowledge/knowledge";
import { KnowledgeEditorModal, KnowledgeHubView } from "@/features/home/knowledge/knowledge-view";
import { CaptureModal } from "@/features/home/capture/capture-modal";
import { type SettingsSection, type Tab } from "@/features/home/shared/navigation";
import { getTabPath } from "@/features/home/shell/route-state";
import type {
  HomeRouteAppProps,
  InboxConfirmPayload,
  InboxViewItem,
} from "@/features/home/shell/home-route-contracts";
import {
  formatWorkspaceActivityStatus,
  getWorkspaceMemberInitials,
  HOME_PAGE_TITLES,
} from "@/features/home/shell/home-route-view-model";
import { SettingsView } from "@/features/home/settings/settings-view";
import { type PinnedResourceRow } from "@/features/home/shared/pinned-resource-samples";
import {
  buildHomeGlobalSearchResults,
  buildPinnedResourceLookups,
  buildVisiblePinnedResources,
} from "@/features/home/shell/selectors/home-route-selectors";
import { useHomePinnedResourcesActions } from "@/features/home/shell/actions/use-home-pinned-resources-actions";
import { useHomeInboxActions } from "@/features/home/shell/actions/use-home-inbox-actions";
import { useHomeNavigationActions } from "@/features/home/shell/actions/use-home-navigation-actions";
import { useHomeAssessmentActions } from "@/features/home/shell/actions/use-home-assessment-actions";
import { useHomeAssessmentDraft } from "@/features/home/shell/hooks/use-home-assessment-draft";
import { useHomeSampleContentVisibility } from "@/features/home/shell/hooks/use-home-sample-content-visibility";
import { useHomeCaptureOnLoad } from "@/features/home/shell/hooks/use-home-capture-on-load";
import { useHomePinnedQuickAddDismiss } from "@/features/home/shell/hooks/use-home-pinned-quick-add-dismiss";
import {
  deriveHomeWorkspaceScope,
  getSelectedEngineerRole,
  pickWorkspaceData,
  shouldShowTeamTransitionCard,
} from "@/features/home/shell/selectors/home-manager-workspace-selectors";
import {
  COMPETENCY_DESC,
  EFFECTIVENESS_SCALE,
  SUBCATEGORIES,
  type FrameworkCategoryDefinition,
  type FrameworkCategoryMap,
  resolveFrameworkCategoryEntries,
  buildFrameworkCategoryMapFromContext,
  normalizeCategoryName,
  resolveCategoryFromFramework,
  resolveFrameworkEffectivenessScale,
  buildFeedbackScoreMap,
  resolveFrameworkCategoryMap,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate, formatObjectiveCode } from "@/features/home/shared/formatters";
import { Sidebar, TopHeader } from "@/features/home/shell/home-shell";
import {
  CreateObjectiveModal,
  ObjectiveSlideover,
} from "@/features/home/shell/home-objective-overlays";
import {
  EvidenceSlideover,
  InboxReviewSlideover,
} from "@/features/home/shell/home-evidence-overlays";
import { ReviewWizard } from "@/features/home/shell/home-review-wizard";
import { DashboardView } from "@/features/home/views/dashboard-view";
import { RadarView } from "@/features/home/views/radar-view";
import { FeedbackView } from "@/features/home/views/feedback-view";
import { ReportView } from "@/features/home/views/report-view";
import { EvidenceView, MatchBadge } from "@/features/home/views/evidence-view";
import {
  AssessmentsArchiveTable,
  AssessmentHistoryModal,
} from "@/features/home/assessment/assessment-history";
import {
  type Assessment,
  type AssessmentCategory,
  type AssessmentQuestion,
  type AssessmentWizardDraft,
  type ReviewQuestion,
  type ReviewSession,
  calculateScoreDelta,
  deriveRadarData,
  getHistoricalQuestionScores,
  initialAssessments,
  assessmentToSession,
  sessionToAssessment,
  triggerAssessmentPdfDownload,
} from "@/features/home/assessment/assessment-domain";
import {
  extractFirstLink,
  polishText,
  getDisplayName,
  inferCompetencyFromText,
  extractYouTubeVideoId,
  firstUrlInText,
  urlsInText,
  normalizeReferenceLinks,
} from "@/features/home/shared/text-utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Radar as RadarIcon,
  LayoutDashboard,
  Target,
  Search,
  Plus,
  Pin,
  X,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Filter,
  Info,
  ChevronDown,
  Link as LinkIcon,
  Paperclip,
  UploadCloud,
  AlignLeft,
  ExternalLink,
  Github,
  MessageSquare,
  FileText,
  Bell,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Settings as SettingsIcon,
  Award,
  AlertTriangle,
  UserCheck,
  Download,
  Edit2,
  Trash2,
  User,
  Users,
  Puzzle,
  Layers,
  BookOpen,
  Wrench,
  Share2,
  History,
  Save,
  FileCheck2,
  ClipboardList,
  BarChartHorizontal,
  ArrowLeft,
  Pencil,
  GripVertical,
  Lock,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Eye,
  PanelLeftClose,
  PanelLeft,
  Menu,
  CloudUpload,
  Loader2,
} from "lucide-react";
import {
  Slack,
  Gitlab,
  Trello,
  Figma,
  FileSpreadsheet,
  Presentation,
  GitBranch,
} from "lucide-react";
import { MessageCircleHeart, Notebook, Camera, KeyRound, Send } from "lucide-react";
import { LogOut, ShieldCheck, ChevronLeft } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function HomeRouteApp({
  activeTab,
  activeSettingsSection = "profile",
  openCaptureOnLoad = false,
}: HomeRouteAppProps) {
  return (
    <HomeAuthApp
      EvitraceApp={() => (
        <EvitraceApp
          activeTab={activeTab}
          activeSettingsSection={activeSettingsSection}
          openCaptureOnLoad={openCaptureOnLoad}
        />
      )}
    />
  );
}

function EvitraceApp({
  activeTab,
  activeSettingsSection,
  openCaptureOnLoad,
}: {
  activeTab: Tab;
  activeSettingsSection: SettingsSection;
  openCaptureOnLoad: boolean;
}) {
  const { user, userId: authUserId, signout } = useAuth();
  const { categories: frameworkCategories, currentFramework } = useFramework();
  const navigate = useNavigate();
  const userId = authUserId ?? "";
  const {
    managedEngineers,
    selectedEngineerId,
    setSelectedEngineerId,
    activeView,
    setActiveView,
    managerRelationshipsRefreshNonce,
    setManagerRelationshipsRefreshNonce,
    handoverNotes,
    setHandoverNotes,
    isSigningOffTransfer,
    setIsSigningOffTransfer,
    hasManagerOnboardingContext,
    setHasManagerOnboardingContext,
  } = useManagerRelationships(userId);

  const tab = activeTab;
  const settingsSection = activeSettingsSection;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const { sampleContent, setSampleContent } = useHomeSampleContentVisibility();

  const { data: evidence = [] } = useEvidenceQuery(userId, {
    includeSamples: sampleContent.evidence,
  });
  const { data: archivedEvidence = [] } = useEvidenceQuery(userId, { archived: true });
  const saveEvidenceMutation = useSaveEvidence(userId);
  const archiveEvidenceMutation = useArchiveEvidence(userId);
  const restoreEvidenceMutation = useRestoreEvidence(userId);
  const deleteEvidenceMutation = useDeleteEvidence(userId);
  const insertEvidenceMutation = useInsertEvidence(userId);
  const { data: inbox = [] } = useInboxQuery(userId);
  const approveInboxMutation = useApproveInbox(userId);
  const dismissInboxMutation = useDismissInbox(userId);
  const { data: objectives = [] } = useObjectivesQuery(userId, {
    includeSamples: sampleContent.objectives,
  });
  const { data: archivedObjectives = [] } = useObjectivesQuery(userId, { archived: true });
  const createObjectiveMutation = useCreateObjective(userId);
  const moveObjectiveMutation = useMoveObjective(userId);
  const saveObjectiveMutation = useSaveObjective(userId);
  const archiveObjectiveMutation = useArchiveObjective(userId);
  const restoreObjectiveMutation = useRestoreObjective(userId);
  const deleteObjectiveMutation = useDeleteObjective(userId);
  const { data: assessments = [] } = useAssessmentsQuery(userId);
  const { data: selectedEngineerEvidence = [] } = useEvidenceQuery(selectedEngineerId ?? "", {
    includeSamples: false,
  });
  const { data: selectedEngineerObjectives = [] } = useObjectivesQuery(selectedEngineerId ?? "", {
    includeSamples: false,
  });
  const { data: selectedEngineerArchivedEvidence = [] } = useEvidenceQuery(
    selectedEngineerId ?? "",
    {
      includeSamples: false,
      archived: true,
    },
  );
  const { data: selectedEngineerArchivedObjectives = [] } = useObjectivesQuery(
    selectedEngineerId ?? "",
    {
      includeSamples: false,
      archived: true,
    },
  );
  const { data: selectedEngineerInbox = [] } = useInboxQuery(selectedEngineerId ?? "");
  const { data: selectedEngineerAssessments = [] } = useAssessmentsQuery(selectedEngineerId ?? "");
  const { data: managerTeamOverview = [], isLoading: isManagerTeamOverviewLoading } = useQuery({
    queryKey: ["manager-team-overview", userId, managerRelationshipsRefreshNonce],
    enabled: Boolean(userId) && managedEngineers.length > 0,
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }
      return await getManagerTeamOverview({
        data: {
          token,
        },
      });
    },
  });
  const finalizeAssessmentMutation = useFinalizeAssessment(userId);
  const deleteAssessmentMutation = useDeleteAssessment(userId);
  const updateTopicsMutation = useUpdateOneOnOneTopics(userId);
  const queryClient = useQueryClient();
  const { data: knowledgeRows = [] } = useQuery({
    queryKey: ["knowledge_items", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("knowledge_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KnowledgeItemRow[];
    },
    enabled: Boolean(userId),
  });
  const { data: activeFrameworkMatrix = null } = useQuery({
    queryKey: ["active-framework-matrix", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<unknown | null> => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
        .select("active_framework_id")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) throw profileError;

      const activeFrameworkId = (profile?.active_framework_id as string | null) ?? null;
      if (activeFrameworkId) {
        const { data: activeFramework, error: activeFrameworkError } = await (
          supabase.from("competency_frameworks") as any
        )
          .select("matrix")
          .eq("id", activeFrameworkId)
          .maybeSingle();
        if (activeFrameworkError) throw activeFrameworkError;
        if (activeFramework?.matrix) return activeFramework.matrix as unknown;
      }

      const { data: fallbackFramework, error: fallbackError } = await (
        supabase.from("competency_frameworks") as any
      )
        .select("matrix")
        .or(`is_system_default.eq.true,user_id.eq.${userId}`)
        .order("is_system_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (fallbackError) throw fallbackError;
      return (fallbackFramework?.matrix as unknown) ?? null;
    },
  });
  const knowledgeQueryKey = ["knowledge_items", userId] as const;
  const addKnowledgeMutation = useMutation({
    mutationFn: async (payload: {
      user_id: string;
      title: string;
      description: string;
      reference_links: string[];
    }) => {
      const { error } = await (supabase as any).from("knowledge_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const updateKnowledgeMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      description: string;
      reference_links: string[];
    }) => {
      const { error } = await (supabase as any)
        .from("knowledge_items")
        .update({
          title: payload.title,
          description: payload.description,
          reference_links: payload.reference_links,
        })
        .eq("id", payload.id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
      const previousRows = queryClient.getQueryData<KnowledgeItemRow[]>(knowledgeQueryKey) ?? [];
      queryClient.setQueryData<KnowledgeItemRow[]>(knowledgeQueryKey, (rows = []) =>
        rows.map((row) =>
          row.id === payload.id
            ? {
                ...row,
                title: payload.title,
                description: payload.description,
                reference_links: payload.reference_links,
              }
            : row,
        ),
      );
      return { previousRows };
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
      }
      toast.error(error.message || "Failed to update knowledge entry.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const deleteKnowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("knowledge_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
      const previousRows = queryClient.getQueryData<KnowledgeItemRow[]>(knowledgeQueryKey) ?? [];
      queryClient.setQueryData<KnowledgeItemRow[]>(knowledgeQueryKey, (rows = []) =>
        rows.filter((row) => row.id !== id),
      );
      return { previousRows };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
      }
      toast.error(error.message || "Failed to delete knowledge entry.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const [sampleAssessments, setSampleAssessments] = useState<Assessment[]>(() =>
    initialAssessments.slice(0, 3),
  );
  const { wizardDraft, setWizardDraft } = useHomeAssessmentDraft(userId);

  const historyAssessments = useMemo(() => {
    const merged = new Map<string, Assessment>();
    assessments.forEach((assessment) => {
      merged.set(assessment.id, assessment);
    });
    sampleAssessments.forEach((assessment) => {
      if (!merged.has(assessment.id)) merged.set(assessment.id, assessment);
    });
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime(),
    );
  }, [assessments, sampleAssessments]);

  const radarData = useMemo(
    () =>
      deriveRadarData(
        selectedEngineerId ? selectedEngineerAssessments[0] : assessments[0],
        frameworkCategories,
        currentFramework?.matrix ?? activeFrameworkMatrix,
      ),
    [
      selectedEngineerAssessments,
      selectedEngineerId,
      assessments,
      currentFramework?.matrix,
      frameworkCategories,
      activeFrameworkMatrix,
    ],
  );

  const [showCapture, setShowCapture] = useState(false);
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [openObjective, setOpenObjective] = useState<Objective | null>(null);
  const [openEvidence, setOpenEvidence] = useState<EvidenceRecord | null>(null);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeHubItem | null>(null);
  const [pendingKnowledgeDelete, setPendingKnowledgeDelete] = useState<KnowledgeHubItem | null>(
    null,
  );
  const [openInbox, setOpenInbox] = useState<InboxViewItem | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [review, setReview] = useState<ReviewSession | null>(null);
  const [pendingAssessmentDeleteId, setPendingAssessmentDeleteId] = useState<string | null>(null);
  const [showDiscardDraftConfirm, setShowDiscardDraftConfirm] = useState(false);
  const [dismissedSampleInboxIds, setDismissedSampleInboxIds] = useState<string[]>([]);
  const [pinnedResources, setPinnedResources] = useState<PinnedResourceRow[]>([]);
  const [newPinnedTitle, setNewPinnedTitle] = useState("");
  const [newPinnedUrl, setNewPinnedUrl] = useState("");
  const [isSubmittingPinnedResource, setIsSubmittingPinnedResource] = useState(false);
  const [isPinnedQuickAddOpen, setIsPinnedQuickAddOpen] = useState(false);
  const pinnedQuickAddPopoverRef = useRef<HTMLDivElement | null>(null);
  const pinnedQuickAddTriggerRef = useRef<HTMLButtonElement | null>(null);

  useHomeCaptureOnLoad({ openCaptureOnLoad, setShowCapture });

  const visibleEvidence = useMemo(
    () => (sampleContent.evidence ? evidence : evidence.filter((item) => !item.isSample)),
    [evidence, sampleContent.evidence],
  );
  const visibleArchivedEvidence = useMemo(
    () =>
      sampleContent.evidence ? archivedEvidence : archivedEvidence.filter((item) => !item.isSample),
    [archivedEvidence, sampleContent.evidence],
  );
  const visibleObjectives = useMemo(
    () => (sampleContent.objectives ? objectives : objectives.filter((item) => !item.isSample)),
    [objectives, sampleContent.objectives],
  );
  const visibleArchivedObjectives = useMemo(
    () =>
      sampleContent.objectives
        ? archivedObjectives
        : archivedObjectives.filter((item) => !item.isSample),
    [archivedObjectives, sampleContent.objectives],
  );
  const knowledgeItems = useMemo(
    () =>
      knowledgeRows
        .map(parseKnowledgeItemRow)
        .filter((item): item is KnowledgeHubItem => Boolean(item))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [knowledgeRows],
  );
  const globalSearchResults = useMemo(
    () =>
      buildHomeGlobalSearchResults({
        query: globalSearchQuery,
        visibleObjectives,
        visibleEvidence,
        knowledgeItems,
      }),
    [globalSearchQuery, knowledgeItems, visibleEvidence, visibleObjectives],
  );
  const {
    isManagerWorkspace,
    isManagerDirectoryView,
    activeWorkspaceId,
    notificationTargetUserId,
  } = useMemo(
    () =>
      deriveHomeWorkspaceScope({
        activeView,
        selectedEngineerId,
        managedEngineersCount: managedEngineers.length,
        tab,
        userId,
      }),
    [activeView, managedEngineers.length, selectedEngineerId, tab, userId],
  );
  const contextEvidence = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerEvidence,
    personalWorkspaceData: visibleEvidence,
  });
  const contextArchivedEvidence = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerArchivedEvidence,
    personalWorkspaceData: visibleArchivedEvidence,
  });
  const contextObjectives = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerObjectives,
    personalWorkspaceData: visibleObjectives,
  });
  const contextArchivedObjectives = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerArchivedObjectives,
    personalWorkspaceData: visibleArchivedObjectives,
  });
  const contextInbox = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerInbox,
    personalWorkspaceData: inbox,
  });
  const contextAssessments = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerAssessments,
    personalWorkspaceData: assessments,
  });
  const contextHistoryAssessments = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerAssessments,
    personalWorkspaceData: historyAssessments,
  });
  const selectedEngineerRole = useMemo(
    () =>
      getSelectedEngineerRole({
        selectedEngineerId,
        isManagerWorkspace,
        managedEngineers,
      }),
    [isManagerWorkspace, managedEngineers, selectedEngineerId],
  );
  const showTeamTransitionCard = useMemo(
    () =>
      shouldShowTeamTransitionCard({
        selectedEngineerId,
        isManagerWorkspace,
        managedEngineers,
      }),
    [isManagerWorkspace, managedEngineers, selectedEngineerId],
  );
  const fallbackEngineerName = user?.fullName?.trim() || user?.email || "Engineer";

  const notifyManagerAssessmentReady = useCallback(
    async (engineerId: string, engineerName: string) => {
      const { data: relationships, error: relationshipError } = await (supabase as any)
        .from("reporting_relationships")
        .select("manager_id")
        .eq("engineer_id", engineerId)
        .eq("relation_type", "direct_manager")
        .in("status", ["active", "in_handover"])
        .limit(1);

      if (relationshipError) {
        console.error(
          "[assessment-notification] unable to load manager relationship:",
          relationshipError,
        );
        return;
      }

      const managerId = (relationships as Array<{ manager_id: string }> | null)?.[0]?.manager_id;
      if (!managerId) return;

      const { success } = await sendNotification({
        data: {
          userId: managerId,
          type: "assessment",
          title: "Q3 assessment ready for review",
          description: `${engineerName} has finalized their readiness report and submitted it to your workspace.`,
        },
      });

      if (!success) {
        console.error("[assessment-notification] failed to send manager notification");
      }
    },
    [],
  );

  useHomePinnedQuickAddDismiss({
    isPinnedQuickAddOpen,
    setIsPinnedQuickAddOpen,
    pinnedQuickAddPopoverRef,
    pinnedQuickAddTriggerRef,
  });

  const visiblePinnedResources = useMemo(
    () =>
      buildVisiblePinnedResources({
        activeWorkspaceId,
        pinnedResources,
        includeSamplePinnedResources: sampleContent.pinnedResources,
      }),
    [activeWorkspaceId, pinnedResources, sampleContent.pinnedResources],
  );
  const {
    pinnedObjectiveIdToPinId,
    pinnedEvidenceIdToPinId,
    pinnedObjectiveIds,
    pinnedEvidenceIds,
  } = useMemo(() => buildPinnedResourceLookups(pinnedResources), [pinnedResources]);

  function flash(msg: string) {
    toast.success(msg);
  }

  const {
    loadPinnedResources,
    handleUnpin,
    handlePinGenericResource,
    handleToggleObjectivePin,
    handleToggleEvidencePin,
  } = useHomePinnedResourcesActions({
    activeWorkspaceId,
    notificationTargetUserId,
    userId,
    pinnedResources,
    setPinnedResources,
    newPinnedTitle,
    setNewPinnedTitle,
    newPinnedUrl,
    setNewPinnedUrl,
    isSubmittingPinnedResource,
    setIsSubmittingPinnedResource,
    setIsPinnedQuickAddOpen,
    pinnedObjectiveIdToPinId,
    pinnedEvidenceIdToPinId,
    onFlash: flash,
  });
  const { approveInbox, dismissInbox } = useHomeInboxActions({
    userId,
    inbox,
    setDismissedSampleInboxIds,
    insertEvidenceMutation,
    approveInboxMutation,
    dismissInboxMutation,
    onFlash: flash,
  });

  useEffect(() => {
    void loadPinnedResources();
  }, [loadPinnedResources]);

  const showUnlinkedManagerFallback = hasManagerOnboardingContext && managedEngineers.length === 0;
  const showWorkspaceConnectionFallback =
    showUnlinkedManagerFallback ||
    (isManagerDirectoryView && !isManagerTeamOverviewLoading && managerTeamOverview.length === 0);

  async function handleSignOutForWorkspaceReset() {
    await signout();
    sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
    window.location.assign("/");
  }

  const { handleTabChange, handleSettingsSectionChange, handleGlobalSearchSelect } =
    useHomeNavigationActions({
      navigate,
      settingsSection,
      setMobileSidebarOpen,
      setGlobalSearchQuery,
    });
  const { requestAssessmentDelete, executeAssessmentDelete, clearAssessmentWizardDraft } =
    useHomeAssessmentActions({
      userId,
      sampleAssessments,
      setSampleAssessments,
      review,
      setReview,
      setWizardDraft,
      setPendingAssessmentDeleteId,
      deleteAssessmentMutation,
      onFlash: flash,
    });

  function archiveObjectiveById(id: string) {
    archiveObjectiveMutation.mutate(id, {
      onSuccess: () => flash("Objective archived"),
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar
        tab={tab}
        setTab={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"} flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 print:ml-0`}
      >
        <TopHeader
          title={HOME_PAGE_TITLES[tab]}
          onCapture={() => {
            if (isManagerWorkspace) {
              void navigate({ to: getTabPath("report") });
              flash("Open Reviews & Reports to give manager feedback and approvals.");
              return;
            }
            setShowCapture(true);
          }}
          captureLabel={isManagerWorkspace ? "Give Feedback" : "Capture Evidence"}
          onMenuClick={() => setMobileSidebarOpen(true)}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchQueryChange={setGlobalSearchQuery}
          globalSearchResults={globalSearchResults}
          onGlobalSearchSelect={handleGlobalSearchSelect}
        />
        {managedEngineers.length > 0 && (
          <div className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto w-full px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Workspace Context
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isManagerWorkspace
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isManagerWorkspace ? "Manager Mode" : "Engineer Mode"}
                </span>
                {activeView === "profile" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEngineerId(null);
                      setActiveView("directory");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <ArrowLeft size={12} />
                    Back to Team Overview
                  </button>
                )}
              </div>
              <select
                value={selectedEngineerId ?? ""}
                onChange={(event) => {
                  const nextEngineerId = event.target.value || null;
                  setSelectedEngineerId(nextEngineerId);
                  setActiveView(nextEngineerId ? "profile" : "directory");
                }}
                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="">Team Overview</option>
                {managedEngineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {`Team: ${engineer.fullName} (${engineer.email})${
                      engineer.status === "in_handover" ? " [Incoming Transfer]" : ""
                    }`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <main className="flex-1 print-main">
          <div className="max-w-7xl mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 md:py-6">
            {!showWorkspaceConnectionFallback && tab === "dashboard" && !isManagerDirectoryView && (
              <div className="max-w-7xl mx-auto w-full mb-6">
                <div className="h-12 px-4 bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                    <Pin size={12} className="rotate-45 text-slate-400" />
                    Pinned
                  </div>
                  {visiblePinnedResources.length === 0 ? (
                    <span className="flex-1 text-xs italic text-slate-400 font-medium">
                      No resources pinned to this workspace yet.
                    </span>
                  ) : (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {visiblePinnedResources.map((pin) => (
                          <div
                            key={pin.id}
                            className="shrink-0 inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 ease-in-out"
                          >
                            {pin.resource_type === "evidence" ? (
                              <FileText size={13} className="text-blue-500" />
                            ) : pin.resource_type === "objective" ? (
                              <Target size={13} className="text-emerald-500" />
                            ) : (
                              <LinkIcon size={13} className="text-slate-400" />
                            )}
                            {pin.url ? (
                              <a
                                href={pin.url}
                                target="_blank"
                                rel="noreferrer"
                                className="max-w-[160px] truncate hover:underline text-slate-800"
                                title={pin.title}
                              >
                                {pin.title}
                              </a>
                            ) : (
                              <span
                                className="max-w-[160px] truncate text-slate-800"
                                title={pin.title}
                              >
                                {pin.title}
                              </span>
                            )}
                            {!pin.isSample && (
                              <button
                                type="button"
                                onClick={() => handleUnpin(pin.id)}
                                className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="relative shrink-0">
                    <button
                      ref={pinnedQuickAddTriggerRef}
                      type="button"
                      onClick={() => setIsPinnedQuickAddOpen((prev) => !prev)}
                      className="h-7 w-7 rounded-md border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      aria-label="Add workspace pin"
                    >
                      <Plus size={14} />
                    </button>
                    {isPinnedQuickAddOpen && (
                      <div
                        ref={pinnedQuickAddPopoverRef}
                        className="absolute right-0 top-9 w-64 bg-white border border-slate-200 rounded-xl p-3 shadow-xl z-50 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <input
                          value={newPinnedTitle}
                          onChange={(event) => setNewPinnedTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            void handlePinGenericResource();
                          }}
                          placeholder="Label"
                          className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                        <input
                          value={newPinnedUrl}
                          onChange={(event) => setNewPinnedUrl(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            void handlePinGenericResource();
                          }}
                          placeholder="URL"
                          className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsPinnedQuickAddOpen(false)}
                            className="h-7 px-2.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handlePinGenericResource()}
                            disabled={isSubmittingPinnedResource}
                            className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSubmittingPinnedResource ? "Anchoring..." : "Anchor to Workspace"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!showWorkspaceConnectionFallback && showTeamTransitionCard && selectedEngineerId && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block">
                    Team Transition In Progress
                  </span>
                  <h4 className="text-sm font-medium text-slate-900">
                    Brief the incoming manager before access transfers
                  </h4>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-400 mb-2">
                    AI-Compiled Technical Dossier (Past 6 Months)
                  </div>
                  <p className="text-sm text-slate-600">
                    Compiling achievements from Bitbucket and Jira logs to construct the cross-team
                    advocacy bridge...
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    Manager Insights &amp; Leadership Style Notes (Optional)
                  </div>
                  <textarea
                    value={handoverNotes}
                    onChange={(event) => setHandoverNotes(event.target.value)}
                    placeholder="Add any personal notes on mentorship strengths, autonomy preferences, or career goals for the incoming manager..."
                    className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSigningOffTransfer}
                    onClick={() => {
                      if (!selectedEngineerId) return;
                      setIsSigningOffTransfer(true);
                      void supabase.auth
                        .getSession()
                        .then(({ data: { session } }) => {
                          const token = session?.access_token;
                          if (!token) {
                            throw new Error("Session expired. Please sign in again.");
                          }
                          return signOffTransfer({
                            data: {
                              engineerId: selectedEngineerId,
                              workEthicsNotes: handoverNotes.trim(),
                              token,
                            },
                          });
                        })
                        .then(() => {
                          toast.success("Transfer signed off and dossier shared.");
                          setHandoverNotes("");
                          setManagerRelationshipsRefreshNonce((prev) => prev + 1);
                          setSelectedEngineerId(null);
                          setActiveView("directory");
                        })
                        .catch((error) => {
                          const message =
                            error instanceof Error ? error.message : "Failed to sign off transfer.";
                          toast.error(message);
                        })
                        .finally(() => {
                          setIsSigningOffTransfer(false);
                        });
                    }}
                    className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSigningOffTransfer ? "Signing off..." : "Sign Off & Transfer Advocacy"}
                  </button>
                </div>
              </div>
            )}
            {showWorkspaceConnectionFallback ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                  Awaiting Workspace Connection
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  You don&apos;t have any active engineer tracking lines assigned to your profile
                  yet. Please request a secure single-use invitation link from your engineer to sync
                  metrics.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void handleSignOutForWorkspaceReset();
                  }}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Sign Out / Switch Accounts
                </button>
              </div>
            ) : isManagerDirectoryView ? (
              <div className="max-w-7xl mx-auto w-full mt-6 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[
                        "Engineer",
                        "Activity Status",
                        "Objective Progress",
                        "Pending Items",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 h-10 px-4"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isManagerTeamOverviewLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                          Loading team overview...
                        </td>
                      </tr>
                    ) : (
                      managerTeamOverview.map((engineer) => {
                        const total = Math.max(engineer.totalObjectivesCount, 0);
                        const completed = Math.max(engineer.completedObjectivesCount, 0);
                        const ratio =
                          total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

                        return (
                          <tr
                            key={engineer.engineerId}
                            className="border-t border-slate-100 hover:bg-slate-50/80"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {engineer.avatarUrl ? (
                                  <img
                                    src={engineer.avatarUrl}
                                    alt={engineer.fullName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center">
                                    {getWorkspaceMemberInitials(engineer.fullName)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-800 truncate">
                                    {engineer.fullName}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {engineer.currentTitle ?? "No title set"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              {formatWorkspaceActivityStatus(engineer.lastActivityAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${ratio}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                  {completed}/{total}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  PRI {engineer.promotionReadinessIndex}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {engineer.pendingReviewsCount > 0 ? (
                                <span className="bg-amber-50 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-full">
                                  {engineer.pendingReviewsCount} pending
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">✓ Clear</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEngineerId(engineer.engineerId);
                                  setActiveView("profile");
                                }}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                              >
                                Review Workspace →
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === "dashboard" && (
                    <DashboardView
                      workspaceUserId={selectedEngineerId ?? userId}
                      inbox={contextInbox}
                      showSampleData={sampleContent.dashboard}
                      dismissedSampleInboxIds={dismissedSampleInboxIds}
                      onOpenInbox={isManagerWorkspace ? () => {} : setOpenInbox}
                      onOpenObjective={setOpenObjective}
                      onOpenEvidence={setOpenEvidence}
                    />
                  )}
                  {tab === "radar" && (
                    <RadarView
                      data={radarData}
                      assessments={contextAssessments}
                      evidence={contextEvidence}
                      objectives={contextObjectives}
                      wizardDraft={wizardDraft}
                      selectedEngineerId={selectedEngineerId}
                      onCreateObjective={() => setShowCreateObjective(true)}
                      onStartReview={() => setShowWizard(true)}
                      onResumeDraft={() => setShowWizard(true)}
                      onDiscardDraft={() => setShowDiscardDraftConfirm(true)}
                      onOpenHistory={() => setShowHistory(true)}
                    />
                  )}
                  {tab === "evidence" && (
                    <EvidenceView
                      rows={[...contextEvidence, ...contextArchivedEvidence]}
                      readOnly={isManagerWorkspace}
                      onOpenRow={isManagerWorkspace ? () => {} : setOpenEvidence}
                      pinnedEvidenceIds={pinnedEvidenceIds}
                      onTogglePin={(item) => {
                        void handleToggleEvidencePin(item);
                      }}
                      onArchive={(id) => {
                        archiveEvidenceMutation.mutate(id, {
                          onSuccess: () => flash("Evidence archived"),
                        });
                      }}
                      onPermanentDelete={(id) => {
                        deleteEvidenceMutation.mutate(id, {
                          onSuccess: () => flash("Evidence permanently deleted"),
                        });
                      }}
                      onRestore={(id) => {
                        restoreEvidenceMutation.mutate(id, {
                          onSuccess: () => flash("Evidence restored to log"),
                        });
                      }}
                    />
                  )}
                  {tab === "objectives" && (
                    <ObjectivesView
                      items={[...contextObjectives, ...contextArchivedObjectives]}
                      readOnly={isManagerWorkspace}
                      onOpen={isManagerWorkspace ? () => {} : setOpenObjective}
                      onCreate={() => {
                        if (isManagerWorkspace) {
                          flash("Managers review and approve objectives from the manager panel.");
                          return;
                        }
                        setShowCreateObjective(true);
                      }}
                      pinnedObjectiveIds={pinnedObjectiveIds}
                      onTogglePin={(objective) => {
                        void handleToggleObjectivePin(objective);
                      }}
                      formatObjectiveCode={formatObjectiveCode}
                      formatDisplayDate={formatDisplayDate}
                      onRestore={(o) => {
                        restoreObjectiveMutation.mutate(o.id, {
                          onSuccess: () => flash("Objective restored to Kanban board"),
                        });
                      }}
                      onDelete={(o) => {
                        deleteObjectiveMutation.mutate(o, {
                          onSuccess: () => flash("Objective permanently deleted"),
                        });
                      }}
                      onMove={(id, status) => {
                        if (isManagerWorkspace) return;
                        const target = [...contextObjectives, ...contextArchivedObjectives].find(
                          (o) => o.id === id,
                        );
                        if (!target || target.status === status || target.status === "Completed")
                          return;
                        moveObjectiveMutation.mutate(
                          { id, status, objective: target },
                          {
                            onSuccess: () => {
                              if (status === "Completed")
                                flash("Objective completed and added to evidence");
                              else if (target.status === "Completed" && status === "In Progress")
                                flash("Objective reverted and removed from evidence log");
                              else flash(`Moved to ${status}`);
                            },
                          },
                        );
                      }}
                    />
                  )}
                  {tab === "knowledge" && (
                    <KnowledgeHubView
                      items={knowledgeItems}
                      onEdit={setEditingKnowledge}
                      onDelete={(item) => setPendingKnowledgeDelete(item)}
                    />
                  )}
                  {tab === "report" && (
                    <ReportView
                      evidence={contextEvidence}
                      objectives={contextObjectives}
                      radarData={radarData}
                      onFlash={flash}
                      review={review}
                      assessments={contextAssessments}
                      historyAssessments={contextHistoryAssessments}
                      selectedEngineerId={selectedEngineerId}
                      onOpenAssessment={(a) => setReview(assessmentToSession(a))}
                      onSaveTopics={(assessmentId, topics) => {
                        updateTopicsMutation.mutate(
                          { assessmentId, topics },
                          { onSuccess: () => flash("1-on-1 topics saved") },
                        );
                      }}
                      onDeleteHistoryAssessment={(assessmentId) => {
                        requestAssessmentDelete(assessmentId);
                      }}
                      onClearReview={() => setReview(null)}
                      onStartReview={() => setShowWizard(true)}
                      onOpenHistory={() => setShowHistory(true)}
                    />
                  )}
                  {tab === "feedback" && <FeedbackView />}
                  {tab === "settings" && (
                    <SettingsView
                      sampleContent={sampleContent}
                      onSampleContentChange={setSampleContent}
                      section={settingsSection}
                      onSectionChange={handleSettingsSectionChange}
                    />
                  )}
                  {selectedEngineerId &&
                    selectedEngineerRole &&
                    (tab === "dashboard" || tab === "radar" || tab === "report") && (
                      <ManagerActionsPanel
                        engineerId={selectedEngineerId}
                        currentUserRole={selectedEngineerRole}
                      />
                    )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Capture modal */}
      <AnimatePresence>
        {showCapture && (
          <CaptureModal
            onClose={() => setShowCapture(false)}
            competencyDescriptions={COMPETENCY_DESC}
            onSaveEvidence={({ title, description, sourceLink, category, subcategory }) => {
              insertEvidenceMutation.mutate(
                {
                  id: "",
                  date: toLocalDateString(),
                  source: "Manual",
                  category,
                  competency: subcategory,
                  title: title.trim(),
                  description: description.trim(),
                  link: sourceLink.trim(),
                  status: "Pending Review",
                  matchState: "Unset",
                  managerNotes: "",
                  isArchived: false,
                  createdAt: new Date().toISOString(),
                },
                {
                  onSuccess: () => {
                    setShowCapture(false);
                    flash("Evidence captured");
                  },
                },
              );
            }}
            onSaveKnowledge={({ challenge, lesson, referenceLinks, reset }) => {
              if (!userId) {
                toast.error("Please sign in before saving knowledge.");
                return;
              }
              addKnowledgeMutation.mutate(
                {
                  user_id: userId,
                  title: challenge.trim(),
                  description: lesson.trim(),
                  reference_links: referenceLinks,
                },
                {
                  onSuccess: () => {
                    reset();
                    toast.success("Knowledge entry saved.");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Knowledge edit modal */}
      <AnimatePresence>
        {editingKnowledge && (
          <KnowledgeEditorModal
            item={editingKnowledge}
            isSaving={updateKnowledgeMutation.isPending}
            onClose={() => setEditingKnowledge(null)}
            onSave={({ challenge, lesson, referenceLinks }) => {
              updateKnowledgeMutation.mutate(
                {
                  id: editingKnowledge.id,
                  title: challenge.trim(),
                  description: lesson.trim(),
                  reference_links: referenceLinks,
                },
                {
                  onSuccess: () => {
                    setEditingKnowledge(null);
                    flash("Knowledge log updated");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Knowledge delete confirmation */}
      <AnimatePresence>
        {pendingKnowledgeDelete && (
          <ConfirmDialog
            title="Delete knowledge log?"
            description="This action cannot be undone. This knowledge entry will be permanently deleted."
            confirmLabel="Delete log"
            cancelLabel="Cancel"
            destructive
            onCancel={() => setPendingKnowledgeDelete(null)}
            onConfirm={() => {
              const target = pendingKnowledgeDelete;
              if (!target) return;
              deleteKnowledgeMutation.mutate(target.id, {
                onSuccess: () => {
                  if (editingKnowledge?.id === target.id) setEditingKnowledge(null);
                  setPendingKnowledgeDelete(null);
                  flash("Knowledge log deleted");
                },
                onError: () => {
                  setPendingKnowledgeDelete(null);
                },
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Create SMART objective modal */}
      <AnimatePresence>
        {showCreateObjective && (
          <CreateObjectiveModal
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setShowCreateObjective(false)}
            onSubmit={(o) => {
              createObjectiveMutation.mutate(
                { ...o, id: "", status: "Pending Approval" },
                {
                  onSuccess: () => {
                    setShowCreateObjective(false);
                    flash("Objective submitted for approval");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Objective details slide-over */}
      <AnimatePresence>
        {openObjective && (
          <ObjectiveSlideover
            objective={openObjective}
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setOpenObjective(null)}
            onPin={(objective) => {
              void handleToggleObjectivePin(objective);
            }}
            onSave={(o) => {
              saveObjectiveMutation.mutate(o, {
                onSuccess: () => {
                  setOpenObjective(o);
                  flash("Objective updated");
                },
              });
            }}
            onChangeStatus={(o, next) => {
              const updated = { ...o, status: next as Objective["status"] };
              moveObjectiveMutation.mutate(
                { id: o.id, status: next, objective: o },
                {
                  onSuccess: () => {
                    setOpenObjective(updated);
                    if (next === "Completed") flash("Objective completed and added to evidence");
                    else if (o.status === "Completed" && next === "In Progress")
                      flash("Objective reverted and removed from evidence log");
                    else if (next === "In Progress")
                      flash("Objective approved and moved to In Progress");
                  },
                },
              );
            }}
            onArchive={(o) => {
              archiveObjectiveById(o.id);
              setOpenObjective(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Evidence details slide-over */}
      <AnimatePresence>
        {openEvidence && (
          <EvidenceSlideover
            item={openEvidence}
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setOpenEvidence(null)}
            onPin={(item) => {
              void handleToggleEvidencePin(item);
            }}
            onSave={(updated) => {
              saveEvidenceMutation.mutate(updated, {
                onSuccess: () => {
                  setOpenEvidence(updated);
                  flash("Evidence updated");
                },
              });
            }}
            onArchive={(id) => {
              archiveEvidenceMutation.mutate(id, {
                onSuccess: () => {
                  setOpenEvidence(null);
                  flash("Evidence archived");
                },
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Auto-captured inbox slide-over */}
      <AnimatePresence>
        {openInbox && (
          <InboxReviewSlideover
            item={openInbox}
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setOpenInbox(null)}
            onConfirm={(comps) => {
              approveInbox(openInbox, comps);
              setOpenInbox(null);
            }}
            onDismiss={() => {
              dismissInbox(openInbox);
              setOpenInbox(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Performance Review wizard */}
      <AnimatePresence>
        {showWizard && (
          <ReviewWizard
            evidence={visibleEvidence}
            onOpenEvidence={setOpenEvidence}
            onClose={() => setShowWizard(false)}
            latestAssessment={assessments[0]}
            initialDraft={wizardDraft}
            engineerName={fallbackEngineerName}
            managerName={user?.manager?.trim() || "Manager"}
            onSaveDraft={(draft) => {
              setWizardDraft(draft);
              flash("Assessment draft saved");
            }}
            onFinalize={(session: ReviewSession) => {
              const finalizedByUserId = authUserId ?? userId;
              if (!finalizedByUserId) {
                toast.error("Unable to finalize assessment: no authenticated user session found.");
                return;
              }
              const newAssessment = sessionToAssessment(session);
              finalizeAssessmentMutation.mutate(
                { assessment: newAssessment, userId: finalizedByUserId },
                {
                  onSuccess: () => {
                    void notifyManagerAssessmentReady(
                      finalizedByUserId,
                      newAssessment.engineerName?.trim() || fallbackEngineerName,
                    );
                    setReview(session);
                    clearAssessmentWizardDraft();
                    setShowWizard(false);
                    void navigate({ to: getTabPath("report") });
                    flash("Assessment finalized · Report generated");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Assessment history modal */}
      <AnimatePresence>
        {showHistory && (
          <AssessmentHistoryModal
            assessments={historyAssessments}
            currentId={review?.id ?? null}
            onDelete={(assessmentId) => {
              requestAssessmentDelete(assessmentId);
            }}
            onClose={() => setShowHistory(false)}
            onOpen={(a) => {
              setReview(assessmentToSession(a));
              setShowHistory(false);
              void navigate({ to: getTabPath("report") });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiscardDraftConfirm && (
          <ConfirmDialog
            destructive
            title="Discard ongoing assessment draft?"
            description="This permanently removes your saved assessment progress and notes. You cannot undo this action."
            confirmLabel="Discard draft"
            onCancel={() => setShowDiscardDraftConfirm(false)}
            onConfirm={() => {
              clearAssessmentWizardDraft();
              setShowDiscardDraftConfirm(false);
              flash("Assessment draft discarded");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingAssessmentDeleteId && (
          <ConfirmDialog
            destructive
            title="Delete assessment report?"
            description="Are you sure you want to delete this assessment report? This action cannot be undone."
            confirmLabel="Delete report"
            onCancel={() => setPendingAssessmentDeleteId(null)}
            onConfirm={() => {
              executeAssessmentDelete(pendingAssessmentDeleteId);
              setPendingAssessmentDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================ */
/*                  TAB 1: DASHBOARD                            */
/* ============================================================ */

/* ============================================================ */
/*                  TAB 2: RADAR                                */
/* ============================================================ */

/* ============================================================ */
/*                  TAB 3: EVIDENCE LOG                         */
/* ============================================================ */
