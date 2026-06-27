-- Expand allowed relationship types for 360 feedback requests.

ALTER TABLE public.three_sixty_feedback
  DROP CONSTRAINT IF EXISTS three_sixty_feedback_relationship_type_check;

ALTER TABLE public.three_sixty_feedback
  ADD CONSTRAINT three_sixty_feedback_relationship_type_check
  CHECK (
    relationship_type IN (
      'peer_engineer',
      'ux_partner',
      'product_manager',
      'pmm_partner',
      'quality_engineer'
    )
  );
