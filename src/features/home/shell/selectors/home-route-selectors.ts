import type { GlobalSearchResultItem } from "@/features/home/shell/home-route-contracts";
import type { KnowledgeHubItem } from "@/features/home/knowledge/knowledge";
import type { EvidenceRecord, Objective } from "@/features/home/shared/models";
import {
  buildSamplePinnedResources,
  type PinnedResourceRow,
} from "@/features/home/shared/pinned-resource-samples";

type HomeGlobalSearchResults = {
  objectives: GlobalSearchResultItem[];
  evidence: GlobalSearchResultItem[];
  knowledge: GlobalSearchResultItem[];
};

export function buildHomeGlobalSearchResults(args: {
  query: string;
  visibleObjectives: Objective[];
  visibleEvidence: EvidenceRecord[];
  knowledgeItems: KnowledgeHubItem[];
}): HomeGlobalSearchResults {
  const query = args.query.trim().toLowerCase();
  if (!query) {
    return {
      objectives: [],
      evidence: [],
      knowledge: [],
    };
  }

  const matches = (title: string, description: string) =>
    `${title} ${description}`.toLowerCase().includes(query);

  const objectives = args.visibleObjectives
    .filter((item) =>
      matches(
        item.title,
        item.statement ?? item.notes ?? item.specific ?? item.measurable ?? "",
      ),
    )
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.statement ?? item.notes ?? "Objective match",
      section: "objectives" as const,
    }));

  const evidence = args.visibleEvidence
    .filter((item) => matches(item.title, item.description))
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      section: "evidence" as const,
    }));

  const knowledge = args.knowledgeItems
    .filter((item) => matches(item.challenge, item.lesson))
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      title: item.challenge,
      description: item.lesson,
      section: "knowledge" as const,
    }));

  return { objectives, evidence, knowledge };
}

export function buildVisiblePinnedResources(args: {
  activeWorkspaceId: string;
  pinnedResources: PinnedResourceRow[];
  includeSamplePinnedResources: boolean;
}): PinnedResourceRow[] {
  if (!args.activeWorkspaceId) return args.pinnedResources;
  if (!args.includeSamplePinnedResources) return args.pinnedResources;

  const samples = buildSamplePinnedResources(args.activeWorkspaceId);
  return [...samples, ...args.pinnedResources];
}

export function buildPinnedResourceLookups(pinnedResources: PinnedResourceRow[]) {
  const pinnedObjectiveIdToPinId = new Map<string, string>();
  const pinnedEvidenceIdToPinId = new Map<string, string>();

  pinnedResources.forEach((pin) => {
    if (pin.resource_type === "objective" && pin.objective_id) {
      pinnedObjectiveIdToPinId.set(pin.objective_id, pin.id);
    }
    if (pin.resource_type === "evidence" && pin.evidence_id) {
      pinnedEvidenceIdToPinId.set(pin.evidence_id, pin.id);
    }
  });

  return {
    pinnedObjectiveIdToPinId,
    pinnedEvidenceIdToPinId,
    pinnedObjectiveIds: new Set(Array.from(pinnedObjectiveIdToPinId.keys())),
    pinnedEvidenceIds: new Set(Array.from(pinnedEvidenceIdToPinId.keys())),
  };
}
