// src/lib/api/mappers.ts
// Pure data-layer functions — no React imports, no side effects.
// Translates between DB snake_case row types and camelCase UI types.

import type { Database } from '../database.types'

// ── DB Row type aliases ────────────────────────────────────────────────────────

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type EvidenceRow = Database['public']['Tables']['evidence']['Row']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type AssessmentRow = Database['public']['Tables']['assessments']['Row']
type CategoryRow = Database['public']['Tables']['assessment_categories']['Row']
type QuestionRow = Database['public']['Tables']['assessment_questions']['Row']
type FeedbackRow = Database['public']['Tables']['feedback']['Row']
type InboxRow = Database['public']['Tables']['inbox_events']['Row']
type SettingsRow = Database['public']['Tables']['user_settings']['Row']
// These are defined but used for documentation / future hooks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FrameworkRow = Database['public']['Tables']['competency_frameworks']['Row']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FrameworkCategoryRow = Database['public']['Tables']['competency_categories']['Row']

// ── Insert type aliases ────────────────────────────────────────────────────────

type EvidenceInsert = Database['public']['Tables']['evidence']['Insert']
type ObjectiveInsert = Database['public']['Tables']['objectives']['Insert']
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']
type CategoryInsert = Database['public']['Tables']['assessment_categories']['Insert']
type QuestionInsert = Database['public']['Tables']['assessment_questions']['Insert']

// ── UI types (matching index.tsx) ──────────────────────────────────────────────

export type AuthUser = {
  fullName: string
  email: string
  currentLevel: string
  targetLevel: string
  team: string
  manager: string
  managerEmail: string
  skipLevel?: string
  avatarUrl?: string
  jobTitle?: string
}

export type EvidenceStatus = 'Pending Review' | 'Reviewed'
export type EvidenceMatch = 'Yes' | 'No' | 'Somewhat' | 'Unset'

export type EvidenceRecord = {
  id: string
  date: string        // 'YYYY-MM-DD' format — no conversion needed
  source: string
  category: string
  competency: string
  title: string
  description: string
  link: string
  status: EvidenceStatus
  matchState: EvidenceMatch
  managerNotes: string
  linkageKey?: string
  isSample?: boolean
  isArchived: boolean
  archivedDate?: string
  createdAt: string   // for dashboard sorting
}

export type SuccessCriterion = {
  criteria: string
  evidence: string
  attachments?: { label: string; url: string }[]
  done?: boolean
}

export type Objective = {
  id: string
  title: string
  competency: string
  targetSubcategory?: string
  isSample?: boolean
  due: string
  status: 'Pending Approval' | 'In Progress' | 'Completed'
  statement?: string
  dateAuthored?: string
  isArchived?: boolean
  archivedDate?: string
  specific?: string
  measurable?: string
  achievable?: string
  relevant?: string
  timebound?: string
  links?: { label: string; url: string }[]
  notes?: string
  successCriteria?: {
    learn: SuccessCriterion[]
    demonstrate: SuccessCriterion[]
    share: SuccessCriterion[]
  }
}

export type AssessmentQuestion = {
  questionId: string
  questionText: string
  previousScore: number
  currentScore: number
  targetScore: number
  justification: string
  attachedEvidenceIds: string[]
}

export type AssessmentCategory = {
  categoryId: string
  categoryName: string
  summary: string
  categoryCurrentAvg: number
  categoryTarget: number
  questions: AssessmentQuestion[]
}

export type Assessment = {
  id: string
  dateCompleted: string   // ISO string
  reviewPeriod: string
  status: 'Finalized' | 'Draft' | 'In Review'
  engineerName: string
  managerName: string
  overallReadinessScore: number  // 0-100
  categories: AssessmentCategory[]
  oneOnOneTopics: string[]
}

export type ReviewQuestion = {
  prev: number
  next: number
  notes: string
  evidenceIds: string[]
}

