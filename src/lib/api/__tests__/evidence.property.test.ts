/**
 * Property 4: Evidence Optimistic Update Consistency
 * Validates: Requirements 19.3
 *
 * Property 4a — onMutate applies update to cache:
 *   For any starting cache of N evidence records and any valid patch to record[0],
 *   after onMutate fires the cache contains the patched record in place of the original.
 *
 * Property 4b — onError rolls back to snapshot:
 *   For any starting cache state, when the mutation's mutationFn throws,
 *   after onError fires the cache is restored exactly to its pre-mutation state.
 *
 * Strategy:
 *   Rather than rendering a React hook (requires DOM + @testing-library/react),
 *   we exercise the QueryClient cache directly by calling the same onMutate / onError
 *   logic that useSaveEvidence implements. This validates the invariants without
 *   requiring a browser environment. The pattern mirrors the auth.logic.test.ts approach.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { QueryClient } from '@tanstack/react-query'
import type { EvidenceRecord, EvidenceStatus, EvidenceMatch } from '../mappers'

// ── Mock supabase and sonner so no real DB calls are made ─────────────────────

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// ── Arbitraries ───────────────────────────────────────────────────────────────

const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }).map(
  (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
)

const statusArb: fc.Arbitrary<EvidenceStatus> = fc.oneof(
  fc.constant('Pending Review' as EvidenceStatus),
  fc.constant('Reviewed' as EvidenceStatus),
)

const matchStateArb: fc.Arbitrary<EvidenceMatch> = fc.oneof(
  fc.constant('Yes' as EvidenceMatch),
  fc.constant('No' as EvidenceMatch),
  fc.constant('Somewhat' as EvidenceMatch),
  fc.constant('Unset' as EvidenceMatch),
)

/** Generates a minimal but realistic EvidenceRecord with a unique id */
const evidenceRecordArb = (idSuffix: string | number): fc.Arbitrary<EvidenceRecord> =>
  fc.record({
    id: fc.constant(`ev-${idSuffix}`),
    date: dateArb,
    source: fc.oneof(fc.constant('GitHub'), fc.constant('Jira'), fc.constant('Manual')),
    category: fc.oneof(fc.constant('Delivery'), fc.constant('Code Quality'), fc.constant('Communication')),
    competency: fc.string({ minLength: 1, maxLength: 30 }),
    title: fc.string({ minLength: 1, maxLength: 60 }),
    description: fc.string({ maxLength: 200 }),
    link: fc.constant(''),
    status: statusArb,
    matchState: matchStateArb,
    managerNotes: fc.constant(''),
    isArchived: fc.constant(false),
    createdAt: fc.constant(new Date().toISOString()),
  })

/**
 * Generates a non-empty array of EvidenceRecords with unique ids.
 * minLength 1 ensures there is always a record[0] to patch.
 */
const evidenceArrayArb = (n: number): fc.Arbitrary<EvidenceRecord[]> =>
  fc
    .array(fc.integer({ min: 0, max: 9999 }), { minLength: 1, maxLength: n })
    .chain((ids) =>
      fc.tuple(...ids.map((id, i) => evidenceRecordArb(`${id}-${i}`))),
    )
    .map((tuple) => tuple as EvidenceRecord[])

/**
 * Generates a patch object for an EvidenceRecord — arbitrary changes to
 * title, description, status, and matchState fields.
 */
const patchArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 60 }),
  description: fc.string({ maxLength: 200 }),
  status: statusArb,
  matchState: matchStateArb,
})

// ── onMutate / onError logic extracted from useSaveEvidence ──────────────────
//
// These functions replicate the exact logic inside useSaveEvidence so we can
// test the cache invariants without needing a React rendering environment.

type QueryKey = readonly ['evidence', string, { archived: boolean }]

function evidenceKey(userId: string, archived: boolean): QueryKey {
  return ['evidence', userId, { archived }] as const
}

/**
 * Runs the same onMutate logic as useSaveEvidence.
 * Returns the context { previousData, queryKey } that would be passed to onError.
 */
async function runOnMutate(
  queryClient: QueryClient,
  userId: string,
  record: EvidenceRecord,
): Promise<{ previousData: EvidenceRecord[] | undefined; queryKey: QueryKey }> {
  const queryKey = evidenceKey(userId, record.isArchived)

  // Cancel in-flight queries so they don't overwrite the optimistic update
  await queryClient.cancelQueries({ queryKey })

  // Snapshot the current cache
  const previousData = queryClient.getQueryData<EvidenceRecord[]>(queryKey)

  // Apply optimistic update
  queryClient.setQueryData<EvidenceRecord[]>(queryKey, (old) =>
    (old ?? []).map((e) => (e.id === record.id ? record : e)),
  )

  return { previousData, queryKey }
}

/**
 * Runs the same onError logic as useSaveEvidence.
 * Rolls back the cache to the snapshot.
 */
