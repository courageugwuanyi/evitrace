import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { AssessmentWizardDraft } from "@/features/home/assessment/assessment-domain";
import {
  getAssessmentWizardDraftStorageKey,
  getLegacyAssessmentWizardDraftStorageKey,
} from "@/features/home/assessment/assessment-domain";

type UseHomeAssessmentDraftResult = {
  wizardDraft: AssessmentWizardDraft | null;
  setWizardDraft: Dispatch<SetStateAction<AssessmentWizardDraft | null>>;
};

export function useHomeAssessmentDraft(userId: string): UseHomeAssessmentDraftResult {
  const [wizardDraft, setWizardDraft] = useState<AssessmentWizardDraft | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const key = getAssessmentWizardDraftStorageKey(userId);
    const legacyKey = getLegacyAssessmentWizardDraftStorageKey(userId);
    const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AssessmentWizardDraft;
      if (parsed && parsed.scores && typeof parsed.activeIdx === "number" && parsed.savedAt) {
        setWizardDraft(parsed);
        window.localStorage.setItem(key, JSON.stringify(parsed));
        window.localStorage.removeItem(legacyKey);
      }
    } catch {
      // ignore malformed persisted values
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const key = getAssessmentWizardDraftStorageKey(userId);
    if (!wizardDraft) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(wizardDraft));
  }, [userId, wizardDraft]);

  return { wizardDraft, setWizardDraft };
}
