/**
 * Property 6: Feedback Filter Correctness
 * Validates: Requirements 21.4
 *
 * For any array of `FeedbackItem` and any valid filter value (`'All' | FeedbackType`),
 * the filtered result contains exactly those items whose `type` matches the filter
 * (or all items when the filter is `'All'`).
 *
 * This property is tested against the pure filter function extracted from `FeedbackView`'s
 * `useMemo` pattern — no DOM or React rendering required.
 *
 * Property invariants:
 *   1. When filter is 'All', every item in the original array appears in the result.
 *   2. When filter is a specific FeedbackType, only items with that type appear.
 *   3. The result never contains items not in the original array (no fabrication).
 *   4. The result contains ALL matching items — none are dropped.
 *   5. Result length equals the count of items with the matching type (exactness).
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { FeedbackItem, FeedbackType } from '../mappers'

// ── The filter function under test ────────────────────────────────────────────
//
// This is the pure in-memory filter logic used inside FeedbackView's useMemo.
// We extract it here so we can test it as a standalone pure function.
// Requirement 21.4 states this filter SHALL remain client-side and in-memory.

type FeedbackFilter = 'All' | FeedbackType

function filterFeedbackItems(
  items: FeedbackItem[],
  filter: FeedbackFilter,
): FeedbackItem[] {
  if (filter === 'All') return items
  return items.filter((item) => item.type === filter)
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const feedbackTypeArb: fc.Arbitrary<FeedbackType> = fc.constantFrom(
  'Manager Requested' as FeedbackType,
  'Ad-hoc' as FeedbackType,
  'Peer Review' as FeedbackType,
)

const feedbackFilterArb: fc.Arbitrary<FeedbackFilter> = fc.oneof(
  fc.constant('All' as FeedbackFilter),
  feedbackTypeArb,
)

const uuidArb = fc
  .tuple(
    fc.hexaString({ minLength: 8, maxLength: 8 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 12, maxLength: 12 }),
  )
  .map(([a, b, c, d, e]) => `${a}-${b}-${c}-${d}-${e}`)

const dateArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') })
  .map(
    (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  )

/** Generates a realistic FeedbackItem with a given index suffix for uniqueness */
const feedbackItemArb = (idx: number): fc.Arbitrary<FeedbackItem> =>
  fc.record({
    id: fc.constant(`fb-${idx}`),
    date: dateArb,
    provider: fc.string({ minLength: 1, maxLength: 40 }),
    type: feedbackTypeArb,
    notes: fc.string({ maxLength: 200 }),
    anonymous: fc.boolean(),
  })

/**
 * Generates an array of FeedbackItems with unique sequential ids.
 * Includes empty array as possible input (minLength: 0).
 */
const feedbackArrayArb: fc.Arbitrary<FeedbackItem[]> = fc
  .array(fc.integer({ min: 0, max: 9999 }), { minLength: 0, maxLength: 20 })
  .chain((ids) =>
    ids.length === 0
      ? fc.constant([])
      : fc.tuple(...ids.map((id, i) => feedbackItemArb(id * 100 + i))).map((t) => t as FeedbackItem[]),
  )

// ── Properties ────────────────────────────────────────────────────────────────

describe('Property 6 — Feedback Filter Correctness', () => {
  /**
   * Property 6a: When filter is 'All', result equals the full input array.
   * No items are dropped and none are added.
   */
  it('filter "All" returns all items unchanged', () => {
    fc.assert(
      fc.property(feedbackArrayArb, (items) => {
        const result = filterFeedbackItems(items, 'All')
        expect(result).toEqual(items)
        expect(result.length).toBe(items.length)
      }),
      { numRuns: 300 },
    )
  })

  /**
   * Property 6b: When filter is a specific type, result contains ONLY items of that type.
   * No items of other types slip through.
   */
  it('specific type filter returns only items matching that type', () => {
    fc.assert(
      fc.property(feedbackArrayArb, feedbackTypeArb, (items, type) => {
        const result = filterFeedbackItems(items, type)
        // Every item in result must have the matching type
        for (const item of result) {
          expect(item.type).toBe(type)
        }
      }),
      { numRuns: 300 },
    )
  })

  /**
   * Property 6c: Result contains ALL matching items — none are silently dropped.
   * For every item in the input that matches the filter, it must appear in the result.
   */
  it('specific type filter includes every matching item from the input', () => {
    fc.assert(
      fc.property(feedbackArrayArb, feedbackTypeArb, (items, type) => {
        const result = filterFeedbackItems(items, type)
        const expectedIds = new Set(items.filter((i) => i.type === type).map((i) => i.id))
        const resultIds = new Set(result.map((i) => i.id))
        // Every expected id must be present in result
        for (const id of expectedIds) {
          expect(resultIds.has(id)).toBe(true)
        }
      }),
      { numRuns: 300 },
    )
  })

  /**
   * Property 6d: Result length equals the exact count of matching items.
   * Combines "no extras" and "no missing" into one count check.
   */
  it('result length equals the count of items matching the filter', () => {
    fc.assert(
      fc.property(feedbackArrayArb, feedbackFilterArb, (items, filter) => {
        const result = filterFeedbackItems(items, filter)
        const expectedCount =
          filter === 'All'
            ? items.length
            : items.filter((i) => i.type === filter).length
        expect(result.length).toBe(expectedCount)
      }),
      { numRuns: 400 },
    )
  })

  /**
   * Property 6e: Result contains no fabricated items — every item in the result
   * was present in the original input array (by id).
   */
  it('result never contains items not present in the original array', () => {
    fc.assert(
      fc.property(feedbackArrayArb, feedbackFilterArb, (items, filter) => {
        const result = filterFeedbackItems(items, filter)
        const inputIds = new Set(items.map((i) => i.id))
        for (const item of result) {
          expect(inputIds.has(item.id)).toBe(true)
        }
      }),
      { numRuns: 300 },
    )
  })

  /**
   * Property 6f: Filter is idempotent — applying the same filter twice produces
   * the same result as applying it once.
   */
  it('filter is idempotent — applying it twice yields the same result as once', () => {
    fc.assert(
      fc.property(feedbackArrayArb, feedbackFilterArb, (items, filter) => {
        const once = filterFeedbackItems(items, filter)
        const twice = filterFeedbackItems(once, filter)
        expect(twice).toEqual(once)
      }),
      { numRuns: 300 },
    )
  })

  /**
   * Property 6g: Empty input always produces empty output regardless of filter.
   * Edge case: no items to filter.
   */
  it('empty input always produces empty output for any filter', () => {
    fc.assert(
      fc.property(feedbackFilterArb, (filter) => {
        const result = filterFeedbackItems([], filter)
        expect(result).toEqual([])
        expect(result.length).toBe(0)
      }),
      { numRuns: 100 },
    )
  })
})