export type ReviewSession = {
  id: string
  date: string
  period: string
  engineer: string
  manager: string
  scores: Record<string, Record<string, ReviewQuestion>>
}

export type FeedbackType = 'Manager Requested' | 'Ad-hoc' | 'Peer Review'
export type FeedbackItem = {
  id: string
  date: string
  provider: string
  type: FeedbackType
  notes: string
  anonymous: boolean
}

export type InboxItem = {
  id: string
  source: string
  icon: unknown        // React.ComponentType — derived client-side from source, NOT stored
  title: string
  suggestion: string[]
  when: string         // derived from created_at as relative time string
}

export type NotificationPrefs = {
  dailyReminder: boolean
  managerApprovals: boolean
  weeklyDigest: boolean
  browserPush: boolean
  extensionPromptTimes: string[]
  extensionSnoozeMinutes: number
  extensionWeekdaysOnly: boolean
  extensionTimezone: string
}

export type IntegrationPrefs = {
  autoCaptureEvents: boolean
  jira: boolean
  github: boolean
  bitbucket: boolean
  slack: boolean
  teams: boolean
  confluence: boolean
  notion: boolean
}

// ── Helper utilities ───────────────────────────────────────────────────────────

/**
 * Arithmetic mean of a number array, rounded to 2 decimal places.
 * Returns 0 for empty arrays.
 */
export function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2)
}

/**
 * Recomputes categoryCurrentAvg from questions and derives overallReadinessScore
 * as a 0–100 integer (mean score / 5 * 100).
 */
export function withDerivedAverages(a: Assessment): Assessment {
  const categories = a.categories.map((c) => ({
    ...c,
    categoryCurrentAvg: avg(c.questions.map((q) => q.currentScore)),
  }))
  const allScores = categories.flatMap((c) => c.questions.map((q) => q.currentScore))
  const overall = allScores.length === 0 ? 0 : Math.round((avg(allScores) / 5) * 100)
  return { ...a, categories, overallReadinessScore: overall }
}

/**
 * Converts a ReviewSession (wizard output) into a finalised Assessment.
 */
export function sessionToAssessment(s: ReviewSession): Assessment {
  const categories: AssessmentCategory[] = Object.entries(s.scores).map(([catName, subs], ci) => {
    const questions: AssessmentQuestion[] = Object.entries(subs).map(([sub, q], qi) => ({
      questionId: `q_${ci + 1}_${qi + 1}`,
      questionText: sub,
      previousScore: q.prev,
      currentScore: q.next,
      targetScore: 4,
      justification: q.notes,
      attachedEvidenceIds: q.evidenceIds,
    }))
    return {
      categoryId: `cat_${String(ci + 1).padStart(2, '0')}`,
      categoryName: catName,
      summary: '',
      categoryCurrentAvg: 0,
      categoryTarget: 4,
      questions,
    }
  })
  return withDerivedAverages({
    id: s.id,
    dateCompleted: new Date().toISOString(),
    reviewPeriod: s.period,
    status: 'Finalized',
    engineerName: s.engineer,
    managerName: s.manager,
    overallReadinessScore: 0,
    categories,
    oneOnOneTopics: [],
  })
}

/**
 * Converts a stored Assessment back to a ReviewSession for the review wizard.
 */
export function assessmentToSession(a: Assessment): ReviewSession {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(a.dateCompleted))
  const scores: Record<string, Record<string, ReviewQuestion>> = {}
  a.categories.forEach((c) => {
    scores[c.categoryName] = {}
    c.questions.forEach((q) => {
      scores[c.categoryName][q.questionText] = {
        prev: q.previousScore,
        next: q.currentScore,
        notes: q.justification,
        evidenceIds: q.attachedEvidenceIds,
      }
    })
  })
  return {
    id: a.id,
    date: formattedDate,
    period: a.reviewPeriod,
    engineer: a.engineerName,
    manager: a.managerName,
    scores,
  }
}

// ── Relative time formatter ────────────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3_600_000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(diff / 86_400_000)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

