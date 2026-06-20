// src/lib/database.types.ts
// Hand-authored from supabase/migrations/* — replace with generated output
// once `supabase gen types typescript --local` becomes available.
//
// SQL type → TypeScript type mappings used throughout:
//   UUID        → string
//   TEXT        → string
//   BOOLEAN     → boolean
//   INTEGER     → number
//   NUMERIC     → number
//   DATE        → string          (YYYY-MM-DD)
//   TIMESTAMPTZ → string          (ISO-8601)
//   JSONB       → Json            (recursive alias below)
//   TEXT[]      → string[]
//   UUID[]      → string[]

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // ── profiles ──────────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          current_level: string
          target_level: string
          team: string
          manager: string
          manager_email: string
          skip_level: string | null
          avatar_url: string | null
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          current_level: string
          target_level: string
          team: string
          manager: string
          manager_email: string
          skip_level?: string | null
          avatar_url?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          current_level?: string
          target_level?: string
          team?: string
          manager?: string
          manager_email?: string
          skip_level?: string | null
          avatar_url?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── user_settings ─────────────────────────────────────────────────────────
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications: Json
          integrations: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications?: Json
          integrations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications?: Json
          integrations?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_settings_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── evidence ──────────────────────────────────────────────────────────────
      evidence: {
        Row: {
          id: string
          user_id: string
          date: string
          source: string
          category: string
          competency: string
          title: string
          description: string
          link: string
          status: string
          match_state: string
          manager_notes: string
          is_archived: boolean
          archived_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          source: string
          category: string
          competency: string
          title: string
          description?: string
          link?: string
          status?: string
          match_state?: string
          manager_notes?: string
          is_archived?: boolean
          archived_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          source?: string
          category?: string
          competency?: string
          title?: string
          description?: string
          link?: string
          status?: string
          match_state?: string
          manager_notes?: string
          is_archived?: boolean
          archived_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evidence_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── objectives ────────────────────────────────────────────────────────────
      objectives: {
        Row: {
          id: string
          user_id: string
          title: string
          competency: string
          due: string
          status: string
          statement: string | null
          date_authored: string | null
          specific: string | null
          measurable: string | null
          achievable: string | null
          relevant: string | null
          timebound: string | null
          links: Json
          notes: string | null
          success_criteria: Json
          is_archived: boolean
          archived_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          competency: string
          due: string
          status?: string
          statement?: string | null
          date_authored?: string | null
          specific?: string | null
          measurable?: string | null
          achievable?: string | null
          relevant?: string | null
          timebound?: string | null
          links?: Json
          notes?: string | null
          success_criteria?: Json
          is_archived?: boolean
          archived_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          competency?: string
          due?: string
          status?: string
          statement?: string | null
          date_authored?: string | null
          specific?: string | null
          measurable?: string | null
          achievable?: string | null
          relevant?: string | null
          timebound?: string | null
          links?: Json
          notes?: string | null
          success_criteria?: Json
          is_archived?: boolean
          archived_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'objectives_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── assessments ───────────────────────────────────────────────────────────
      assessments: {
        Row: {
          id: string
          user_id: string
          date_completed: string
          review_period: string
          status: string
          engineer_name: string
          manager_name: string
          overall_readiness_score: number
          one_on_one_topics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          date_completed: string
          review_period: string
          status?: string
          engineer_name: string
          manager_name: string
          overall_readiness_score?: number
          one_on_one_topics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_completed?: string
          review_period?: string
          status?: string
          engineer_name?: string
          manager_name?: string
          overall_readiness_score?: number
          one_on_one_topics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assessments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── assessment_categories ─────────────────────────────────────────────────
      assessment_categories: {
        Row: {
          id: string
          assessment_id: string
          user_id: string
          category_id: string
          category_name: string
          summary: string
          category_current_avg: number
          category_target: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          user_id: string
          category_id: string
          category_name: string
          summary?: string
          category_current_avg?: number
          category_target?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          user_id?: string
          category_id?: string
          category_name?: string
          summary?: string
          category_current_avg?: number
          category_target?: number
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assessment_categories_assessment_id_fkey'
            columns: ['assessment_id']
            referencedRelation: 'assessments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assessment_categories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── assessment_questions ──────────────────────────────────────────────────
      assessment_questions: {
        Row: {
          id: string
          category_id: string
          assessment_id: string
          user_id: string
          question_id: string
          question_text: string
          previous_score: number
          current_score: number
          target_score: number
          justification: string
          attached_evidence_ids: string[]
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          assessment_id: string
          user_id: string
          question_id: string
          question_text: string
          previous_score: number
          current_score: number
          target_score?: number
          justification?: string
          attached_evidence_ids?: string[]
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          assessment_id?: string
          user_id?: string
          question_id?: string
          question_text?: string
          previous_score?: number
          current_score?: number
          target_score?: number
          justification?: string
          attached_evidence_ids?: string[]
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assessment_questions_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'assessment_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assessment_questions_assessment_id_fkey'
            columns: ['assessment_id']
            referencedRelation: 'assessments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assessment_questions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── feedback ──────────────────────────────────────────────────────────────
      feedback: {
        Row: {
          id: string
          user_id: string
          date: string
          provider: string
          type: string
          notes: string
          anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          provider: string
          type: string
          notes?: string
          anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          provider?: string
          type?: string
          notes?: string
          anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── inbox_events ──────────────────────────────────────────────────────────
      inbox_events: {
        Row: {
          id: string
          user_id: string
          source: string
          title: string
          suggestion: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: string
          title: string
          suggestion?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: string
          title?: string
          suggestion?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inbox_events_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── competency_frameworks ─────────────────────────────────────────────────
      competency_frameworks: {
        Row: {
          id: string
          user_id: string
          name: string
          version: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          version?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          version?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'competency_frameworks_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // ── competency_categories ─────────────────────────────────────────────────
      competency_categories: {
        Row: {
          id: string
          framework_id: string
          user_id: string
          name: string
          weight: number
          questions: string[]
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          framework_id: string
          user_id: string
          name: string
          weight?: number
          questions?: string[]
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          framework_id?: string
          user_id?: string
          name?: string
          weight?: number
          questions?: string[]
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'competency_categories_framework_id_fkey'
            columns: ['framework_id']
            referencedRelation: 'competency_frameworks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'competency_categories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type helpers matching supabase-js codegen conventions
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
