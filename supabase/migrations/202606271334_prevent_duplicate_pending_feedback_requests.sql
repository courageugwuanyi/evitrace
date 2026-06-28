-- Enforce at most one pending 360 request per engineer->reviewer pair.

-- First clean up any existing duplicates so the unique index can be created safely.
WITH ranked_pending AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY engineer_id, reviewer_id
      ORDER BY created_at DESC, id DESC
    ) AS row_rank
  FROM public.three_sixty_feedback
  WHERE status = 'pending'
)
DELETE FROM public.three_sixty_feedback target
USING ranked_pending ranked
WHERE target.id = ranked.id
  AND ranked.row_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_three_sixty_feedback_unique_pending_pair
  ON public.three_sixty_feedback (engineer_id, reviewer_id)
  WHERE status = 'pending';

-- Allow engineers to read their own pending requests so the client can
-- render cadence/anti-spam markers without exposing submitted anonymous content.
DROP POLICY IF EXISTS "Engineers can view own pending feedback requests"
  ON public.three_sixty_feedback;
CREATE POLICY "Engineers can view own pending feedback requests"
  ON public.three_sixty_feedback FOR SELECT
  USING (auth.uid() = engineer_id AND status = 'pending');
