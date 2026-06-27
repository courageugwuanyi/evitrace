import { FileText, Github, MessageSquare } from "lucide-react";

export type RadarPoint = { competency: string; current: number; target: number };

export const initialRadar: RadarPoint[] = [
  { competency: "Analytical", current: 3.2, target: 4 },
  { competency: "System Design", current: 2.8, target: 4 },
  { competency: "Code Quality", current: 3.6, target: 4 },
  { competency: "Communication", current: 3.0, target: 4 },
  { competency: "Leadership", current: 2.4, target: 4 },
  { competency: "UX Eng", current: 2.6, target: 4 },
  { competency: "Security", current: 2.9, target: 4 },
  { competency: "Delivery", current: 3.4, target: 4 },
];

export type EvidenceStatus = "Pending Review" | "Reviewed";
export type EvidenceMatch = "Yes" | "No" | "Somewhat" | "Unset";

export type EvidenceRecord = {
  id: string;
  date: string;
  source: string;
  category: string;
  competency: string;
  title: string;
  description: string;
  link: string;
  status: EvidenceStatus;
  matchState: EvidenceMatch;
  managerNotes: string;
  linkageKey?: string;
  isSample?: boolean;
  isArchived: boolean;
  archivedDate?: string;
};

export const initialEvidence: EvidenceRecord[] = [
  {
    id: "EV-201",
    date: "Dec 02, 2026",
    source: "Bitbucket",
    category: "Technical",
    competency: "System Design",
    title: "Migrated billing service to event-driven model",
    description: "Designed Kafka topology and rollout plan; zero downtime cutover.",
    link: "bitbucket.org/acme/billing/pull-requests/482",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes:
      "Strong example of cross-team coordination. Tag this for the L4 architecture criterion in your packet.",
    isArchived: false,
  },
  {
    id: "EV-200",
    date: "Nov 28, 2026",
    source: "Jira",
    category: "Delivery",
    competency: "Delivery",
    title: "Shipped Q4 metering MVP",
    description: "Coordinated across 3 squads; delivered 4 days ahead of plan.",
    link: "acme.atlassian.net/AT-1422",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes:
      "Add a short note on the dependency-tracking spreadsheet you maintained week over week.",
    isArchived: false,
  },
  {
    id: "EV-199",
    date: "Nov 24, 2026",
    source: "Confluence",
    category: "Leadership",
    competency: "Communication",
    title: "Ran cross-team RFC review",
    description: "Facilitated 12-person review; consolidated 3 proposals into 1.",
    link: "acme.atlassian.net/wiki/spaces/ENG/RFC-Payments",
    status: "Pending Review",
    matchState: "Unset",
    managerNotes: "",
    isArchived: false,
  },
  {
    id: "EV-198",
    date: "Nov 19, 2026",
    source: "Slack",
    category: "Technical",
    competency: "Security",
    title: "Patched JWT validation edge case",
    description: "Identified and remediated token replay vector flagged in audit.",
    link: "slack.com/archives/sec/p17324",
    status: "Reviewed",
    matchState: "Somewhat",
    managerNotes:
      "Re-word the description to highlight the threat model and your remediation approach more explicitly.",
    isArchived: false,
  },
  {
    id: "EV-197",
    date: "Nov 11, 2026",
    source: "Bitbucket",
    category: "Technical",
    competency: "Code Quality",
    title: "Reduced p95 latency by 38%",
    description: "Profiled hot path, replaced N+1 query with batched loader.",
    link: "bitbucket.org/acme/api/pull-requests/612",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes: "",
    isArchived: false,
  },
];

export const initialInbox = [
  {
    id: "IN-1",
    source: "GitHub",
    icon: Github,
    title: "PR merged: feat/observability-traces",
    suggestion: ["System Design", "Code Quality"],
    when: "2h ago",
  },
  {
    id: "IN-2",
    source: "Jira",
    icon: FileText,
    title: "Story closed: AT-1488 SSO error recovery",
    suggestion: ["Delivery", "Communication"],
    when: "5h ago",
  },
  {
    id: "IN-3",
    source: "Slack",
    icon: MessageSquare,
    title: "Recognition from @priya in #eng-wins",
    suggestion: ["Leadership"],
    when: "Yesterday",
  },
];

export type SuccessCriterion = {
  criteria: string;
  evidence: string;
  attachments?: { label: string; url: string }[];
  done?: boolean;
};

export type Objective = {
  id: string;
  title: string;
  competency: string;
  targetSubcategory?: string;
  isSample?: boolean;
  due: string;
  status: "Pending Approval" | "In Progress" | "Completed";
  statement?: string;
  dateAuthored?: string;
  isArchived?: boolean;
  archivedDate?: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timebound?: string;
  links?: { label: string; url: string }[];
  notes?: string;
  successCriteria?: {
    learn: SuccessCriterion[];
    demonstrate: SuccessCriterion[];
    share: SuccessCriterion[];
  };
};

