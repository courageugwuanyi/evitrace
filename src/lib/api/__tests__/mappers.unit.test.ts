/**
 * Unit tests for all mapper functions in src/lib/api/mappers.ts
 * Tests: 4.4 — representative DB rows, edge cases, null fields, empty JSONB
 */

import { describe, it, expect } from 'vitest'
import {
  avg,
  withDerivedAverages,
  profileRowToAuthUser,
  evidenceRowToRecord,
  objectiveRowToObjective,
  assessmentRowsToAssessment,
  feedbackRowToItem,
  inboxRowToItem,
  settingsRowToSettings,
  evidenceRecordToRow,
  objectiveToRow,
  assessmentToRows,
  type Assessment,
  type EvidenceRecord,
  type Objective,
} from '../mappers'

// ── avg() ─────────────────────────────────────────────────────────────────────

describe('avg()', () => {
  it('returns 0 for empty array', () => {
    expect(avg([])).toBe(0)
  })

  it('returns the single value for a one-element array', () => {
    expect(avg([3])).toBe(3)
  })

  it('computes correct mean for [1, 2, 3, 4, 5]', () => {
    expect(avg([1, 2, 3, 4, 5])).toBe(3)
  })

  it('rounds to 2 decimal places: [1, 2] → 1.5', () => {
    expect(avg([1, 2])).toBe(1.5)
  })

  it('rounds to 2 decimal places: [1, 1, 2] → 1.33', () => {
    expect(avg([1, 1, 2])).toBe(1.33)
  })
})

// ── withDerivedAverages() ─────────────────────────────────────────────────────

describe('withDerivedAverages()', () => {
  const makeAssessment = (scores: number[][]): Assessment => ({
    id: 'A-1',
    dateCompleted: '2026-01-01T00:00:00Z',
    reviewPeriod: 'Q1 2026',
    status: 'Finalized',
    engineerName: 'Eng',
    managerName: 'Mgr',
    overallReadinessScore: 0,
    categories: scores.map((catScores, ci) => ({
      categoryId: `cat_${ci}`,
      categoryName: `Category ${ci}`,
      summary: '',
      categoryCurrentAvg: 0,
      categoryTarget: 4,
      questions: catScores.map((s, qi) => ({
        questionId: `q_${qi}`,
        questionText: `Q${qi}`,
        previousScore: 1,
        currentScore: s,
        targetScore: 4,
        justification: '',
        attachedEvidenceIds: [],
      })),
    })),
    oneOnOneTopics: [],
  })

  it('sets categoryCurrentAvg to mean of currentScores', () => {
    const result = withDerivedAverages(makeAssessment([[3, 4, 5]]))
    expect(result.categories[0].categoryCurrentAvg).toBe(4)
  })

  it('sets overallReadinessScore from all question scores', () => {
    // All scores = 5: (5/5)*100 = 100
    const result = withDerivedAverages(makeAssessment([[5, 5]]))
    expect(result.overallReadinessScore).toBe(100)
  })

  it('returns 0 for overallReadinessScore when no questions', () => {
    const assessment: Assessment = {
      id: 'A-2',
      dateCompleted: '2026-01-01T00:00:00Z',
      reviewPeriod: 'Q1',
      status: 'Draft',
      engineerName: 'E',
      managerName: 'M',
      overallReadinessScore: 0,
      categories: [],
      oneOnOneTopics: [],
    }
    const result = withDerivedAverages(assessment)
    expect(result.overallReadinessScore).toBe(0)
  })

  it('handles multiple categories independently', () => {
    const result = withDerivedAverages(makeAssessment([[2, 4], [1, 3]]))
    expect(result.categories[0].categoryCurrentAvg).toBe(3)
    expect(result.categories[1].categoryCurrentAvg).toBe(2)
  })
})

// ── profileRowToAuthUser() ────────────────────────────────────────────────────

