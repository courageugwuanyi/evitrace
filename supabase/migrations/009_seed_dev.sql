-- 009_seed_dev.sql
-- Dev seed data — only runs on non-production databases.
-- Uses a fixed dev user UUID to bypass auth.users FK (session_replication_role = replica).
-- All inserts are idempotent via ON CONFLICT DO NOTHING.

DO $$
DECLARE
  dev_user_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;

  -- assessment_categories fixed UUIDs (so assessment_questions can reference them)
  cat_q2_delivery     UUID := 'aaaaaaaa-0000-0000-0000-000000000001'::uuid;
  cat_q2_code_quality UUID := 'aaaaaaaa-0000-0000-0000-000000000002'::uuid;
  cat_q2_comm         UUID := 'aaaaaaaa-0000-0000-0000-000000000003'::uuid;

  cat_q1_delivery     UUID := 'aaaaaaaa-0000-0000-0001-000000000001'::uuid;
  cat_q1_tech_design  UUID := 'aaaaaaaa-0000-0000-0001-000000000002'::uuid;

  cat_q4_code_quality UUID := 'aaaaaaaa-0000-0000-0002-000000000001'::uuid;
  cat_q4_comm         UUID := 'aaaaaaaa-0000-0000-0002-000000000002'::uuid;
  cat_q4_delivery     UUID := 'aaaaaaaa-0000-0000-0002-000000000003'::uuid;

