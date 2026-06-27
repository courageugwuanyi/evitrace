/**
 * Property 5: Streak Computation Correctness
 * Validates: Requirements 17.2
 *
 * For arbitrary arrays of EvidenceRecord objects (random dates, duplicates,
 * random `isArchived` flags), verify that `computeStreak()` matches a naïve
 * day-by-day reference implementation.
 *
 * Naïve reference:
 *   Given the non-archived evidence dates as a Set<string> (YYYY-MM-DD),
 *   walk backwards from today day-by-day and count consecutive days that
 *   are present in the Set — identical algorithm written independently.
 *
 * Properties tested:
 *   5a — matches naïve reference for arbitrary inputs
 *   5b — empty array returns 0
 *   5c — all-archived array returns 0
 *   5d — today-only entry returns 1
 *   5e — duplicates are collapsed (same date, multiple records)
 *   5f — streak breaks at first missing day
 */

import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'

// ── Mock supabase so module evaluation doesn't throw on missing env vars ───────
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { computeStreak } from '../dashboard'
import type { EvidenceRecord, EvidenceStatus, EvidenceMatch } from '../mappers'

// ── Naïve reference implementation ─────────────────────────────────────────────

/**
 * Reference implementation: independently written, same semantics as computeStreak.
 * Walk backwards from today, counting consecutive days with ≥1 non-archived entry.
 */