describe('profileRowToAuthUser()', () => {
  const baseRow = {
    id: 'uuid-1',
    full_name: 'Courage Ugwuanyi',
    email: 'courage@example.com',
    current_level: 'L3',
    target_level: 'L4',
    team: 'Payments Platform',
    manager: 'Jane Smith',
    manager_email: 'jane@example.com',
    skip_level: null,
    avatar_url: null,
    job_title: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  it('maps all required fields correctly', () => {
    const result = profileRowToAuthUser(baseRow)
    expect(result.fullName).toBe('Courage Ugwuanyi')
    expect(result.email).toBe('courage@example.com')
    expect(result.currentLevel).toBe('L3')
    expect(result.targetLevel).toBe('L4')
    expect(result.team).toBe('Payments Platform')
    expect(result.manager).toBe('Jane Smith')
    expect(result.managerEmail).toBe('jane@example.com')
  })

  it('omits optional fields when null', () => {
    const result = profileRowToAuthUser(baseRow)
    expect(result.skipLevel).toBeUndefined()
    expect(result.avatarUrl).toBeUndefined()
    expect(result.jobTitle).toBeUndefined()
  })

  it('includes optional fields when present', () => {
    const row = { ...baseRow, skip_level: 'Bob', avatar_url: 'https://x.com/a.png', job_title: 'SWE II' }
    const result = profileRowToAuthUser(row)
    expect(result.skipLevel).toBe('Bob')
    expect(result.avatarUrl).toBe('https://x.com/a.png')
    expect(result.jobTitle).toBe('SWE II')
  })

  it('does not include a password field', () => {
    const result = profileRowToAuthUser(baseRow)
    expect('password' in result).toBe(false)
  })
})

// ── evidenceRowToRecord() ────────────────────────────────────────────────────

describe('evidenceRowToRecord()', () => {
  const baseRow = {
    id: 'ev-001',
    user_id: 'user-1',
    date: '2026-06-15',
    source: 'GitHub',
    category: 'Engineering',
    competency: 'Code Quality',
    title: 'Refactored auth module',
    description: 'Big improvement',
    link: 'https://github.com/pr/1',
    status: 'Reviewed',
    match_state: 'Yes',
    manager_notes: 'Great work',
    is_archived: false,
    archived_date: null,
    created_at: '2026-06-15T10:00:00Z',
    updated_at: '2026-06-15T10:00:00Z',
  }

  it('maps snake_case to camelCase correctly', () => {
    const result = evidenceRowToRecord(baseRow)
    expect(result.id).toBe('ev-001')
    expect(result.date).toBe('2026-06-15')
    expect(result.matchState).toBe('Yes')
    expect(result.managerNotes).toBe('Great work')
    expect(result.isArchived).toBe(false)
    expect(result.createdAt).toBe('2026-06-15T10:00:00Z')
  })

  it('omits archivedDate when null', () => {
    const result = evidenceRowToRecord(baseRow)
    expect(result.archivedDate).toBeUndefined()
  })

  it('includes archivedDate when present', () => {
    const row = { ...baseRow, is_archived: true, archived_date: '2026-07-01' }
    const result = evidenceRowToRecord(row)
    expect(result.isArchived).toBe(true)
    expect(result.archivedDate).toBe('2026-07-01')
  })

  it('maps all status values correctly', () => {
    expect(evidenceRowToRecord({ ...baseRow, status: 'Pending Review' }).status).toBe('Pending Review')
    expect(evidenceRowToRecord({ ...baseRow, status: 'Reviewed' }).status).toBe('Reviewed')
  })

  it('maps all match_state values', () => {
    for (const ms of ['Yes', 'No', 'Somewhat', 'Unset']) {
      expect(evidenceRowToRecord({ ...baseRow, match_state: ms }).matchState).toBe(ms)
    }
  })
})

// ── objectiveRowToObjective() ─────────────────────────────────────────────────

describe('objectiveRowToObjective()', () => {
  const baseRow = {
    id: 'obj-1',
    user_id: 'user-1',
    title: 'Ship the thing',
    competency: 'Delivery',
    due: '2026-12-31',
    status: 'In Progress',
    statement: null,
    date_authored: null,
    specific: null,
    measurable: null,
    achievable: null,
    relevant: null,
    timebound: null,
    links: [] as unknown,
    notes: null,
    success_criteria: {} as unknown,
    is_archived: false,
    archived_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }

  it('maps required fields correctly', () => {
    const result = objectiveRowToObjective(baseRow as Parameters<typeof objectiveRowToObjective>[0])
    expect(result.id).toBe('obj-1')
    expect(result.title).toBe('Ship the thing')
    expect(result.competency).toBe('Delivery')
    expect(result.due).toBe('2026-12-31')
    expect(result.status).toBe('In Progress')
    expect(result.isArchived).toBe(false)
  })

  it('returns empty successCriteria for empty JSONB {}', () => {
    const result = objectiveRowToObjective(baseRow as Parameters<typeof objectiveRowToObjective>[0])
    expect(result.successCriteria).toEqual({ learn: [], demonstrate: [], share: [] })
  })

  it('parses non-empty links JSONB', () => {
    const row = {
      ...baseRow,
      links: [{ label: 'RFC', url: 'https://example.com/rfc' }],
    }
    const result = objectiveRowToObjective(row as Parameters<typeof objectiveRowToObjective>[0])
    expect(result.links).toEqual([{ label: 'RFC', url: 'https://example.com/rfc' }])
  })

  it('parses non-empty success_criteria JSONB', () => {
    const row = {
      ...baseRow,
      success_criteria: {
        learn: [{ criteria: 'Read RFC', evidence: 'Done' }],
        demonstrate: [],
        share: [],
      },
    }
    const result = objectiveRowToObjective(row as Parameters<typeof objectiveRowToObjective>[0])
    expect(result.successCriteria?.learn).toHaveLength(1)
    expect(result.successCriteria?.learn[0].criteria).toBe('Read RFC')
  })

  it('omits optional text fields when null', () => {
    const result = objectiveRowToObjective(baseRow as Parameters<typeof objectiveRowToObjective>[0])
    expect(result.statement).toBeUndefined()
    expect(result.dateAuthored).toBeUndefined()
    expect(result.specific).toBeUndefined()
    expect(result.notes).toBeUndefined()
  })
})

// ── assessmentRowsToAssessment() ──────────────────────────────────────────────

describe('assessmentRowsToAssessment()', () => {
  const catUuid = 'aaaa-0001'
  const assessmentRow = {
    id: 'REV-2026-Q1',
    user_id: 'user-1',
    date_completed: '2026-03-31T17:00:00Z',
    review_period: 'Q1 2026',
    status: 'Finalized',
    engineer_name: 'Courage Ugwuanyi',
    manager_name: 'Jane Smith',
    overall_readiness_score: 68,
    one_on_one_topics: ['Topic A', 'Topic B'] as unknown,
    created_at: '2026-03-31T17:00:00Z',
    updated_at: '2026-03-31T17:00:00Z',
  }

  const categoryRow = {
    id: catUuid,
    assessment_id: 'REV-2026-Q1',
    user_id: 'user-1',
    category_id: 'delivery',
    category_name: 'Delivery',
    summary: 'On-time delivery',
    category_current_avg: 0, // will be re-derived
    category_target: 4,
    sort_order: 0,
    created_at: '2026-03-31T17:00:00Z',
  }

  const questionRows = [
    {
      id: 'q-001',
      category_id: catUuid,
      assessment_id: 'REV-2026-Q1',
      user_id: 'user-1',
      question_id: 'del-1',
      question_text: 'Delivers on time',
      previous_score: 3,
      current_score: 4,
      target_score: 4,
      justification: 'Consistent',
      attached_evidence_ids: [],
      sort_order: 0,
      created_at: '2026-03-31T17:00:00Z',
    },
    {
      id: 'q-002',
      category_id: catUuid,
      assessment_id: 'REV-2026-Q1',
      user_id: 'user-1',
      question_id: 'del-2',
      question_text: 'Flags blockers early',
      previous_score: 2,
      current_score: 3,
      target_score: 4,
      justification: '',
      attached_evidence_ids: [],
      sort_order: 1,
      created_at: '2026-03-31T17:00:00Z',
    },
  ]

  it('maps assessment metadata correctly', () => {
    const result = assessmentRowsToAssessment(
      assessmentRow as Parameters<typeof assessmentRowsToAssessment>[0],
      [categoryRow] as Parameters<typeof assessmentRowsToAssessment>[1],
      questionRows as Parameters<typeof assessmentRowsToAssessment>[2],
    )
    expect(result.id).toBe('REV-2026-Q1')
    expect(result.reviewPeriod).toBe('Q1 2026')
    expect(result.engineerName).toBe('Courage Ugwuanyi')
    expect(result.managerName).toBe('Jane Smith')
    expect(result.status).toBe('Finalized')
    expect(result.oneOnOneTopics).toEqual(['Topic A', 'Topic B'])
  })

  it('assigns questions to correct category', () => {
    const result = assessmentRowsToAssessment(
      assessmentRow as Parameters<typeof assessmentRowsToAssessment>[0],
      [categoryRow] as Parameters<typeof assessmentRowsToAssessment>[1],
      questionRows as Parameters<typeof assessmentRowsToAssessment>[2],
    )
    expect(result.categories[0].questions).toHaveLength(2)
  })

  it('derives categoryCurrentAvg from questions (not stored value)', () => {
    const result = assessmentRowsToAssessment(
      assessmentRow as Parameters<typeof assessmentRowsToAssessment>[0],
      [categoryRow] as Parameters<typeof assessmentRowsToAssessment>[1],
      questionRows as Parameters<typeof assessmentRowsToAssessment>[2],
    )
    // scores are 4 and 3 → avg 3.5
    expect(result.categories[0].categoryCurrentAvg).toBe(3.5)
  })

  it('sorts questions by sort_order', () => {
    const reversed = [...questionRows].reverse()
    const result = assessmentRowsToAssessment(
      assessmentRow as Parameters<typeof assessmentRowsToAssessment>[0],
      [categoryRow] as Parameters<typeof assessmentRowsToAssessment>[1],
      reversed as Parameters<typeof assessmentRowsToAssessment>[2],
    )
    expect(result.categories[0].questions[0].questionText).toBe('Delivers on time')
  })
})

// ── feedbackRowToItem() ───────────────────────────────────────────────────────

describe('feedbackRowToItem()', () => {
  const row = {
    id: 'fb-1',
    user_id: 'user-1',
    date: '2026-06-01',
    provider: 'Jane Smith',
    type: 'Manager Requested',
    notes: 'Good performance',
    anonymous: false,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  }

  it('maps all fields correctly', () => {
    const result = feedbackRowToItem(row)
    expect(result.id).toBe('fb-1')
    expect(result.date).toBe('2026-06-01')
    expect(result.provider).toBe('Jane Smith')
    expect(result.type).toBe('Manager Requested')
    expect(result.notes).toBe('Good performance')
    expect(result.anonymous).toBe(false)
  })

  it('maps all valid type values', () => {
    for (const type of ['Manager Requested', 'Ad-hoc', 'Peer Review']) {
      expect(feedbackRowToItem({ ...row, type }).type).toBe(type)
    }
  })

  it('maps anonymous: true correctly', () => {
    const result = feedbackRowToItem({ ...row, anonymous: true })
    expect(result.anonymous).toBe(true)
  })
})

// ── inboxRowToItem() ──────────────────────────────────────────────────────────

describe('inboxRowToItem()', () => {
  const row = {
    id: 'in-1',
    user_id: 'user-1',
    source: 'GitHub',
    title: 'PR merged',
    suggestion: ['Code Quality', 'Delivery'],
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(), // 2 hours ago
  }

  it('maps id, source, title, suggestion', () => {
    const result = inboxRowToItem(row)
    expect(result.id).toBe('in-1')
    expect(result.source).toBe('GitHub')
    expect(result.title).toBe('PR merged')
    expect(result.suggestion).toEqual(['Code Quality', 'Delivery'])
  })

  it('sets icon to null (not stored)', () => {
    const result = inboxRowToItem(row)
    expect(result.icon).toBeNull()
  })

  it('derives when from created_at as a relative time string', () => {
    const result = inboxRowToItem(row)
    expect(result.when).toMatch(/ago|Yesterday|^\d+[mhd]/)
  })

  it('formats very recent events as minutes ago', () => {
    const recent = { ...row, created_at: new Date(Date.now() - 5 * 60_000).toISOString() }
    const result = inboxRowToItem(recent)
    expect(result.when).toMatch(/m ago/)
  })
})

// ── settingsRowToSettings() ───────────────────────────────────────────────────

describe('settingsRowToSettings()', () => {
  const fullRow = {
    id: 'set-1',
    user_id: 'user-1',
    notifications: {
      dailyReminder: false,
      managerApprovals: true,
      weeklyDigest: true,
      browserPush: false,
    },
    integrations: {
      autoCaptureEvents: true,
      jira: false,
      github: true,
      bitbucket: true,
      slack: false,
      teams: true,
      confluence: false,
      notion: true,
    },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }

  it('maps notification prefs correctly', () => {
    const { notifications } = settingsRowToSettings(fullRow)
    expect(notifications.dailyReminder).toBe(false)
    expect(notifications.managerApprovals).toBe(true)
    expect(notifications.weeklyDigest).toBe(true)
    expect(notifications.browserPush).toBe(false)
  })

  it('maps integration prefs correctly', () => {
    const { integrations } = settingsRowToSettings(fullRow)
    expect(integrations.jira).toBe(false)
    expect(integrations.github).toBe(true)
    expect(integrations.bitbucket).toBe(true)
    expect(integrations.notion).toBe(true)
  })

  it('falls back to defaults when notifications JSONB is null', () => {
    const row = { ...fullRow, notifications: null as unknown }
    const { notifications } = settingsRowToSettings(row as Parameters<typeof settingsRowToSettings>[0])
    expect(notifications.dailyReminder).toBe(true)
    expect(notifications.weeklyDigest).toBe(false)
  })

  it('falls back to defaults when integrations JSONB is null', () => {
    const row = { ...fullRow, integrations: null as unknown }
    const { integrations } = settingsRowToSettings(row as Parameters<typeof settingsRowToSettings>[0])
    expect(integrations.jira).toBe(true)
    expect(integrations.bitbucket).toBe(false)
  })
})

// ── evidenceRecordToRow() (inverse) ──────────────────────────────────────────

describe('evidenceRecordToRow()', () => {
  const record: EvidenceRecord = {
    id: 'ev-1',
    date: '2026-06-15',
    source: 'GitHub',
    category: 'Engineering',
    competency: 'Code Quality',
    title: 'Test title',
    description: 'Desc',
    link: 'https://example.com',
    status: 'Pending Review',
    matchState: 'Unset',
    managerNotes: '',
    isArchived: false,
    createdAt: '2026-06-15T10:00:00Z',
  }

  it('maps camelCase back to snake_case', () => {
    const row = evidenceRecordToRow(record, 'user-1')
    expect(row.user_id).toBe('user-1')
    expect(row.match_state).toBe('Unset')
    expect(row.manager_notes).toBe('')
    expect(row.is_archived).toBe(false)
  })

  it('sets archived_date to null when archivedDate is undefined', () => {
    const row = evidenceRecordToRow(record, 'user-1')
    expect(row.archived_date).toBeNull()
  })

  it('maps archivedDate when present', () => {
    const row = evidenceRecordToRow({ ...record, archivedDate: '2026-07-01' }, 'user-1')
    expect(row.archived_date).toBe('2026-07-01')
  })
})

// ── objectiveToRow() (inverse) ────────────────────────────────────────────────

describe('objectiveToRow()', () => {
  const objective: Objective = {
    id: 'obj-1',
    title: 'Ship it',
    competency: 'Delivery',
    due: '2026-12-31',
    status: 'In Progress',
    isArchived: false,
    links: [{ label: 'RFC', url: 'https://example.com' }],
    successCriteria: {
      learn: [{ criteria: 'Read', evidence: 'Done' }],
      demonstrate: [],
      share: [],
    },
  }

  it('maps required fields to snake_case', () => {
    const row = objectiveToRow(objective, 'user-1')
    expect(row.user_id).toBe('user-1')
    expect(row.title).toBe('Ship it')
    expect(row.is_archived).toBe(false)
  })

  it('serializes links as JSONB-compatible value', () => {
    const row = objectiveToRow(objective, 'user-1')
    expect(row.links).toEqual([{ label: 'RFC', url: 'https://example.com' }])
  })

  it('serializes successCriteria as JSONB-compatible value', () => {
    const row = objectiveToRow(objective, 'user-1')
    expect(row.success_criteria).toEqual({
      learn: [{ criteria: 'Read', evidence: 'Done' }],
      demonstrate: [],
      share: [],
    })
  })

  it('handles missing optional fields with null/defaults', () => {
    const minimal: Objective = {
      id: 'obj-2',
      title: 'Min',
      competency: 'Delivery',
      due: '2026-01-01',
      status: 'Pending Approval',
    }
    const row = objectiveToRow(minimal, 'user-1')
    expect(row.statement).toBeNull()
    expect(row.notes).toBeNull()
    expect(row.is_archived).toBe(false)
  })
})

// ── assessmentToRows() (inverse) ──────────────────────────────────────────────

describe('assessmentToRows()', () => {
  const assessment: Assessment = {
    id: 'REV-2026-Q2',
    dateCompleted: '2026-06-30T17:00:00Z',
    reviewPeriod: 'Q2 2026',
    status: 'Finalized',
    engineerName: 'Courage Ugwuanyi',
    managerName: 'Jane Smith',
    overallReadinessScore: 72,
    oneOnOneTopics: ['Discuss AWS cert'],
    categories: [
      {
        categoryId: 'delivery',
        categoryName: 'Delivery',
        summary: 'Delivers on time',
        categoryCurrentAvg: 4,
        categoryTarget: 4,
        questions: [
          {
            questionId: 'del-1',
            questionText: 'Delivers on time',
            previousScore: 3,
            currentScore: 4,
            targetScore: 4,
            justification: 'Consistent',
            attachedEvidenceIds: [],
          },
          {
            questionId: 'del-2',
            questionText: 'Flags blockers',
            previousScore: 3,
            currentScore: 4,
            targetScore: 4,
            justification: '',
            attachedEvidenceIds: [],
          },
        ],
      },
    ],
  }

  it('produces one assessments insert row', () => {
    const { assessment: aRow } = assessmentToRows(assessment, 'user-1')
    expect(aRow.id).toBe('REV-2026-Q2')
    expect(aRow.user_id).toBe('user-1')
    expect(aRow.engineer_name).toBe('Courage Ugwuanyi')
    expect(aRow.review_period).toBe('Q2 2026')
  })

  it('produces one categories insert row per category', () => {
    const { categories } = assessmentToRows(assessment, 'user-1')
    expect(categories).toHaveLength(1)
    expect(categories[0].category_name).toBe('Delivery')
    expect(categories[0].assessment_id).toBe('REV-2026-Q2')
  })

  it('produces one questions insert row per question', () => {
    const { questions } = assessmentToRows(assessment, 'user-1')
    expect(questions).toHaveLength(2)
    expect(questions[0].question_text).toBe('Delivers on time')
  })

  it('all question category_ids reference their parent category id', () => {
    const { categories, questions } = assessmentToRows(assessment, 'user-1')
    const catId = categories[0].id!
    for (const q of questions) {
      expect(q.category_id).toBe(catId)
    }
  })

  it('category_current_avg is computed from questions', () => {
    const { categories } = assessmentToRows(assessment, 'user-1')
    expect(categories[0].category_current_avg).toBe(4)
  })

  it('sort_order is set correctly on categories and questions', () => {
    const { categories, questions } = assessmentToRows(assessment, 'user-1')
    expect(categories[0].sort_order).toBe(0)
    expect(questions[0].sort_order).toBe(0)
    expect(questions[1].sort_order).toBe(1)
  })
})
