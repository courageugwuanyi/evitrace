import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toLocalDateString } from "@/lib/datetime";
import type {
  InboxConfirmPayload,
  InboxViewItem,
} from "@/features/home/shell/home-route-contracts";

type InsertEvidenceMutationLike = {
  mutate: (
    payload: {
      id: string;
      date: string;
      source: string;
      category: string;
      competency: string;
      title: string;
      description: string;
      link: string;
      status: "Pending Review";
      matchState: "Unset";
      managerNotes: string;
      isArchived: boolean;
      createdAt: string;
    },
    options?: {
      onSuccess?: () => void;
    },
  ) => void;
};

type ApproveInboxMutationLike = {
  mutate: (
    payload: {
      inboxItem: InboxViewItem;
      newEvidenceRow: {
        user_id: string;
        date: string;
        source: string;
        category: string;
        competency: string;
        title: string;
        description: string;
        link: string;
        status: "Pending Review";
        match_state: "Unset";
        manager_notes: string;
        is_archived: boolean;
      };
    },
    options?: {
      onSuccess?: () => void;
    },
  ) => void;
};

type DismissInboxMutationLike = {
  mutate: (
    inboxItemId: string,
    options?: {
      onSuccess?: () => void;
    },
  ) => void;
};

type UseHomeInboxActionsParams = {
  userId: string;
  inbox: InboxViewItem[];
  setDismissedSampleInboxIds: Dispatch<SetStateAction<string[]>>;
  insertEvidenceMutation: InsertEvidenceMutationLike;
  approveInboxMutation: ApproveInboxMutationLike;
  dismissInboxMutation: DismissInboxMutationLike;
  onFlash: (message: string) => void;
};

export function useHomeInboxActions({
  userId,
  inbox,
  setDismissedSampleInboxIds,
  insertEvidenceMutation,
  approveInboxMutation,
  dismissInboxMutation,
  onFlash,
}: UseHomeInboxActionsParams) {
  const approveInbox = useCallback(
    (item: InboxViewItem, payload: InboxConfirmPayload) => {
      const title = payload.title.trim() || item.title;
      const description = payload.description.trim();
      const category = payload.category;
      const competency = payload.subcategory;

      if (item.isSample) {
        setDismissedSampleInboxIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
        insertEvidenceMutation.mutate(
          {
            id: "",
            date: toLocalDateString(),
            source: item.source,
            category,
            competency,
            title,
            description,
            link: "",
            status: "Pending Review",
            matchState: "Unset",
            managerNotes: "",
            isArchived: false,
            createdAt: new Date().toISOString(),
          },
          { onSuccess: () => onFlash("Sample event mapped and added to evidence log") },
        );
        return;
      }

      const liveItem = inbox.find((candidate) => candidate.id === item.id);
      if (!liveItem) return;

      const newEvidenceRow = {
        user_id: userId,
        date: toLocalDateString(),
        source: liveItem.source,
        category,
        competency,
        title,
        description,
        link: "",
        status: "Pending Review" as const,
        match_state: "Unset" as const,
        manager_notes: "",
        is_archived: false,
      };
      approveInboxMutation.mutate(
        { inboxItem: liveItem, newEvidenceRow },
        { onSuccess: () => onFlash("Evidence mapped and added to log") },
      );
    },
    [
      approveInboxMutation,
      inbox,
      insertEvidenceMutation,
      onFlash,
      setDismissedSampleInboxIds,
      userId,
    ],
  );

  const dismissInbox = useCallback(
    (item: InboxViewItem) => {
      if (item.isSample) {
        setDismissedSampleInboxIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
        onFlash("Sample event closed");
        return;
      }

      dismissInboxMutation.mutate(item.id, {
        onSuccess: () => onFlash("Event dismissed"),
      });
    },
    [dismissInboxMutation, onFlash, setDismissedSampleInboxIds],
  );

  return { approveInbox, dismissInbox };
}
