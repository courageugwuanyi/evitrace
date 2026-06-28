// src/lib/api/feedback.ts
// 360 feedback service functions backed by Supabase.

import { supabase } from '../supabase'
import type { ThreeSixtyFeedback } from '../database.types'

type FeedbackRelation = ThreeSixtyFeedback['relationship_type']
type ExecutionVector = NonNullable<ThreeSixtyFeedback['execution_vector']>

function assertFeedbackRelation(relation: string): asserts relation is FeedbackRelation {
  if (
    relation === 'peer_engineer' ||
    relation === 'ux_partner' ||
    relation === 'product_manager' ||
    relation === 'pmm_partner' ||
    relation === 'quality_engineer'
  ) {
    return
  }
  throw new Error('Invalid relationship type.')
}

async function requireAuthUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user?.id) throw new Error('Not authenticated.')
  return user.id
}

export async function requestPeerFeedback(
  engineerId: string,
  reviewerId: string,
  relation: string,
) {
  const authUserId = await requireAuthUserId()
  assertFeedbackRelation(relation)
  const normalizedEngineerId = engineerId.trim()
  const ownerEngineerId = normalizedEngineerId || authUserId
  const normalizedReviewerId = reviewerId.trim()
  if (ownerEngineerId !== authUserId) {
    throw new Error('You can only create feedback requests for your own profile.')
  }
  if (!normalizedReviewerId) {
    throw new Error('Select a teammate first.')
  }
  if (normalizedReviewerId === ownerEngineerId) {
    throw new Error('You cannot request feedback from yourself.')
  }

  const { data: existingPending, error: existingPendingError } = await supabase
    .from('three_sixty_feedback')
    .select('id')
    .eq('engineer_id', ownerEngineerId)
    .eq('reviewer_id', normalizedReviewerId)
    .eq('status', 'pending')
    .limit(1)
  if (existingPendingError) throw existingPendingError
  if ((existingPending ?? []).length > 0) {
    throw new Error('A pending request already exists for this teammate.')
  }

  const { error } = await supabase
    .from('three_sixty_feedback')
    .insert({
      engineer_id: ownerEngineerId,
      reviewer_id: normalizedReviewerId,
      relationship_type: relation,
      status: 'pending',
    })
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('A pending request already exists for this teammate.')
    }
    throw error
  }
  return {
    engineer_id: ownerEngineerId,
    reviewer_id: normalizedReviewerId,
    relationship_type: relation,
    status: 'pending',
  } as Pick<
    ThreeSixtyFeedback,
    'engineer_id' | 'reviewer_id' | 'relationship_type' | 'status'
  >
}

export async function getIncomingFeedbackRequests() {
  const reviewerId = await requireAuthUserId()

  const { data: rows, error } = await supabase
    .from('three_sixty_feedback')
    .select(
      `
      id,
      engineer_id,
      reviewer_id,
      relationship_type,
      status,
      continue_feedback,
      stop_feedback,
      start_feedback,
      execution_vector,
      created_at,
      submitted_at
      `,
    )
    .eq('reviewer_id', reviewerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  const feedbackRows = (rows ?? []) as ThreeSixtyFeedback[]
  if (feedbackRows.length === 0) return feedbackRows

  const engineerIds = Array.from(new Set(feedbackRows.map((row) => row.engineer_id)))
  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, avatar_url')
    .in('id', engineerIds)
  if (profileError) throw profileError

  const profileById = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id,
      {
        full_name: profile.full_name ?? 'Teammate',
        job_title: profile.job_title ?? '',
        avatar_url: profile.avatar_url ?? null,
      },
    ]),
  )

  return feedbackRows.map((row) => ({
    ...row,
    profiles: profileById.get(row.engineer_id),
  }))
}

export async function submitPeerFeedback(
  requestId: string,
  payload: {
    continueText: string
    stopText: string
    startText: string
    vector: string
  },
) {
  const reviewerId = await requireAuthUserId()
  const vector = payload.vector as ExecutionVector
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('three_sixty_feedback')
    .update({
      continue_feedback: payload.continueText,
      stop_feedback: payload.stopText,
      start_feedback: payload.startText,
      execution_vector: vector,
      status: 'submitted',
      submitted_at: now,
    })
    .eq('id', requestId)
    .eq('reviewer_id', reviewerId)
  if (error) throw error
  return { id: requestId, status: 'submitted', submitted_at: now } as Pick<
    ThreeSixtyFeedback,
    'id' | 'status' | 'submitted_at'
  >
}

export async function getEngineerFeedbackDossier(engineerId: string) {
  const { data, error } = await supabase
    .from('three_sixty_feedback')
    .select('*')
    .eq('engineer_id', engineerId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ThreeSixtyFeedback[]
}

export async function getOutgoingFeedbackRequests(engineerId: string) {
  const authUserId = await requireAuthUserId()
  if (engineerId !== authUserId) {
    throw new Error('You can only load your own outgoing requests.')
  }

  const { data: rows, error } = await supabase
    .from('three_sixty_feedback')
    .select(
      `
      id,
      engineer_id,
      reviewer_id,
      relationship_type,
      status,
      continue_feedback,
      stop_feedback,
      start_feedback,
      execution_vector,
      created_at,
      submitted_at
      `,
    )
    .eq('engineer_id', engineerId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const feedbackRows = (rows ?? []) as ThreeSixtyFeedback[]
  if (feedbackRows.length === 0) return feedbackRows

  const reviewerIds = Array.from(new Set(feedbackRows.map((row) => row.reviewer_id)))
  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, avatar_url')
    .in('id', reviewerIds)
  if (profileError) throw profileError

  const profileById = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id,
      {
        full_name: profile.full_name ?? 'Teammate',
        job_title: profile.job_title ?? '',
        avatar_url: profile.avatar_url ?? null,
      },
    ]),
  )

  return feedbackRows.map((row) => ({
    ...row,
    profiles: profileById.get(row.reviewer_id),
  }))
}
