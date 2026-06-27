import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { SampleContentVisibility } from "@/features/home/settings/settings-ui";

const STORAGE_KEY = "evitrace.sampleContentVisibility";

const DEFAULT_SAMPLE_CONTENT_VISIBILITY: SampleContentVisibility = {
  dashboard: true,
  objectives: true,
  evidence: true,
  pinnedResources: true,
};

type UseHomeSampleContentVisibilityResult = {
  sampleContent: SampleContentVisibility;
  setSampleContent: Dispatch<SetStateAction<SampleContentVisibility>>;
};

export function useHomeSampleContentVisibility(): UseHomeSampleContentVisibilityResult {
  const [sampleContent, setSampleContent] = useState<SampleContentVisibility>(
    DEFAULT_SAMPLE_CONTENT_VISIBILITY,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<SampleContentVisibility>;
      setSampleContent((prev) => ({
        dashboard: parsed.dashboard ?? prev.dashboard,
        objectives: parsed.objectives ?? prev.objectives,
        evidence: parsed.evidence ?? prev.evidence,
        pinnedResources: parsed.pinnedResources ?? prev.pinnedResources,
      }));
    } catch {
      // ignore malformed persisted values
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleContent));
  }, [sampleContent]);

  return { sampleContent, setSampleContent };
}
