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

function mergeSampleContentVisibility(
  parsed: Partial<SampleContentVisibility>,
): SampleContentVisibility {
  return {
    dashboard: parsed.dashboard ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.dashboard,
    objectives: parsed.objectives ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.objectives,
    evidence: parsed.evidence ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.evidence,
    pinnedResources: parsed.pinnedResources ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.pinnedResources,
  };
}

function readPersistedSampleContentVisibility(): SampleContentVisibility {
  if (typeof window === "undefined") return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
  try {
    const parsed = JSON.parse(stored) as Partial<SampleContentVisibility>;
    return mergeSampleContentVisibility(parsed);
  } catch {
    return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
  }
}

export function useHomeSampleContentVisibility(): UseHomeSampleContentVisibilityResult {
  const [sampleContent, setSampleContentState] = useState<SampleContentVisibility>(
    readPersistedSampleContentVisibility,
  );

  const setSampleContent: Dispatch<SetStateAction<SampleContentVisibility>> = (next) => {
    setSampleContentState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
      }
      return resolved;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleContent));
  }, [sampleContent]);

  return { sampleContent, setSampleContent };
}