export const initialObjectives: Objective[] = [
  {
    id: "UX-01",
    title: "Better solve customer painpoints through UX fundamentals",
    competency: "Engineering for User Experience",
    due: "Dec 15, 2026",
    dateAuthored: "Sep 24, 2026",
    status: "In Progress",
    statement:
      "Enable myself to better solve the main painpoints of our customers efficiently by understanding UX Personas, the goals of good UX, how UX impacts customers, Design Systems, and UX knowledge.",
    specific:
      "Study UX Personas, goals of good UX, Design Systems, and ship 2 production features that apply these principles end-to-end.",
    measurable:
      "Document learnings for each of the 5 topics and produce 5 demonstration artifacts linked from this objective.",
    achievable: "Block 3 hours weekly; pair with a Senior on the Design System working group.",
    relevant: "Closes the UX Engineering gap required for L4 promotion.",
    timebound: "Complete by Dec 15, 2026",
    links: [
      { label: "GOALS of Good UX (research doc)", url: "https://lawsofux.com/" },
      { label: "Design System overview", url: "https://example.com/design-system" },
    ],
    notes: "Currently working through the Laws of UX video series; design system research next.",
    successCriteria: {
      learn: [
        {
          criteria: "Use online / written resources to learn about UX Personas",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn the goals of good UX",
          evidence: "Notes on Laws of UX + 4Cs of UX summary",
        },
        {
          criteria: "Learn how UX impacts customers",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn about Design Systems",
          evidence: "Internal design system documentation reviewed",
        },
      ],
      demonstrate: [
        {
          criteria: "Use design system components to maintain UI consistency across a full feature",
          evidence: "Link to merged PR",
        },
        {
          criteria: "Demonstrate understanding of UX Personas in a feature spec",
          evidence: "Link to PRD with persona mapping",
        },
        {
          criteria: "Implement a robust error handling / feedback system",
          evidence: "Link to error-state implementation",
        },
        {
          criteria: "Design intuitive API endpoints around what users are trying to accomplish",
          evidence: "Link to API design doc",
        },
      ],
      share: [
        {
          criteria: "5–10 slide deck of key points from the Learn section",
          evidence: "Link to slides",
        },
        {
          criteria: "Short (2–5 min) videos for each Learn criterion",
          evidence: "Link to videos",
        },
        {
          criteria: "Documentation for each Demonstrate criterion",
          evidence: "Link to docs",
        },
      ],
    },
  },
  {
    id: "TEST-02",
    title: "Increase confidence through rigorous testing strategies",
    competency: "Code Quality",
    due: "Jan 31, 2027",
    dateAuthored: "Jun 19, 2026",
    status: "In Progress",
    statement:
      "Increase my satisfaction in solutions I provide for customer needs by understanding and applying test strategies and methodologies for improved solutions.",
    specific:
      "Learn and apply unit, integration, system, functional, and performance testing across two production services.",
    measurable:
      "Raise unit-test coverage from 62% to 85% on the auth service; add integration + system test suites with CI gating.",
    achievable: "Pair with QA lead twice monthly; allocate Friday afternoons to test work.",
    relevant: "Quality is a core L4 capability and an active gap on my Radar.",
    timebound: "Complete by Jan 31, 2027",
    links: [
      {
        label: "Testing strategies overview",
        url: "https://martinfowler.com/articles/practical-test-pyramid.html",
      },
    ],
    successCriteria: {
      learn: [
        {
          criteria: "Learn about testing strategies",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn about testing methodologies",
          evidence: "Documented list of topics covered",
        },
      ],
      demonstrate: [
        {
          criteria: "Consistently writes meaningful, broad-scope unit tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Consistently writes meaningful integration tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Consistently writes meaningful system + functional tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Demonstrate understanding of white box and black box testing",
          evidence: "Worked example or doc",
        },
        {
          criteria: "Write automation for unit, integration, system, functional tests",
          evidence: "Link to CI pipeline",
        },
        {
          criteria: "Find security flaws using penetration testing techniques",
          evidence: "Link to write-up",
        },
        {
          criteria: "Perform or automate performance testing",
          evidence: "Link to performance suite",
        },
      ],
      share: [
        {
          criteria: "Slide deck of key points from the Learn section",
          evidence: "Link to slides",
        },
        {
          criteria: "Short videos for each Learn criterion",
          evidence: "Link to videos",
        },
        {
          criteria: "Documentation for each Demonstrate criterion",
          evidence: "Link to docs",
        },
      ],
    },
  },
  {
    id: "ARCH-04",
    title: "Lead a system design review for the search platform",
    competency: "System Design",
    due: "Jan 10, 2027",
    status: "Pending Approval",
  },
  {
    id: "LEAD-02",
    title: "Mentor two junior engineers through onboarding",
    competency: "Leadership",
    due: "Feb 28, 2027",
    status: "In Progress",
  },
  {
    id: "SEC-03",
    title: "Complete OWASP Top 10 certification",
    competency: "Security",
    due: "Oct 30, 2026",
    status: "Completed",
  },
];
