// src/lib/api/dashboard.ts
// Dashboard stats hook — aggregates from cached evidence and objectives queries.
// No extra DB calls are made; all data is read from TanStack Query caches.

import { useMemo } from 'react'
import { useEvidenceQuery } from './evidence'
import { useObjectivesQuery } from './objectives'
import type { EvidenceRecord, Objective } from './mappers'

// ── Quarter helpers ────────────────────────────────────────────────────────────

/**
 * Returns the first day of the quarter that contains `date`, as a YYYY-MM-DD string.
 * Q1: Jan–Mar (months 0–2)
 * Q2: Apr–Jun (months 3–5)
 * Q3: Jul–Sep (months 6–8)
 * Q4: Oct–Dec (months 9–11)
 */
export function startOfQuarter(date: Date): string {
  const month = date.getMonth()
  const quarterStartMonth = Math.floor(month / 3) * 3
  const y = date.getFullYear()
  const m = String(quarterStartMonth + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

/**
 * Returns the last day of the quarter that contains `date`, as a YYYY-MM-DD string.
 */
export function endOfQuarter(date: Date): string {
  const month = date.getMonth()
  const quarterEndMonth = Math.floor(month / 3) * 3 + 2
  const y = date.getFullYear()
  // Last day of quarter: first day of the NEXT month minus one day
  const lastDay = new Date(y, quarterEndMonth + 1, 0)
  const m = String(lastDay.getMonth() + 1).padStart(2, '0')
  const d = String(lastDay.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── computeStreak ─────────────────────────────────────────────────────────────

/**
 * Counts consecutive calendar days from today backwards that each have at least
 * one non-archived evidence entry.
 *
 * - Day 0 = today; if today has no non-archived evidence, returns 0.
 * - Day 1 = yesterday; counted only if day 0 was also counted.
 * - Streak breaks as soon as a day has no non-archived evidence.
 *
 * @param evidence - Array of EvidenceRecord objects (may be unsorted, may contain archived items).
 * @returns number — the streak count (0 if today has no entries).
 */
export function computeStreak(evidence: EvidenceRecord[]): number {
  // Build a Set of date strings (YYYY-MM-DD) for non-archived entries
  const activeDates = new Set<string>()
  for (const e of evidence) {
    if (!e.isArchived) {
      activeDates.add(e.date)
    }
  }

  // Walk backwards from today, counting consecutive days with at least one entry
  let streak = 0
  const cursor = new Date()

  while (true) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    if (!activeDates.has(dateStr)) {
      break
    }
    streak++
    // Move to the previous calendar day
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// ── useDashboardStats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  evidenceThisQuarter: number
  streak: number
  pendingReviewCount: number
  recentEvidence: EvidenceRecord[]
  focusAreas: Objective[]
}

/**
 * Aggregates dashboard statistics from cached evidence and objectives queries.
 * Makes no additional DB calls — reads from the TanStack Query cache.
 *
 * @param userId - The authenticated user's ID.
 * @returns DashboardStats memoised on evidence and objectives data changes.
 */
export function useDashboardStats(userId: string): DashboardStats {
  const evidenceQuery = useEvidenceQuery(userId)
  const objectivesQuery = useObjectivesQuery(userId)

  return useMemo(() => {
    const evidence = evidenceQuery.data ?? []
    const objectives = objectivesQuery.data ?? []

    const now = new Date()
    const qStart = startOfQuarter(now)
    const qEnd = endOfQuarter(now)

    const evidenceThisQuarter = evidence.filter(
      (e) => !e.isArchived && e.date >= qStart && e.date <= qEnd,
    ).length

    const streak = computeStreak(evidence)

    const pendingReviewCount =
      evidence.filter((e) => !e.isArchived && e.status === 'Pending Review').length +
      objectives.filter((o) => !o.isArchived && o.status === 'Pending Approval').length

    const recentEvidence = evidence
      .filter((e) => !e.isArchived)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)

    const focusAreas = objectives.filter(
      (o) => !o.isArchived && o.status === 'In Progress',
    )

    return { evidenceThisQuarter, streak, pendingReviewCount, recentEvidence, focusAreas }
  }, [evidenceQuery.data, objectivesQuery.data])
}
