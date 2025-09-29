// Core application types

export interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  priority?: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'snoozed'
  is_feature: boolean
  project_id?: string
  completed_at?: string
  snoozed_until?: string
  weekly_focus?: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  color?: string
  description?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  date: string
  type: 'daily' | 'weekly'
  morning_picks?: string[]
  reflection?: string
  completed_tasks?: string[]
  weekly_anchors?: string[]
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  daily_reminder_time?: string
  weekly_reminder_day?: number
  streak_start_date?: string
  created_at: string
  updated_at: string
}

// View types
export type TaskFilter = 'today' | 'this-week' | 'backlog' | 'completed'
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'snoozed'

// Component props types
export interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  onSnooze: (taskId: string, until: string) => void
  onDelete: (taskId: string) => void
}

export interface AddTaskBarProps {
  onAdd: (task: Partial<Task>) => void
  placeholder?: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Form types
export interface TaskFormData {
  title: string
  description?: string
  due_date?: string
  priority?: Priority
  project_id?: string
  is_feature?: boolean
}

// Stats types
export interface DashboardStats {
  today_completed: number
  this_week_completed: number
  current_streak: number
  total_tasks: number
}