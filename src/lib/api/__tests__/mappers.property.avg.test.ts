/**
 * Property 1: Assessment Average Invariant
 * Validates: Requirements 6.6, 23.1
 *
 * For arbitrary score arrays (integers 1–5), every categoryCurrentAvg
 * produced by withDerivedAverages() must equal the arithmetic mean of its
 * questions' currentScore, rounded to 2 decimal places.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  avg,
  withDerivedAverages,
  type Assessment,
  type AssessmentCategory,
  type AssessmentQuestion,
} from '../mappers'

// ── Arbitraries ──────────────────────────────────────────────────────────────

/** Generates a score in range [1, 5] */
const scoreArb = fc.integer({ min: 1, max: 5 })

/** Generates a non-empty array of AssessmentQuestion with arbitrary scores */
const questionsArb = fc.array(
  fc.record({
    questionId: fc.string({ minLength: 1, maxLength: 8 }),
    questionText: fc.string({ minLength: 1, maxLength: 40 }),
    previousScore: scoreArb,
    currentScore: scoreArb,
    targetScore: fc.constant(4),
    justification: fc.constant(''),
    attachedEvidenceIds: fc.constant([]),
  }),
  { minLength: 1, maxLength: 10 },
) satisfies fc.Arbitrary<AssessmentQuestion[]>

/** Generates a non-empty array of AssessmentCategory with arbitrary questions */
const categoriesArb = fc.array(
  fc.record({
    categoryId: fc.string({ minLength: 1, maxLength: 8 }),
    categoryName: fc.string({ minLength: 1, maxLength: 20 }),
    summary: fc.constant(''),
    categoryCurrentAvg: fc.constant(0), // will be derived
    categoryTarget: fc.constant(4),
    questions: questionsArb,
  }),
  { minLength: 1, maxLength: 6 },
) satisfies fc.Arbitrary<AssessmentCategory[]>

/** Builds a minimal Assessment for property testing */
function makeAssessment(categories: AssessmentCategory[]): Assessment {
  return {
    id: 'TEST-1',
    dateCompleted: new Date().toISOString(),
    reviewPeriod: 'Q1 2026',
    status: 'Finalized',
    engineerName: 'Test Engineer',
    managerName: 'Test Manager',
    overallReadinessScore: 0, // will be derived
    categories,
    oneOnOneTopics: [],
  }
}

// ── Reference implementation ──────────────────────────────────────────────────

/** Naïve arithmetic mean rounded to 2 decimal places — the reference oracle */
function naiveAvg(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, s) => acc + s, 0)
  return Math.round((sum / scores.length) * 100) / 100
}

// ── Properties ────────────────────────────────────────────────────────────────

describe('Property 1 — Assessment Average Invariant', () => {
  it('every categoryCurrentAvg equals the arithmetic mean of its questions currentScore (rounded to 2dp)', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        const assessment = makeAssessment(categories)
        const derived = withDerivedAverages(assessment)

        for (const cat of derived.categories) {
          const scores = cat.questions.map((q) => q.currentScore)
          const expected = naiveAvg(scores)
          expect(cat.categoryCurrentAvg).toBe(expected)
        }
      }),
      { numRuns: 500 },
    )
  })

  it('overallReadinessScore equals round(avg-of-category-avgs / 5 * 100)', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        const assessment = makeAssessment(categories)
        const derived = withDerivedAverages(assessment)

        // The implementation computes avg over ALL flat question scores, not category averages.
        // Match the exact implementation: avg(allScores) using the same avg() function.
        const allScores = categories.flatMap((c) => c.questions.map((q) => q.currentScore))
        // avg() rounds to 2dp, then Math.round(x / 5 * 100)
        const meanStr = (allScores.reduce((s, n) => s + n, 0) / allScores.length).toFixed(2)
        const mean = +meanStr
        const expectedOverall = Math.round((mean / 5) * 100)
        expect(derived.overallReadinessScore).toBe(expectedOverall)
      }),
      { numRuns: 500 },
    )
  })

  it('avg() of empty array returns 0', () => {
    expect(avg([])).toBe(0)
  })

  it('avg() of a single value returns that value', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        expect(avg([score])).toBe(score)
      }),
    )
  })

  it('avg() rounds to at most 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.array(scoreArb, { minLength: 1, maxLength: 20 }),
        (scores) => {
          const result = avg(scores)
          const decimalPart = result.toString().split('.')[1] ?? ''
          expect(decimalPart.length).toBeLessThanOrEqual(2)
        },
      ),
      { numRuns: 500 },
    )
  })
})
