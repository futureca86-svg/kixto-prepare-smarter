export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          device: string | null
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          device?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          device?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      background_jobs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          meta: Json
          name: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          meta?: Json
          name: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          meta?: Json
          name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ca_chapters: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "ca_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      ca_courses: {
        Row: {
          code: string
          created_at: string
          description: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ca_groups: {
        Row: {
          code: string
          course_code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          course_code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          course_code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_groups_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "ca_courses"
            referencedColumns: ["code"]
          },
        ]
      }
      ca_subjects: {
        Row: {
          course_code: string
          created_at: string
          group_code: string
          id: string
          name: string
          short_name: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          course_code: string
          created_at?: string
          group_code: string
          id?: string
          name: string
          short_name?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          course_code?: string
          created_at?: string
          group_code?: string
          id?: string
          name?: string
          short_name?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_subjects_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "ca_courses"
            referencedColumns: ["code"]
          },
        ]
      }
      ca_topics: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          learning_outcome: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          learning_outcome?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          learning_outcome?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "ca_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          kind: string
          paper_id: string | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          paper_id?: string | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          paper_id?: string | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "practice_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          provider_ref: string | null
          sent_at: string | null
          status: string
          subject: string
          template: string
          to_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          provider_ref?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
          to_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          provider_ref?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
          to_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          assigned_to: string | null
          browser: string | null
          code: string | null
          component: string | null
          created_at: string
          device: string | null
          fn: string | null
          id: string
          message: string
          metadata: Json
          module: string | null
          network_status: string | null
          page: string | null
          resolved_at: string | null
          severity: string
          stack: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          browser?: string | null
          code?: string | null
          component?: string | null
          created_at?: string
          device?: string | null
          fn?: string | null
          id?: string
          message: string
          metadata?: Json
          module?: string | null
          network_status?: string | null
          page?: string | null
          resolved_at?: string | null
          severity?: string
          stack?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          browser?: string | null
          code?: string | null
          component?: string | null
          created_at?: string
          device?: string | null
          fn?: string | null
          id?: string
          message?: string
          metadata?: Json
          module?: string | null
          network_status?: string | null
          page?: string | null
          resolved_at?: string | null
          severity?: string
          stack?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          label: string
          rollout: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          label: string
          rollout?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          label?: string
          rollout?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      memory_guard_items: {
        Row: {
          chapter: string | null
          created_at: string
          id: string
          last_reviewed_at: string | null
          next_review_on: string
          strength: number
          subject: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_on?: string
          strength?: number
          subject?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_on?: string
          strength?: number
          subject?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_guard_reviews: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          recall_score: number
          reviewed_on: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          recall_score?: number
          reviewed_on?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          recall_score?: number
          reviewed_on?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_guard_reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "memory_guard_items"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_quotes: {
        Row: {
          author: string
          created_at: string
          id: string
          quote: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: string
          quote: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          quote?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_attempts: {
        Row: {
          attempt_kind: string
          attempted_on: string
          chapter: string | null
          created_at: string
          id: string
          paper_id: string | null
          questions_attempted: number
          questions_correct: number
          subject: string | null
          time_spent_min: number
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_kind?: string
          attempted_on?: string
          chapter?: string | null
          created_at?: string
          id?: string
          paper_id?: string | null
          questions_attempted?: number
          questions_correct?: number
          subject?: string | null
          time_spent_min?: number
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_kind?: string
          attempted_on?: string
          chapter?: string | null
          created_at?: string
          id?: string
          paper_id?: string | null
          questions_attempted?: number
          questions_correct?: number
          subject?: string | null
          time_spent_min?: number
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_attempts_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "practice_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string
          provider: string
          provider_ref: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tasks: {
        Row: {
          chapter: string | null
          completed_at: string | null
          created_at: string
          duration_min: number
          id: string
          priority: number
          scheduled_date: string
          start_time: string | null
          status: string
          subject: string | null
          task_type: string
          title: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          completed_at?: string | null
          created_at?: string
          duration_min?: number
          id?: string
          priority?: number
          scheduled_date?: string
          start_time?: string | null
          status?: string
          subject?: string | null
          task_type?: string
          title: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          completed_at?: string | null
          created_at?: string
          duration_min?: number
          id?: string
          priority?: number
          scheduled_date?: string
          start_time?: string | null
          status?: string
          subject?: string | null
          task_type?: string
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_papers: {
        Row: {
          chapter: string | null
          created_at: string
          id: string
          question_count: number
          status: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          id?: string
          question_count?: number
          status?: string
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          id?: string
          question_count?: number
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          course_code: string | null
          created_at: string
          daily_target_minutes: number
          email: string
          full_name: string
          goals: string[]
          group_code: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          study_hours: string | null
          subjects: string[]
          updated_at: string
        }
        Insert: {
          course_code?: string | null
          created_at?: string
          daily_target_minutes?: number
          email?: string
          full_name?: string
          goals?: string[]
          group_code?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          study_hours?: string | null
          subjects?: string[]
          updated_at?: string
        }
        Update: {
          course_code?: string | null
          created_at?: string
          daily_target_minutes?: number
          email?: string
          full_name?: string
          goals?: string[]
          group_code?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          study_hours?: string | null
          subjects?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          chapter: string | null
          course_code: string | null
          created_at: string
          created_by: string | null
          difficulty: string
          explanation: string | null
          id: string
          marks: number
          options: Json
          question: string
          status: string
          subject: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          chapter?: string | null
          course_code?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          question: string
          status?: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          chapter?: string | null
          course_code?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          question?: string
          status?: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_history: {
        Row: {
          created_at: string
          id: string
          quote_id: string
          shown_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quote_id: string
          shown_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quote_id?: string
          shown_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_history_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "motivational_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          blocked: boolean
          browser: string | null
          created_at: string
          device: string | null
          email: string | null
          id: string
          ip: string | null
          kind: string
          meta: Json
          severity: string
          user_id: string | null
        }
        Insert: {
          blocked?: boolean
          browser?: string | null
          created_at?: string
          device?: string | null
          email?: string | null
          id?: string
          ip?: string | null
          kind?: string
          meta?: Json
          severity?: string
          user_id?: string | null
        }
        Update: {
          blocked?: boolean
          browser?: string | null
          created_at?: string
          device?: string | null
          email?: string | null
          id?: string
          ip?: string | null
          kind?: string
          meta?: Json
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          chapter: string | null
          created_at: string
          id: string
          minutes: number
          source: string
          studied_on: string
          subject: string | null
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          id?: string
          minutes?: number
          source?: string
          studied_on?: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          id?: string
          minutes?: number
          source?: string
          studied_on?: string
          subject?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          cancelled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_ticket_replies: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_staff: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string
          category: string
          created_at: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_modules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          module: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          module: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          module?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_auth_stats: { Args: never; Returns: Json }
      admin_db_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "student" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student", "super_admin"],
    },
  },
} as const