// ── Forward mappers (DB → UI) ──────────────────────────────────────────────────

/**
 * profiles row → AuthUser
 */
export function profileRowToAuthUser(row: ProfileRow): AuthUser {
  return {
    fullName: row.full_name,
    email: row.email,
    currentLevel: row.current_level,
    targetLevel: row.target_level,
    team: row.team,
    manager: row.manager,
    managerEmail: row.manager_email,
    ...(row.skip_level != null ? { skipLevel: row.skip_level } : {}),
    ...(row.avatar_url != null ? { avatarUrl: row.avatar_url } : {}),
    ...(row.job_title != null ? { jobTitle: row.job_title } : {}),
  }
}

/**
 * evidence row → EvidenceRecord
 * date field stays as-is (YYYY-MM-DD)
 */
export function evidenceRowToRecord(row: EvidenceRow): EvidenceRecord {
  const rawManagerNotes = row.manager_notes ?? ''
  const linkageMatch = rawManagerNotes.match(/\[auto-objective:[^\]]+\]/)
  const sampleMatch = rawManagerNotes.includes('[sample-content]')
  const managerNotes = rawManagerNotes
    .replace(/\[auto-objective:[^\]]+\]/g, '')
    .replace(/\[sample-content\]/g, '')
    .trim()

  return {
    id: row.id,
    date: row.date,
    source: row.source,
    category: row.category,
    competency: row.competency,
    title: row.title,
    description: row.description,
    link: row.link,
    status: row.status as EvidenceStatus,
    matchState: row.match_state as EvidenceMatch,
    managerNotes,
    ...(linkageMatch ? { linkageKey: linkageMatch[0] } : {}),
    ...(sampleMatch ? { isSample: true } : {}),
    isArchived: row.is_archived,
    ...(row.archived_date != null ? { archivedDate: row.archived_date } : {}),
    createdAt: row.created_at,
  }
}

/**
 * objectives row → Objective
 * Parses links and success_criteria JSONB fields.
 */
export function objectiveRowToObjective(row: ObjectiveRow): Objective {
  // Parse links JSONB → { label: string; url: string }[]
  let links: { label: string; url: string }[] | undefined
  if (Array.isArray(row.links) && row.links.length > 0) {
    links = (row.links as Array<{ label: string; url: string }>).map((l) => ({
      label: String(l.label ?? ''),
      url: String(l.url ?? ''),
    }))
  } else {
    links = []
  }

  // Parse success_criteria JSONB
  type RawSuccessCriteria = {
    targetSubcategory?: string
    sampleSeed?: boolean
    learn?: Array<{ criteria?: string; evidence?: string; attachments?: Array<{ label: string; url: string }>; done?: boolean }>
    demonstrate?: Array<{ criteria?: string; evidence?: string; attachments?: Array<{ label: string; url: string }>; done?: boolean }>
    share?: Array<{ criteria?: string; evidence?: string; attachments?: Array<{ label: string; url: string }>; done?: boolean }>
  }

  const parseSuccessCriterionArray = (
    arr: Array<{ criteria?: string; evidence?: string; attachments?: Array<{ label: string; url: string }>; done?: boolean }> | undefined
  ): SuccessCriterion[] => {
    if (!Array.isArray(arr)) return []
    return arr.map((item) => ({
      criteria: String(item.criteria ?? ''),
      evidence: String(item.evidence ?? ''),
      ...(item.attachments != null
        ? {
            attachments: item.attachments.map((a) => ({
              label: String(a.label ?? ''),
              url: String(a.url ?? ''),
            })),
          }
        : {}),
      ...(item.done != null ? { done: Boolean(item.done) } : {}),
    }))
  }

  let successCriteria:
    | {
        learn: SuccessCriterion[]
        demonstrate: SuccessCriterion[]
        share: SuccessCriterion[]
      }
    | undefined

  const sc = row.success_criteria
  if (
    sc != null &&
    typeof sc === 'object' &&
    !Array.isArray(sc) &&
    (Object.keys(sc).length > 0)
  ) {
    const raw = sc as RawSuccessCriteria
    successCriteria = {
      learn: parseSuccessCriterionArray(raw.learn),
      demonstrate: parseSuccessCriterionArray(raw.demonstrate),
      share: parseSuccessCriterionArray(raw.share),
    }
  } else {
    successCriteria = { learn: [], demonstrate: [], share: [] }
  }

  return {
    id: row.id,
    title: row.title,
    competency: row.competency,
    due: row.due,
    status: row.status as Objective['status'],
    ...(row.statement != null ? { statement: row.statement } : {}),
    ...(row.date_authored != null ? { dateAuthored: row.date_authored } : {}),
    isArchived: row.is_archived,
    ...(row.archived_date != null ? { archivedDate: row.archived_date } : {}),
    ...(row.specific != null ? { specific: row.specific } : {}),
    ...(row.measurable != null ? { measurable: row.measurable } : {}),
    ...(row.achievable != null ? { achievable: row.achievable } : {}),
    ...(row.relevant != null ? { relevant: row.relevant } : {}),
    ...(row.timebound != null ? { timebound: row.timebound } : {}),
    ...(typeof (row.success_criteria as RawSuccessCriteria | null)?.targetSubcategory === 'string'
      ? { targetSubcategory: String((row.success_criteria as RawSuccessCriteria).targetSubcategory) }
      : {}),
    ...(Boolean((row.success_criteria as RawSuccessCriteria | null)?.sampleSeed) ? { isSample: true } : {}),
    links,
    ...(row.notes != null ? { notes: row.notes } : {}),
    successCriteria,
  }
}

