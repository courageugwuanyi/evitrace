import { useCallback, type Dispatch, type SetStateAction } from "react";
import type {
  Assessment,
  AssessmentWizardDraft,
  ReviewSession,
} from "@/features/home/assessment/assessment-domain";
import {
  getAssessmentWizardDraftStorageKey,
  getLegacyAssessmentWizardDraftStorageKey,
} from "@/features/home/assessment/assessment-domain";

type DeleteAssessmentMutationLike = {
  mutate: (
    payload: { assessmentId: string },
    options?: {
      onSuccess?: () => void;
    },
  ) => void;
};

type UseHomeAssessmentActionsParams = {
  userId: string;
  sampleAssessments: Assessment[];
  setSampleAssessments: Dispatch<SetStateAction<Assessment[]>>;
  review: ReviewSession | null;
  setReview: Dispatch<SetStateAction<ReviewSession | null>>;
  setWizardDraft: Dispatch<SetStateAction<AssessmentWizardDraft | null>>;
  setPendingAssessmentDeleteId: Dispatch<SetStateAction<string | null>>;
  deleteAssessmentMutation: DeleteAssessmentMutationLike;
  onFlash: (message: string) => void;
};

export function useHomeAssessmentActions({
  userId,
  sampleAssessments,
  setSampleAssessments,
  review,
  setReview,
  setWizardDraft,
  setPendingAssessmentDeleteId,
  deleteAssessmentMutation,
  onFlash,
}: UseHomeAssessmentActionsParams) {
  const requestAssessmentDelete = useCallback(
    (assessmentId: string) => {
      setPendingAssessmentDeleteId(assessmentId);
    },
    [setPendingAssessmentDeleteId],
  );

  const executeAssessmentDelete = useCallback(
    (assessmentId: string) => {
      const target = sampleAssessments.find((assessment) => assessment.id === assessmentId);
      if (target?.isSample) {
        setSampleAssessments((prev) => prev.filter((assessment) => assessment.id !== assessmentId));
        if (review?.id === assessmentId) setReview(null);
        onFlash("Sample assessment removed from history");
        return;
      }

      deleteAssessmentMutation.mutate(
        { assessmentId },
        {
          onSuccess: () => {
            if (review?.id === assessmentId) setReview(null);
            onFlash("Assessment deleted from history");
          },
        },
      );
    },
    [deleteAssessmentMutation, onFlash, review?.id, sampleAssessments, setReview, setSampleAssessments],
  );

  const clearAssessmentWizardDraft = useCallback(() => {
    setWizardDraft(null);
    if (typeof window === "undefined" || !userId) return;
    window.localStorage.removeItem(getAssessmentWizardDraftStorageKey(userId));
    window.localStorage.removeItem(getLegacyAssessmentWizardDraftStorageKey(userId));
  }, [setWizardDraft, userId]);

  return {
    requestAssessmentDelete,
    executeAssessmentDelete,
    clearAssessmentWizardDraft,
  };
}
