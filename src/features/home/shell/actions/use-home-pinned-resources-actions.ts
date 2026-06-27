import { useCallback } from "react";
import { toast } from "sonner";
import { pinResource, unpinResource } from "@/lib/api/pinned-resources.functions";
import { supabase } from "@/lib/supabase";
import type { EvidenceRecord, Objective } from "@/features/home/shared/models";
import type { PinnedResourceRow } from "@/features/home/shared/pinned-resource-samples";
import type { KnowledgeHubItem } from "@/features/home/knowledge/knowledge";
import { buildKnowledgePinUrl } from "@/features/home/shared/pinned-resource-targets";

type UseHomePinnedResourcesActionsParams = {
  activeWorkspaceId: string;
  notificationTargetUserId: string;
  userId: string;
  pinnedResources: PinnedResourceRow[];
  setPinnedResources: React.Dispatch<React.SetStateAction<PinnedResourceRow[]>>;
  newPinnedTitle: string;
  setNewPinnedTitle: React.Dispatch<React.SetStateAction<string>>;
  newPinnedUrl: string;
  setNewPinnedUrl: React.Dispatch<React.SetStateAction<string>>;
  isSubmittingPinnedResource: boolean;
  setIsSubmittingPinnedResource: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPinnedQuickAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pinnedObjectiveIdToPinId: Map<string, string>;
  pinnedEvidenceIdToPinId: Map<string, string>;
  pinnedKnowledgeIdToPinId: Map<string, string>;
  onFlash: (message: string) => void;
};

