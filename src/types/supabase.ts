// Database types for Supabase
// Run `npm run supabase:generate-types` to regenerate these types

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          description: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          description?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          description?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | null
          status: 'todo' | 'in_progress' | 'completed' | 'snoozed'
          is_feature: boolean
          weekly_focus: boolean
          completed_at: string | null
          snoozed_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'todo' | 'in_progress' | 'completed' | 'snoozed'
          is_feature?: boolean
          weekly_focus?: boolean
          completed_at?: string | null
          snoozed_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'todo' | 'in_progress' | 'completed' | 'snoozed'
          is_feature?: boolean
          weekly_focus?: boolean
          completed_at?: string | null
          snoozed_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      journal: {
        Row: {
          id: string
          user_id: string
          date: string
          type: 'daily' | 'weekly'
          morning_picks: string[] | null
          reflection: string | null
          completed_tasks: string[] | null
          weekly_anchors: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          type: 'daily' | 'weekly'
          morning_picks?: string[] | null
          reflection?: string | null
          completed_tasks?: string[] | null
          weekly_anchors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          type?: 'daily' | 'weekly'
          morning_picks?: string[] | null
          reflection?: string | null
          completed_tasks?: string[] | null
          weekly_anchors?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          daily_reminder_time: string | null
          weekly_reminder_day: number | null
          streak_start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          daily_reminder_time?: string | null
          weekly_reminder_day?: number | null
          streak_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          daily_reminder_time?: string | null
          weekly_reminder_day?: number | null
          streak_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}