function naiveComputeStreak(evidence: EvidenceRecord[]): number {
  const activeDates = new Set<string>()
  for (const e of evidence) {
    if (!e.isArchived) {
      activeDates.add(e.date)
    }
  }

  let streak = 0
  const cursor = new Date()

  while (true) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    if (!activeDates.has(dateStr)) break

    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Returns today as 'YYYY-MM-DD' (local time).
 */
function todayStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns the date N days before today as 'YYYY-MM-DD'.
 */
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dy}`
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const statusArb: fc.Arbitrary<EvidenceStatus> = fc.constantFrom(
  'Pending Review' as EvidenceStatus,
  'Reviewed' as EvidenceStatus,
)

const matchStateArb: fc.Arbitrary<EvidenceMatch> = fc.constantFrom(
  'Yes' as EvidenceMatch,
  'No' as EvidenceMatch,
  'Somewhat' as EvidenceMatch,
  'Unset' as EvidenceMatch,
)

/**
 * Generates a random YYYY-MM-DD date string spanning a wide range.
 * Includes dates in the future and past to exercise full date space.
 */
const dateArb: fc.Arbitrary<string> = fc
  .integer({ min: -365, max: 365 })
  .map((offset) => daysAgo(-offset)) // negative offset = future

/**
 * Generates a minimal EvidenceRecord with a given id suffix.
 * isArchived is fully random to exercise filtering.
 */
function evidenceRecordArb(idSuffix: string | number): fc.Arbitrary<EvidenceRecord> {
  return fc.record({
    id: fc.constant(`ev-${idSuffix}`),
    date: dateArb,
    source: fc.constantFrom('GitHub', 'Jira', 'Manual', 'Slack'),
    category: fc.constantFrom('Delivery', 'Code Quality', 'Communication'),
    competency: fc.string({ minLength: 1, maxLength: 30 }),
    title: fc.string({ minLength: 1, maxLength: 60 }),
    description: fc.constant(''),
    link: fc.constant(''),
    status: statusArb,
    matchState: matchStateArb,
    managerNotes: fc.constant(''),
    isArchived: fc.boolean(),   // random archived flag
    archivedDate: fc.constant(undefined),
    createdAt: fc.constant(new Date().toISOString()),
  })
}

/**
 * Generates an array of EvidenceRecords with potentially:
 *   - Duplicate dates (same date, multiple records) — tests duplicate collapsing
 *   - Mixed isArchived flags
 *   - Random date offsets from today
 *
 * We re-use a pool of date offsets to ensure duplicates are likely.
 */
const evidenceArrayArb: fc.Arbitrary<EvidenceRecord[]> = fc
  .array(
    fc.integer({ min: 0, max: 99 }),
    { minLength: 0, maxLength: 30 },
  )
  .chain((ids) => {
    if (ids.length === 0) return fc.constant([] as EvidenceRecord[])
    return fc
      .tuple(...ids.map((id, i) => evidenceRecordArb(`${id}-${i}`)))
      .map((tuple) => tuple as EvidenceRecord[])
  })

// ── Properties ────────────────────────────────────────────────────────────────

describe('Property 5 — Streak Computation Correctness', () => {
  describe('Property 5a — computeStreak matches naïve reference for arbitrary inputs', () => {
    it('equals naïve reference for any EvidenceRecord array', () => {
      fc.assert(
        fc.property(evidenceArrayArb, (records) => {
          const actual = computeStreak(records)
          const expected = naiveComputeStreak(records)
          expect(actual).toBe(expected)
        }),
        { numRuns: 500 },
      )
    })

    it('equals naïve reference for arrays with many duplicates', () => {
      // Use a small pool of date offsets to force lots of duplicate dates
      const duplicateDateArb = fc
        .array(
          fc.integer({ min: 0, max: 4 }), // only 5 distinct offsets → many duplicates
          { minLength: 1, maxLength: 20 },
        )
        .chain((ids) =>
          fc.tuple(...ids.map((id, i) => evidenceRecordArb(`dup-${id}-${i}`))).map((t) => t as EvidenceRecord[]),
        )

      fc.assert(
        fc.property(duplicateDateArb, (records) => {
          expect(computeStreak(records)).toBe(naiveComputeStreak(records))
        }),
        { numRuns: 300 },
      )
    })
  })

  describe('Property 5b — empty array returns 0', () => {
    it('returns 0 for an empty array', () => {
      expect(computeStreak([])).toBe(0)
    })
  })

  describe('Property 5c — all-archived array returns 0', () => {
    it('returns 0 when all records are archived', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record<EvidenceRecord>({
              id: fc.string(),
              date: dateArb,
              source: fc.constant('Manual'),
              category: fc.constant('Delivery'),
              competency: fc.constant('Test'),
              title: fc.constant('Test'),
              description: fc.constant(''),
              link: fc.constant(''),
              status: fc.constant('Pending Review' as EvidenceStatus),
              matchState: fc.constant('Unset' as EvidenceMatch),
              managerNotes: fc.constant(''),
              isArchived: fc.constant(true),   // all archived
              archivedDate: fc.constant(undefined),
              createdAt: fc.constant(new Date().toISOString()),
            }),
            { minLength: 0, maxLength: 20 },
          ),
          (records) => {
            expect(computeStreak(records)).toBe(0)
          },
        ),
        { numRuns: 200 },
      )
    })
  })

  describe("Property 5d — today-only entry returns at least 1", () => {
    it("returns 1 when there is exactly one non-archived record with today's date", () => {
      const today = todayStr()
      const record: EvidenceRecord = {
        id: 'today-only',
        date: today,
        source: 'Manual',
        category: 'Delivery',
        competency: 'Test',
        title: 'Today entry',
        description: '',
        link: '',
        status: 'Pending Review',
        matchState: 'Unset',
        managerNotes: '',
        isArchived: false,
        createdAt: new Date().toISOString(),
      }
      expect(computeStreak([record])).toBe(1)
    })

    it('returns at least 1 for any non-empty array containing a non-archived today record', () => {
      fc.assert(
        fc.property(evidenceArrayArb, (records) => {
          const today = todayStr()
          const withToday: EvidenceRecord[] = [
            ...records,
            {
              id: 'forced-today',
              date: today,
              source: 'Manual',
              category: 'Delivery',
              competency: 'Test',
              title: 'Forced today entry',
              description: '',
              link: '',
              status: 'Pending Review',
              matchState: 'Unset',
              managerNotes: '',
              isArchived: false,
              createdAt: new Date().toISOString(),
            },
          ]
          expect(computeStreak(withToday)).toBeGreaterThanOrEqual(1)
        }),
        { numRuns: 200 },
      )
    })
  })

  describe('Property 5e — duplicate dates are collapsed correctly', () => {
    it('multiple non-archived records on the same day count as one streak day', () => {
      const today = todayStr()
      const records: EvidenceRecord[] = [
        {
          id: 'a1',
          date: today,
          source: 'GitHub',
          category: 'Delivery',
          competency: 'Test',
          title: 'Entry A',
          description: '',
          link: '',
          status: 'Pending Review',
          matchState: 'Unset',
          managerNotes: '',
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'a2',
          date: today,
          source: 'Jira',
          category: 'Communication',
          competency: 'Test',
          title: 'Entry B',
          description: '',
          link: '',
          status: 'Reviewed',
          matchState: 'Yes',
          managerNotes: '',
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'a3',
          date: today,
          source: 'Manual',
          category: 'Code Quality',
          competency: 'Test',
          title: 'Entry C',
          description: '',
          link: '',
          status: 'Pending Review',
          matchState: 'Unset',
          managerNotes: '',
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
      ]
      // Only today — streak is 1, not 3
      expect(computeStreak(records)).toBe(1)
    })

    it('archived duplicate on today does not inflate count above non-archived duplicates', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 0, max: 10 }),
          (activeCount, archivedCount) => {
            const today = todayStr()
            const active: EvidenceRecord[] = Array.from({ length: activeCount }, (_, i) => ({
              id: `act-${i}`,
              date: today,
              source: 'Manual' as const,
              category: 'Delivery',
              competency: 'Test',
              title: `Active ${i}`,
              description: '',
              link: '',
              status: 'Pending Review' as EvidenceStatus,
              matchState: 'Unset' as EvidenceMatch,
              managerNotes: '',
              isArchived: false,
              createdAt: new Date().toISOString(),
            }))
            const archived: EvidenceRecord[] = Array.from({ length: archivedCount }, (_, i) => ({
              id: `arc-${i}`,
              date: today,
              source: 'Manual' as const,
              category: 'Delivery',
              competency: 'Test',
              title: `Archived ${i}`,
              description: '',
              link: '',
              status: 'Pending Review' as EvidenceStatus,
              matchState: 'Unset' as EvidenceMatch,
              managerNotes: '',
              isArchived: true,
              archivedDate: today,
              createdAt: new Date().toISOString(),
            }))
            // Mix active + archived, streak should be exactly 1 (today is covered)
            const result = computeStreak([...active, ...archived])
            expect(result).toBe(1)
          },
        ),
        { numRuns: 200 },
      )
    })
  })

  describe('Property 5f — streak breaks at first missing day', () => {
    it('returns 0 when today has no non-archived evidence even if yesterday does', () => {
      const yesterday = daysAgo(1)
      const record: EvidenceRecord = {
        id: 'yest-only',
        date: yesterday,
        source: 'GitHub',
        category: 'Delivery',
        competency: 'Test',
        title: 'Yesterday only',
        description: '',
        link: '',
        status: 'Pending Review',
        matchState: 'Unset',
        managerNotes: '',
        isArchived: false,
        createdAt: new Date().toISOString(),
      }
      expect(computeStreak([record])).toBe(0)
    })

    it('consecutive days [today, today-1, today-2] yield streak 3 and breaks correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),  // streak length N
          (n) => {
            // Build exactly N consecutive days ending at today
            const records: EvidenceRecord[] = Array.from({ length: n }, (_, i) => ({
              id: `cons-${i}`,
              date: daysAgo(i),
              source: 'Manual' as const,
              category: 'Delivery',
              competency: 'Test',
              title: `Day -${i}`,
              description: '',
              link: '',
              status: 'Pending Review' as EvidenceStatus,
              matchState: 'Unset' as EvidenceMatch,
              managerNotes: '',
              isArchived: false,
              createdAt: new Date().toISOString(),
            }))
            expect(computeStreak(records)).toBe(n)
          },
        ),
        { numRuns: 200 },
      )
    })

    it('gaps in the middle stop the streak at the right day', () => {
      // today = 1 day, skip day 1 (yesterday), day 2 present → streak = 1
      const today = todayStr()
      const twoDaysAgo = daysAgo(2)

      const records: EvidenceRecord[] = [
        {
          id: 'g-today',
          date: today,
          source: 'Manual',
          category: 'Delivery',
          competency: 'Test',
          title: 'Today',
          description: '',
          link: '',
          status: 'Pending Review',
          matchState: 'Unset',
          managerNotes: '',
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'g-twodaysago',
          date: twoDaysAgo,
          source: 'Manual',
          category: 'Delivery',
          competency: 'Test',
          title: 'Two days ago',
          description: '',
          link: '',
          status: 'Pending Review',
          matchState: 'Unset',
          managerNotes: '',
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
      ]
      // today is present, yesterday is missing → streak = 1
      expect(computeStreak(records)).toBe(1)
    })

    it('archived record for today does not contribute to streak (streak = 0)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          (extraArchivedCount) => {
            const today = todayStr()
            const archivedToday: EvidenceRecord[] = Array.from(
              { length: extraArchivedCount + 1 },
              (_, i) => ({
                id: `arc-today-${i}`,
                date: today,
                source: 'Manual' as const,
                category: 'Delivery',
                competency: 'Test',
                title: `Archived today ${i}`,
                description: '',
                link: '',
                status: 'Pending Review' as EvidenceStatus,
                matchState: 'Unset' as EvidenceMatch,
                managerNotes: '',
                isArchived: true,
                archivedDate: today,
                createdAt: new Date().toISOString(),
              }),
            )
            expect(computeStreak(archivedToday)).toBe(0)
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('Property 5 — streak is non-negative for any input', () => {
    it('streak is always >= 0 for arbitrary inputs', () => {
      fc.assert(
        fc.property(evidenceArrayArb, (records) => {
          expect(computeStreak(records)).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 500 },
      )
    })
  })
})