BEGIN
  IF current_database() NOT LIKE '%prod%' THEN

    -- Temporarily disable FK triggers so we can insert without an auth.users row
    SET session_replication_role = replica;

    -- ── profiles ────────────────────────────────────────────────────────────────
    INSERT INTO profiles (
      id, full_name, email, current_level, target_level,
      team, manager, manager_email, skip_level, job_title
    ) VALUES (
      dev_user_id,
      'Courage Ugwuanyi',
      'courage@example.com',
      'L3',
      'L4',
      'Payments Platform',
      'Jane Smith',
      'jane.smith@example.com',
      'Bob Jones',
      'Software Engineer'
    ) ON CONFLICT DO NOTHING;

    -- ── evidence (5 rows) ────────────────────────────────────────────────────────
    INSERT INTO evidence (
      id, user_id, date, source, category, competency,
      title, description, link, status, match_state, is_archived
    ) VALUES
      (
        'bbbbbbbb-0000-0000-0000-000000000001'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '10 days')::date,
        'GitHub',
        'Engineering',
        'Code Quality',
        'Refactored payment retry logic with 95% test coverage',
        'Rewrote the retry handler to eliminate duplicate-charge edge cases and boosted unit test coverage from 61% to 95%.',
        'https://github.com/example/payments/pull/412',
        'Reviewed',
        'Yes',
        false
      ),
      (
        'bbbbbbbb-0000-0000-0000-000000000002'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '25 days')::date,
        'Jira',
        'Engineering',
        'Delivery',
        'Shipped fraud-detection service v2 on schedule',
        'Delivered all acceptance criteria for PAYM-309 one day ahead of sprint deadline with zero post-deploy incidents.',
        'https://jira.example.com/browse/PAYM-309',
        'Reviewed',
        'Yes',
        false
      ),
      (
        'bbbbbbbb-0000-0000-0000-000000000003'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '45 days')::date,
        'Manual',
        'Leadership',
        'Communication',
        'Presented architecture proposal to 20-person team',
        'Led a 45-minute design review session on the new async settlement pipeline. Gathered actionable feedback that shaped the final RFC.',
        '',
        'Pending Review',
        'Somewhat',
        false
      ),
      (
        'bbbbbbbb-0000-0000-0000-000000000004'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '60 days')::date,
        'Confluence',
        'Engineering',
        'Technical Design',
        'Authored RFC-018: Idempotency keys for payment API',
        'Wrote a comprehensive RFC covering key-expiry policy, storage trade-offs, and rollout plan. RFC was approved and merged.',
        'https://confluence.example.com/display/PAY/RFC-018',
        'Reviewed',
        'Yes',
        false
      ),
      (
        'bbbbbbbb-0000-0000-0000-000000000005'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '80 days')::date,
        'Slack',
        'Leadership',
        'Mentorship',
        'Pair-programmed with junior engineer on async/await patterns',
        'Spent three sessions helping an L2 engineer understand Promise-chain refactoring. They independently shipped the next ticket.',
        '',
        'Pending Review',
        'Unset',
        false
      )
    ON CONFLICT DO NOTHING;

    -- ── objectives (5 rows) ──────────────────────────────────────────────────────
    INSERT INTO objectives (
      id, user_id, title, competency, due, status, success_criteria, is_archived
    ) VALUES
      (
        'cccccccc-0000-0000-0000-000000000001'::uuid,
        dev_user_id,
        'Ship settlement reconciliation service to production',
        'Delivery',
        (CURRENT_DATE + INTERVAL '30 days')::date,
        'In Progress',
        '{"learn":[],"demonstrate":[],"share":[]}'::jsonb,
        false
      ),
      (
        'cccccccc-0000-0000-0000-000000000002'::uuid,
        dev_user_id,
        'Design and publish RFC for async event-driven payments',
        'Technical Design',
        (CURRENT_DATE + INTERVAL '45 days')::date,
        'In Progress',
        '{"learn":[],"demonstrate":[],"share":[]}'::jsonb,
        false
      ),
      (
        'cccccccc-0000-0000-0000-000000000003'::uuid,
        dev_user_id,
        'Increase unit test coverage to 90% across payments-core',
        'Code Quality',
        (CURRENT_DATE + INTERVAL '60 days')::date,
        'Pending Approval',
        '{"learn":[],"demonstrate":[],"share":[]}'::jsonb,
        false
      ),
      (
        'cccccccc-0000-0000-0000-000000000004'::uuid,
        dev_user_id,
        'Present quarterly platform health report to engineering leadership',
        'Communication',
        (CURRENT_DATE + INTERVAL '75 days')::date,
        'Pending Approval',
        '{"learn":[],"demonstrate":[],"share":[]}'::jsonb,
        false
      ),
      (
        'cccccccc-0000-0000-0000-000000000005'::uuid,
        dev_user_id,
        'Complete onboarding guide for new Payments Platform engineers',
        'Mentorship',
        (CURRENT_DATE - INTERVAL '5 days')::date,
        'Completed',
        '{"learn":[],"demonstrate":[],"share":[]}'::jsonb,
        false
      )
    ON CONFLICT DO NOTHING;

    -- ── assessments (3 rows) ─────────────────────────────────────────────────────
    INSERT INTO assessments (
      id, user_id, date_completed, review_period, status,
      engineer_name, manager_name, overall_readiness_score
    ) VALUES
      (
        'REV-2026-Q2',
        dev_user_id,
        '2026-06-30 17:00:00+00',
        '2026 Q2',
        'Finalized',
        'Courage Ugwuanyi',
        'Jane Smith',
        72
      ),
      (
        'REV-2026-Q1',
        dev_user_id,
        '2026-03-31 17:00:00+00',
        '2026 Q1',
        'Finalized',
        'Courage Ugwuanyi',
        'Jane Smith',
        68
      ),
      (
        'REV-2025-Q4',
        dev_user_id,
        '2025-12-31 17:00:00+00',
        '2025 Q4',
        'Finalized',
        'Courage Ugwuanyi',
        'Jane Smith',
        61
      )
    ON CONFLICT DO NOTHING;

    -- ── assessment_categories ────────────────────────────────────────────────────
    -- REV-2026-Q2: delivery (avg 4.00 from scores 4,4), code-quality (avg 3.50 from 3,4), communication (avg 3.67 from 4,4,3)
    -- REV-2026-Q1: delivery (avg 3.50 from 3,4), tech-design (avg 3.50 from 3,4)
    -- REV-2025-Q4: code-quality (avg 3.00 from 3,3), communication (avg 2.50 from 2,3), delivery (avg 2.67 from 3,2,3)

    INSERT INTO assessment_categories (
      id, assessment_id, user_id, category_id, category_name,
      summary, category_current_avg, category_target, sort_order
    ) VALUES
      -- REV-2026-Q2
      (
        cat_q2_delivery, 'REV-2026-Q2', dev_user_id,
        'delivery', 'Delivery',
        'Consistently delivers on time with minimal defects.',
        4.00, 4.00, 1
      ),
      (
        cat_q2_code_quality, 'REV-2026-Q2', dev_user_id,
        'code-quality', 'Code Quality',
        'Code is well-structured; coverage is improving.',
        3.50, 4.00, 2
      ),
      (
        cat_q2_comm, 'REV-2026-Q2', dev_user_id,
        'communication', 'Communication',
        'Communicates clearly in most contexts; async writing is strong.',
        3.67, 4.00, 3
      ),
      -- REV-2026-Q1
      (
        cat_q1_delivery, 'REV-2026-Q1', dev_user_id,
        'delivery', 'Delivery',
        'Good delivery cadence; occasional scope creep noted.',
        3.50, 4.00, 1
      ),
      (
        cat_q1_tech_design, 'REV-2026-Q1', dev_user_id,
        'tech-design', 'Technical Design',
        'RFCs are thorough; needs more iteration on feedback loops.',
        3.50, 4.00, 2
      ),
      -- REV-2025-Q4
      (
        cat_q4_code_quality, 'REV-2025-Q4', dev_user_id,
        'code-quality', 'Code Quality',
        'Foundation is solid; test coverage was below target.',
        3.00, 4.00, 1
      ),
      (
        cat_q4_comm, 'REV-2025-Q4', dev_user_id,
        'communication', 'Communication',
        'Written communication good; verbal presentation needs practice.',
        2.50, 4.00, 2
      ),
      (
        cat_q4_delivery, 'REV-2025-Q4', dev_user_id,
        'delivery', 'Delivery',
        'Delivered most commitments; one ticket carried over.',
        2.67, 4.00, 3
      )
    ON CONFLICT DO NOTHING;

    -- ── assessment_questions ─────────────────────────────────────────────────────
    -- REV-2026-Q2 / delivery: scores 4, 4  → avg 4.00
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0000-000000000001'::uuid,
        cat_q2_delivery, 'REV-2026-Q2', dev_user_id,
        'del-1', 'Delivers work on time within sprint commitments',
        3, 4, 4, 1
      ),
      (
        'dddddddd-0000-0000-0000-000000000002'::uuid,
        cat_q2_delivery, 'REV-2026-Q2', dev_user_id,
        'del-2', 'Proactively flags blockers before they impact the team',
        3, 4, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2026-Q2 / code-quality: scores 3, 4  → avg 3.50
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0000-000000000003'::uuid,
        cat_q2_code_quality, 'REV-2026-Q2', dev_user_id,
        'cq-1', 'Writes readable, well-documented code',
        3, 3, 4, 1
      ),
      (
        'dddddddd-0000-0000-0000-000000000004'::uuid,
        cat_q2_code_quality, 'REV-2026-Q2', dev_user_id,
        'cq-2', 'Maintains adequate unit test coverage',
        2, 4, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2026-Q2 / communication: scores 4, 4, 3  → avg 3.67
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0000-000000000005'::uuid,
        cat_q2_comm, 'REV-2026-Q2', dev_user_id,
        'com-1', 'Communicates status updates clearly and consistently',
        3, 4, 4, 1
      ),
      (
        'dddddddd-0000-0000-0000-000000000006'::uuid,
        cat_q2_comm, 'REV-2026-Q2', dev_user_id,
        'com-2', 'Writes clear design docs and async communication',
        3, 4, 4, 2
      ),
      (
        'dddddddd-0000-0000-0000-000000000007'::uuid,
        cat_q2_comm, 'REV-2026-Q2', dev_user_id,
        'com-3', 'Listens actively and asks clarifying questions',
        2, 3, 4, 3
      )
    ON CONFLICT DO NOTHING;

    -- REV-2026-Q1 / delivery: scores 3, 4  → avg 3.50
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0001-000000000001'::uuid,
        cat_q1_delivery, 'REV-2026-Q1', dev_user_id,
        'del-1', 'Delivers work on time within sprint commitments',
        2, 3, 4, 1
      ),
      (
        'dddddddd-0000-0000-0001-000000000002'::uuid,
        cat_q1_delivery, 'REV-2026-Q1', dev_user_id,
        'del-2', 'Proactively flags blockers before they impact the team',
        2, 4, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2026-Q1 / tech-design: scores 3, 4  → avg 3.50
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0001-000000000003'::uuid,
        cat_q1_tech_design, 'REV-2026-Q1', dev_user_id,
        'td-1', 'Designs systems with appropriate trade-off analysis',
        2, 3, 4, 1
      ),
      (
        'dddddddd-0000-0000-0001-000000000004'::uuid,
        cat_q1_tech_design, 'REV-2026-Q1', dev_user_id,
        'td-2', 'Incorporates stakeholder feedback into technical decisions',
        2, 4, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2025-Q4 / code-quality: scores 3, 3  → avg 3.00
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0002-000000000001'::uuid,
        cat_q4_code_quality, 'REV-2025-Q4', dev_user_id,
        'cq-1', 'Writes readable, well-documented code',
        2, 3, 4, 1
      ),
      (
        'dddddddd-0000-0000-0002-000000000002'::uuid,
        cat_q4_code_quality, 'REV-2025-Q4', dev_user_id,
        'cq-2', 'Maintains adequate unit test coverage',
        2, 3, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2025-Q4 / communication: scores 2, 3  → avg 2.50
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0002-000000000003'::uuid,
        cat_q4_comm, 'REV-2025-Q4', dev_user_id,
        'com-1', 'Communicates status updates clearly and consistently',
        2, 2, 4, 1
      ),
      (
        'dddddddd-0000-0000-0002-000000000004'::uuid,
        cat_q4_comm, 'REV-2025-Q4', dev_user_id,
        'com-2', 'Writes clear design docs and async communication',
        2, 3, 4, 2
      )
    ON CONFLICT DO NOTHING;

    -- REV-2025-Q4 / delivery: scores 3, 2, 3  → avg 2.67
    INSERT INTO assessment_questions (
      id, category_id, assessment_id, user_id,
      question_id, question_text, previous_score, current_score, target_score, sort_order
    ) VALUES
      (
        'dddddddd-0000-0000-0002-000000000005'::uuid,
        cat_q4_delivery, 'REV-2025-Q4', dev_user_id,
        'del-1', 'Delivers work on time within sprint commitments',
        2, 3, 4, 1
      ),
      (
        'dddddddd-0000-0000-0002-000000000006'::uuid,
        cat_q4_delivery, 'REV-2025-Q4', dev_user_id,
        'del-2', 'Proactively flags blockers before they impact the team',
        1, 2, 4, 2
      ),
      (
        'dddddddd-0000-0000-0002-000000000007'::uuid,
        cat_q4_delivery, 'REV-2025-Q4', dev_user_id,
        'del-3', 'Scopes work accurately and meets estimates',
        2, 3, 4, 3
      )
    ON CONFLICT DO NOTHING;

    -- ── inbox_events (3 rows) ────────────────────────────────────────────────────
    INSERT INTO inbox_events (
      id, user_id, source, title, suggestion
    ) VALUES
      (
        'eeeeeeee-0000-0000-0000-000000000001'::uuid,
        dev_user_id,
        'GitHub',
        'PR #412 merged: Refactor payment retry logic',
        ARRAY['Code Quality', 'Delivery']
      ),
      (
        'eeeeeeee-0000-0000-0000-000000000002'::uuid,
        dev_user_id,
        'Jira',
        'PAYM-309 resolved: Fraud detection v2 shipped',
        ARRAY['Delivery']
      ),
      (
        'eeeeeeee-0000-0000-0000-000000000003'::uuid,
        dev_user_id,
        'Slack',
        'Pinned message: async settlement pipeline discussion',
        ARRAY['Communication', 'Technical Design']
      )
    ON CONFLICT DO NOTHING;

    -- ── feedback (2 rows) ────────────────────────────────────────────────────────
    INSERT INTO feedback (
      id, user_id, date, provider, type, notes, anonymous
    ) VALUES
      (
        'ffffffff-0000-0000-0000-000000000001'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '20 days')::date,
        'Jane Smith',
        'Manager Requested',
        'Courage has shown strong ownership of the payments retry work. Next step is improving cross-team communication on dependencies.',
        false
      ),
      (
        'ffffffff-0000-0000-0000-000000000002'::uuid,
        dev_user_id,
        (CURRENT_DATE - INTERVAL '50 days')::date,
        'Alex Nguyen',
        'Peer Review',
        'Great collaborator — always helps unblock others. Could improve estimation accuracy on larger tickets.',
        false
      )
    ON CONFLICT DO NOTHING;

    -- Re-enable FK triggers
    SET session_replication_role = DEFAULT;

  END IF;
END $$;