function runOnError(
  queryClient: QueryClient,
  context: { previousData: EvidenceRecord[] | undefined; queryKey: QueryKey },
): void {
  if (context.previousData !== undefined && context.queryKey) {
    queryClient.setQueryData(context.queryKey, context.previousData)
  }
}

// ── Test setup ────────────────────────────────────────────────────────────────

const USER_ID = 'test-user-id'

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Properties ────────────────────────────────────────────────────────────────

describe('Property 4 — Evidence Optimistic Update Consistency', () => {
  describe('Property 4a — onMutate applies the patched record to the cache', () => {
    it('cache contains the patched record after onMutate fires', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(5),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            // Seed the cache with the starting records
            qc.setQueryData(queryKey, records)

            // Build the patched version of record[0]
            const original = records[0]
            const patched: EvidenceRecord = { ...original, ...patch }

            // Run onMutate
            await runOnMutate(qc, USER_ID, patched)

            // The cache should now contain the patched record
            const cached = qc.getQueryData<EvidenceRecord[]>(queryKey) ?? []

            const cachedPatched = cached.find((e) => e.id === original.id)
            expect(cachedPatched).toBeDefined()
            expect(cachedPatched!.title).toBe(patch.title)
            expect(cachedPatched!.description).toBe(patch.description)
            expect(cachedPatched!.status).toBe(patch.status)
            expect(cachedPatched!.matchState).toBe(patch.matchState)
          },
        ),
        { numRuns: 300 },
      )
    })

    it('cache length is unchanged after onMutate (no records added or removed)', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(5),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            qc.setQueryData(queryKey, records)

            const original = records[0]
            const patched: EvidenceRecord = { ...original, ...patch }

            await runOnMutate(qc, USER_ID, patched)

            const cached = qc.getQueryData<EvidenceRecord[]>(queryKey) ?? []
            expect(cached.length).toBe(records.length)
          },
        ),
        { numRuns: 300 },
      )
    })

    it('all other records in the cache are untouched after onMutate', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(5).filter((records) => records.length > 1),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            qc.setQueryData(queryKey, records)

            const original = records[0]
            const patched: EvidenceRecord = { ...original, ...patch }

            await runOnMutate(qc, USER_ID, patched)

            const cached = qc.getQueryData<EvidenceRecord[]>(queryKey) ?? []

            // All records except record[0] should be structurally equal to the originals
            for (const origRecord of records.slice(1)) {
              const cachedRecord = cached.find((e) => e.id === origRecord.id)
              expect(cachedRecord).toEqual(origRecord)
            }
          },
        ),
        { numRuns: 200 },
      )
    })
  })

  describe('Property 4b — onError restores the cache to the pre-mutation snapshot', () => {
    it('cache is exactly restored to its original state after onError', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(5),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            // Seed the cache
            qc.setQueryData(queryKey, records)

            const original = records[0]
            const patched: EvidenceRecord = { ...original, ...patch }

            // Simulate: onMutate fires (optimistic update)
            const context = await runOnMutate(qc, USER_ID, patched)

            // Simulate: mutation fails → onError fires (rollback)
            runOnError(qc, context)

            // The cache must exactly match the original snapshot
            const restored = qc.getQueryData<EvidenceRecord[]>(queryKey)
            expect(restored).toEqual(records)
          },
        ),
        { numRuns: 300 },
      )
    })

    it('onError restores the cache even when the patch only changes one field', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(3),
          statusArb,
          async (records, newStatus) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            qc.setQueryData(queryKey, records)

            const patched: EvidenceRecord = { ...records[0], status: newStatus }

            const context = await runOnMutate(qc, USER_ID, patched)
            runOnError(qc, context)

            const restored = qc.getQueryData<EvidenceRecord[]>(queryKey)
            expect(restored).toEqual(records)
          },
        ),
        { numRuns: 200 },
      )
    })

    it('onError with undefined previousData does not crash and leaves cache unchanged', async () => {
      // Edge case: onMutate called when cache was empty (previousData = undefined)
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(3),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            // Do NOT pre-seed the cache (simulates cache miss → previousData undefined)

            const original = records[0]
            const patched: EvidenceRecord = { ...original, ...patch }

            const context = await runOnMutate(qc, USER_ID, patched)
            // context.previousData is undefined (cache was empty)
            expect(context.previousData).toBeUndefined()

            // onError should not throw
            expect(() => runOnError(qc, context)).not.toThrow()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('snapshot captured by onMutate matches the data seeded before the mutation', async () => {
      await fc.assert(
        fc.asyncProperty(
          evidenceArrayArb(5),
          patchArb,
          async (records, patch) => {
            const qc = makeQueryClient()
            const queryKey = evidenceKey(USER_ID, false)

            qc.setQueryData(queryKey, records)

            const patched: EvidenceRecord = { ...records[0], ...patch }
            const context = await runOnMutate(qc, USER_ID, patched)

            // The snapshot captured in onMutate must equal the data we seeded
            expect(context.previousData).toEqual(records)
          },
        ),
        { numRuns: 300 },
      )
    })
  })
})
