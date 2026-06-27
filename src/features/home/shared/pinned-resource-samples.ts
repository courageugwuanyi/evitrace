export type PinnedResourceRow = {
  id: string;
  title: string;
  url: string | null;
  resource_type: "evidence" | "objective" | "generic";
  evidence_id: string | null;
  objective_id: string | null;
  workspace_id: string;
  pinned_by: string;
  created_at: string;
  isSample?: boolean;
};

export function buildSamplePinnedResources(workspaceId: string): PinnedResourceRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: `sample-pin-objective-${workspaceId}`,
      workspace_id: workspaceId,
      title: "Q3 Reliability OKR: 99.95% API Availability",
      url: "https://example.com/okr-reliability",
      resource_type: "objective",
      evidence_id: null,
      objective_id: null,
      pinned_by: workspaceId,
      created_at: now,
      isSample: true,
    },
    {
      id: `sample-pin-playbook-${workspaceId}`,
      workspace_id: workspaceId,
      title: "P1 Incident Response Playbook",
      url: "https://example.com/emergency-docs",
      resource_type: "generic",
      evidence_id: null,
      objective_id: null,
      pinned_by: workspaceId,
      created_at: now,
      isSample: true,
    },
    {
      id: `sample-pin-evidence-${workspaceId}`,
      workspace_id: workspaceId,
      title: "Milestone Evidence: Auth Migration Complete",
      url: "https://example.com/evidence-milestone",
      resource_type: "evidence",
      evidence_id: null,
      objective_id: null,
      pinned_by: workspaceId,
      created_at: now,
      isSample: true,
    },
  ];
}
