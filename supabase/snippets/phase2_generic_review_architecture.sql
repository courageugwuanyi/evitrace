-- Phase 2: Generic review architecture migration snippet.
-- Run manually in Supabase SQL Editor.

-- 1. Extend evidence items and objectives to support audit trails and manager feedback
ALTER TABLE public.evidence_items
ADD COLUMN IF NOT EXISTS manager_notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'modification_required')),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.objectives
ADD COLUMN IF NOT EXISTS manager_feedback TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'awaiting_approval' CHECK (status IN ('awaiting_approval', 'active', 'modification_required'));

-- 2. ACCESS PRIVILEGE FIREWALL: Permit active managers to evaluate team evidence
CREATE POLICY "Managers can review and update their team's logged evidence"
ON public.evidence_items
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.reporting_relationships
        WHERE manager_id = auth.uid()
          AND engineer_id = evidence_items.engineer_id
          AND status = 'active'
    )
);

-- 3. ACCESS PRIVILEGE FIREWALL: Permit active managers to approve team goals
CREATE POLICY "Managers can approve or request changes on team objectives"
ON public.objectives
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.reporting_relationships
        WHERE manager_id = auth.uid()
          AND engineer_id = objectives.engineer_id
          AND status = 'active'
    )
);