/**
 * Builds nested Assessment from flat DB rows.
 * Calls withDerivedAverages() to enforce the avg invariant.
 */
export function assessmentRowsToAssessment(
  assessment: AssessmentRow,
  categories: CategoryRow[],
  questions: QuestionRow[]
): Assessment {
  const mappedCategories: AssessmentCategory[] = categories.map((cat) => {
    const catQuestions = questions
      .filter((q) => q.category_id === cat.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({
        questionId: q.question_id,
        questionText: q.question_text,
        previousScore: q.previous_score,
        currentScore: q.current_score,
        targetScore: q.target_score,
        justification: q.justification,
        attachedEvidenceIds: q.attached_evidence_ids,
      }))
    return {
      categoryId: cat.category_id,
      categoryName: cat.category_name,
      summary: cat.summary,
      categoryCurrentAvg: cat.category_current_avg,
      categoryTarget: cat.category_target,
      questions: catQuestions,
    }
  })

  const raw: Assessment = {
    id: assessment.id,
    dateCompleted: assessment.date_completed,
    reviewPeriod: assessment.review_period,
    status: assessment.status as Assessment['status'],
    engineerName: assessment.engineer_name,
    managerName: assessment.manager_name,
    overallReadinessScore: assessment.overall_readiness_score,
    categories: mappedCategories,
    oneOnOneTopics: Array.isArray(assessment.one_on_one_topics)
      ? (assessment.one_on_one_topics as string[])
      : [],
  }

  return withDerivedAverages(raw)
}

/**
 * feedback row → FeedbackItem
 */
export function feedbackRowToItem(row: FeedbackRow): FeedbackItem {
  return {
    id: row.id,
    date: row.date,
    provider: row.provider,
    type: row.type as FeedbackType,
    notes: row.notes,
    anonymous: row.anonymous,
  }
}

/**
 * inbox_events row → InboxItem
 * icon is set to null (derived client-side from source at render time)
 * when is derived from created_at as a relative time string
 */
export function inboxRowToItem(row: InboxRow): InboxItem {
  return {
    id: row.id,
    source: row.source,
    icon: null,
    title: row.title,
    suggestion: row.suggestion,
    when: relativeTime(row.created_at),
  }
}

