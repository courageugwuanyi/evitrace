export function validateHomeSearch(search: Record<string, unknown>) {
  return {
    tab: typeof search.tab === "string" ? search.tab : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
    action: typeof search.action === "string" ? search.action : undefined,
  };
}

export function homeRouteHead() {
  return {
    meta: [
      { title: "Evitrace - Engineering Competency & Promotion Tracking" },
      {
        name: "description",
        content:
          "Capture evidence of your work, map it to competencies, and close the gap to your next promotion.",
      },
      { property: "og:title", content: "Evitrace - Promotion Radar for Engineers" },
      {
        property: "og:description",
        content: "Track competency, evidence, and SMART objectives in one trusted workspace.",
      },
      { property: "og:type", content: "website" },
    ],
  };
}
