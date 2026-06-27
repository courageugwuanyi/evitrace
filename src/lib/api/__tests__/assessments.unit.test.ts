import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockUseMutation,
  mockUseQueryClient,
  mockInvalidateQueries,
  mockGetUser,
  mockFrom,
  mockAssessmentToRows,
  mockToastError,
} = vi.hoisted(() => {
  return {
    mockUseMutation: vi.fn(),
    mockUseQueryClient: vi.fn(),
    mockInvalidateQueries: vi.fn(),
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
    mockAssessmentToRows: vi.fn(),
    mockToastError: vi.fn(),
  }
})

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}))

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
  },
}))

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}))

vi.mock('../mappers', () => ({
  assessmentRowsToAssessment: vi.fn(),
  assessmentToRows: mockAssessmentToRows,
}))

import { useFinalizeAssessment } from '../assessments'

function makeAssessment() {
  return {
    id: 'assess-1',
    dateCompleted: '2026-06-20T20:00:00.000Z',
    reviewPeriod: 'June 2026',
    status: 'Finalized',
    engineerName: 'Engineer',
    managerName: 'Manager',
    overallReadinessScore: 75,
    categories: [],
    oneOnOneTopics: [],
  } as const
}

describe('useFinalizeAssessment auth guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    })
    mockUseMutation.mockImplementation((config) => config)
    mockAssessmentToRows.mockReturnValue({
      assessment: { id: 'assess-1', user_id: 'user-1' },
      categories: [],
      questions: [],
    })
  })

  it('rejects immediately when owner id is missing/empty', async () => {
    const mutation = useFinalizeAssessment('   ') as {
      mutationFn: (variables: { assessment: ReturnType<typeof makeAssessment>; userId?: string }) => Promise<void>
    }

    await expect(mutation.mutationFn({ assessment: makeAssessment() })).rejects.toThrow(
      'Cannot finalize assessment: Unauthenticated user session',
    )

    expect(mockGetUser).not.toHaveBeenCalled()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects when auth session is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const mutation = useFinalizeAssessment('user-1') as {
      mutationFn: (variables: { assessment: ReturnType<typeof makeAssessment>; userId?: string }) => Promise<void>
    }

    await expect(mutation.mutationFn({ assessment: makeAssessment() })).rejects.toThrow(
      'Cannot finalize assessment: Unauthenticated user session',
    )

    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects when authenticated user mismatches owner id', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'different-user' } },
      error: null,
    })

    const mutation = useFinalizeAssessment('user-1') as {
      mutationFn: (variables: { assessment: ReturnType<typeof makeAssessment>; userId?: string }) => Promise<void>
    }

    await expect(mutation.mutationFn({ assessment: makeAssessment() })).rejects.toThrow(
      'Cannot finalize assessment: Authenticated user mismatch',
    )

    expect(mockFrom).not.toHaveBeenCalled()
  })
})