/**
 * user_settings row → { notifications: NotificationPrefs; integrations: IntegrationPrefs }
 * Falls back to safe defaults for any missing keys.
 */
export function settingsRowToSettings(
  row: SettingsRow
): { notifications: NotificationPrefs; integrations: IntegrationPrefs } {
  const defaultNotifications: NotificationPrefs = {
    dailyReminder: true,
    managerApprovals: true,
    weeklyDigest: false,
    browserPush: true,
    extensionPromptTimes: ['16:00'],
    extensionSnoozeMinutes: 15,
    extensionWeekdaysOnly: true,
    extensionTimezone: 'GMT',
  }

  const defaultIntegrations: IntegrationPrefs = {
    autoCaptureEvents: true,
    jira: true,
    github: true,
    bitbucket: false,
    slack: false,
    teams: false,
    confluence: false,
    notion: false,
  }

  const rawN = (
    row.notifications != null && typeof row.notifications === 'object' && !Array.isArray(row.notifications)
      ? row.notifications
      : {}
  ) as Record<string, unknown>

  const rawI = (
    row.integrations != null && typeof row.integrations === 'object' && !Array.isArray(row.integrations)
      ? row.integrations
      : {}
  ) as Record<string, unknown>

  const notifications: NotificationPrefs = {
    dailyReminder: typeof rawN.dailyReminder === 'boolean' ? rawN.dailyReminder : defaultNotifications.dailyReminder,
    managerApprovals: typeof rawN.managerApprovals === 'boolean' ? rawN.managerApprovals : defaultNotifications.managerApprovals,
    weeklyDigest: typeof rawN.weeklyDigest === 'boolean' ? rawN.weeklyDigest : defaultNotifications.weeklyDigest,
    browserPush: typeof rawN.browserPush === 'boolean' ? rawN.browserPush : defaultNotifications.browserPush,
    extensionPromptTimes:
      Array.isArray(rawN.extensionPromptTimes) &&
      rawN.extensionPromptTimes.every((v) => typeof v === 'string')
        ? (rawN.extensionPromptTimes as string[])
        : defaultNotifications.extensionPromptTimes,
    extensionSnoozeMinutes:
      typeof rawN.extensionSnoozeMinutes === 'number' && Number.isFinite(rawN.extensionSnoozeMinutes)
        ? Math.max(1, Math.round(rawN.extensionSnoozeMinutes))
        : defaultNotifications.extensionSnoozeMinutes,
    extensionWeekdaysOnly:
      typeof rawN.extensionWeekdaysOnly === 'boolean'
        ? rawN.extensionWeekdaysOnly
        : defaultNotifications.extensionWeekdaysOnly,
    extensionTimezone:
      typeof rawN.extensionTimezone === 'string' && rawN.extensionTimezone.trim().length > 0
        ? rawN.extensionTimezone
        : defaultNotifications.extensionTimezone,
  }

  const integrations: IntegrationPrefs = {
    autoCaptureEvents: typeof rawI.autoCaptureEvents === 'boolean' ? rawI.autoCaptureEvents : defaultIntegrations.autoCaptureEvents,
    jira: typeof rawI.jira === 'boolean' ? rawI.jira : defaultIntegrations.jira,
    github: typeof rawI.github === 'boolean' ? rawI.github : defaultIntegrations.github,
    bitbucket: typeof rawI.bitbucket === 'boolean' ? rawI.bitbucket : defaultIntegrations.bitbucket,
    slack: typeof rawI.slack === 'boolean' ? rawI.slack : defaultIntegrations.slack,
    teams: typeof rawI.teams === 'boolean' ? rawI.teams : defaultIntegrations.teams,
    confluence: typeof rawI.confluence === 'boolean' ? rawI.confluence : defaultIntegrations.confluence,
    notion: typeof rawI.notion === 'boolean' ? rawI.notion : defaultIntegrations.notion,
  }

  return { notifications, integrations }
}

// ── Inverse mappers (UI → DB) ──────────────────────────────────────────────────