export function useHomePinnedResourcesActions({
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
  pinnedKnowledgeIdToPinId,
  onFlash,
}: UseHomePinnedResourcesActionsParams) {
  const loadPinnedResources = useCallback(async () => {
    if (!activeWorkspaceId) {
      setPinnedResources([]);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("pinned_resources")
      .select(
        "id, title, url, resource_type, evidence_id, objective_id, workspace_id, pinned_by, created_at",
      )
      .eq("workspace_id", activeWorkspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[pinned-resources] failed to load:", error);
      setPinnedResources([]);
      return;
    }

    setPinnedResources(((data ?? []) as PinnedResourceRow[]) ?? []);
  }, [activeWorkspaceId, setPinnedResources]);

  const handleUnpin = useCallback(
    async (pinId: string) => {
      const existing = pinnedResources.find((pin) => pin.id === pinId);
      if (!existing || existing.isSample) return true;

      setPinnedResources((prev) => prev.filter((pin) => pin.id !== pinId));

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          throw new Error("Session expired. Please sign in again.");
        }
        await unpinResource({
          data: {
            token,
            pinId,
          },
        });
        return true;
      } catch (error) {
        setPinnedResources((prev) =>
          prev.some((pin) => pin.id === existing.id) ? prev : [existing, ...prev],
        );
        const message = error instanceof Error ? error.message : "Failed to unpin resource.";
        toast.error(message);
        return false;
      }
    },
    [pinnedResources, setPinnedResources],
  );

  const handlePinResource = useCallback(
    async (args: {
      title: string;
      resourceType: "evidence" | "objective" | "generic";
      url?: string;
      evidenceId?: string;
      objectiveId?: string;
    }) => {
      if (!activeWorkspaceId || !notificationTargetUserId) {
        throw new Error("Unable to pin resource: no active workspace context found.");
      }

      const normalizedTitle = args.title.trim();
      if (!normalizedTitle) {
        throw new Error("Please provide a title before pinning.");
      }

      const normalizedUrl = args.url?.trim();
      if (normalizedUrl) {
        try {
          new URL(normalizedUrl);
        } catch {
          throw new Error("Please enter a valid URL.");
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimisticPin: PinnedResourceRow = {
        id: optimisticId,
        title: normalizedTitle,
        url: normalizedUrl || null,
        resource_type: args.resourceType,
        evidence_id: args.evidenceId ?? null,
        objective_id: args.objectiveId ?? null,
        workspace_id: activeWorkspaceId,
        pinned_by: userId ?? "",
        created_at: new Date().toISOString(),
      };
      setPinnedResources((prev) => [optimisticPin, ...prev]);

      try {
        await pinResource({
          data: {
            token,
            workspaceId: activeWorkspaceId,
            title: normalizedTitle,
            url: normalizedUrl || undefined,
            resourceType: args.resourceType,
            evidenceId: args.evidenceId,
            objectiveId: args.objectiveId,
            notifyUserId: notificationTargetUserId,
          },
        });

        await loadPinnedResources();
      } catch (error) {
        setPinnedResources((prev) => prev.filter((pin) => pin.id !== optimisticId));
        throw error;
      }
    },
    [activeWorkspaceId, loadPinnedResources, notificationTargetUserId, setPinnedResources, userId],
  );

  const handlePinGenericResource = useCallback(async () => {
    if (isSubmittingPinnedResource) return;
    setIsSubmittingPinnedResource(true);
    try {
      await handlePinResource({
        title: newPinnedTitle,
        url: newPinnedUrl,
        resourceType: "generic",
      });
      setNewPinnedTitle("");
      setNewPinnedUrl("");
      setIsPinnedQuickAddOpen(false);
      onFlash("Resource pinned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to pin resource.";
      toast.error(message);
    } finally {
      setIsSubmittingPinnedResource(false);
    }
  }, [
    handlePinResource,
    isSubmittingPinnedResource,
    newPinnedTitle,
    newPinnedUrl,
    onFlash,
    setIsPinnedQuickAddOpen,
    setIsSubmittingPinnedResource,
    setNewPinnedTitle,
    setNewPinnedUrl,
  ]);

  const handlePinObjectiveResource = useCallback(
    async (objective: Objective) => {
      try {
        await handlePinResource({
          title: objective.title,
          url: objective.links?.[0]?.url?.trim() || undefined,
          resourceType: "objective",
          objectiveId: objective.id,
        });
        onFlash("Objective pinned to workspace");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to pin objective.";
        toast.error(message);
      }
    },
    [handlePinResource, onFlash],
  );

  const handlePinEvidenceResource = useCallback(
    async (item: EvidenceRecord) => {
      try {
        await handlePinResource({
          title: item.title,
          url: item.link?.trim() || undefined,
          resourceType: "evidence",
          evidenceId: item.id,
        });
        onFlash("Evidence pinned to workspace");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to pin evidence.";
        toast.error(message);
      }
    },
    [handlePinResource, onFlash],
  );

  const handleToggleObjectivePin = useCallback(
    async (objective: Objective) => {
      const existingPinId = pinnedObjectiveIdToPinId.get(objective.id);
      if (existingPinId) {
        const didUnpin = await handleUnpin(existingPinId);
        if (didUnpin) onFlash("Objective unpinned from workspace");
        return;
      }
      await handlePinObjectiveResource(objective);
    },
    [handlePinObjectiveResource, handleUnpin, onFlash, pinnedObjectiveIdToPinId],
  );

  const handleToggleEvidencePin = useCallback(
    async (item: EvidenceRecord) => {
      const existingPinId = pinnedEvidenceIdToPinId.get(item.id);
      if (existingPinId) {
        const didUnpin = await handleUnpin(existingPinId);
        if (didUnpin) onFlash("Evidence unpinned from workspace");
        return;
      }
      await handlePinEvidenceResource(item);
    },
    [handlePinEvidenceResource, handleUnpin, onFlash, pinnedEvidenceIdToPinId],
  );

  const handlePinKnowledgeResource = useCallback(
    async (item: KnowledgeHubItem) => {
      const title = item.challenge.trim();
      if (!title) {
        toast.error("Unable to pin this knowledge card because it has no title.");
        return;
      }
      try {
        await handlePinResource({
          title,
          url: buildKnowledgePinUrl(item.id),
          resourceType: "generic",
        });
        onFlash("Knowledge card pinned to workspace");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to pin knowledge card.";
        toast.error(message);
      }
    },
    [handlePinResource, onFlash],
  );

  const handleToggleKnowledgePin = useCallback(
    async (item: KnowledgeHubItem) => {
      const existingPinId = pinnedKnowledgeIdToPinId.get(item.id);
      if (existingPinId) {
        const didUnpin = await handleUnpin(existingPinId);
        if (didUnpin) onFlash("Knowledge card unpinned from workspace");
        return;
      }
      await handlePinKnowledgeResource(item);
    },
    [handlePinKnowledgeResource, handleUnpin, onFlash, pinnedKnowledgeIdToPinId],
  );

  return {
    loadPinnedResources,
    handleUnpin,
    handlePinGenericResource,
    handleToggleObjectivePin,
    handleToggleEvidencePin,
    handleToggleKnowledgePin,
  };
}