/**
 * EvidenceRecord → evidence Insert
 * Omits createdAt/updatedAt (DB-generated).
 */
export function evidenceRecordToRow(r: EvidenceRecord, userId: string): EvidenceInsert {
  const metadata = [r.linkageKey, r.isSample ? '[sample-content]' : null].filter(Boolean).join(' ')
  const managerNotes = [metadata, r.managerNotes?.trim() ?? ''].filter(Boolean).join(' ').trim()
  return {
    id: r.id,
    user_id: userId,
    date: r.date,
    source: r.source,
    category: r.category,
    competency: r.competency,
    title: r.title,
    description: r.description,
    link: r.link,
    status: r.status,
    match_state: r.matchState,
    manager_notes: managerNotes,
    is_archived: r.isArchived,
    ...(r.archivedDate != null ? { archived_date: r.archivedDate } : { archived_date: null }),
  }
}

/**
 * Objective → objectives Insert
 * Serializes links and successCriteria back to JSONB-compatible plain objects.
 */
export function objectiveToRow(o: Objective, userId: string): ObjectiveInsert {
  const existingCriteria = o.successCriteria ?? { learn: [], demonstrate: [], share: [] }
  return {
    id: o.id,
    user_id: userId,
    title: o.title,
    competency: o.competency,
    due: o.due,
    status: o.status,
    statement: o.statement ?? null,
    date_authored: o.dateAuthored ?? null,
    is_archived: o.isArchived ?? false,
    archived_date: o.archivedDate ?? null,
    specific: o.specific ?? null,
    measurable: o.measurable ?? null,
    achievable: o.achievable ?? null,
    relevant: o.relevant ?? null,
    timebound: o.timebound ?? null,
    links: (o.links ?? []) as unknown as ObjectiveInsert['links'],
    notes: o.notes ?? null,
    success_criteria: {
      ...existingCriteria,
      ...(o.targetSubcategory ? { targetSubcategory: o.targetSubcategory } : {}),
    } as unknown as ObjectiveInsert['success_criteria'],
  }
}

/**
 * Assessment → flat rows for bulk insert.
 * Generates UUIDs per category so questions reference the right category_id.
 */
export function assessmentToRows(
  a: Assessment,
  userId: string
): { assessment: AssessmentInsert; categories: CategoryInsert[]; questions: QuestionInsert[] } {
  const assessmentInsert: AssessmentInsert = {
    id: a.id,
    user_id: userId,
    date_completed: a.dateCompleted,
    review_period: a.reviewPeriod,
    status: a.status,
    engineer_name: a.engineerName,
    manager_name: a.managerName,
    overall_readiness_score: a.overallReadinessScore,
    one_on_one_topics: a.oneOnOneTopics as unknown as AssessmentInsert['one_on_one_topics'],
  }

  const categoryInserts: CategoryInsert[] = []
  const questionInserts: QuestionInsert[] = []

  a.categories.forEach((cat, ci) => {
    // Generate a stable UUID per category for the insert batch
    const catUuid = crypto.randomUUID()
    const catAvg = avg(cat.questions.map((q) => q.currentScore))

    categoryInserts.push({
      id: catUuid,
      assessment_id: a.id,
      user_id: userId,
      category_id: cat.categoryId,
      category_name: cat.categoryName,
      summary: cat.summary,
      category_current_avg: catAvg,
      category_target: cat.categoryTarget,
      sort_order: ci,
    })

    cat.questions.forEach((q, qi) => {
      questionInserts.push({
        category_id: catUuid,
        assessment_id: a.id,
        user_id: userId,
        question_id: q.questionId,
        question_text: q.questionText,
        previous_score: q.previousScore,
        current_score: q.currentScore,
        target_score: q.targetScore,
        justification: q.justification,
        attached_evidence_ids: q.attachedEvidenceIds,
        sort_order: qi,
      })
    })
  })

  return {
    assessment: assessmentInsert,
    categories: categoryInserts,
    questions: questionInserts,
  }
}
