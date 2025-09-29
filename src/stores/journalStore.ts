import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { JournalEntry } from '@/types'

interface JournalStore {
  entries: JournalEntry[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchEntries: () => Promise<void>
  getTodayEntry: () => JournalEntry | null
  getWeekEntry: (weekNumber: number, year: number) => JournalEntry | null
  createOrUpdateDailyEntry: (data: Partial<JournalEntry>) => Promise<void>
  saveMorningPicks: (taskIds: string[]) => Promise<void>
  saveEveningReflection: (reflection: string, completedTaskIds: string[]) => Promise<void>
  saveWeeklyReview: (data: WeeklyReviewData) => Promise<void>
  clearError: () => void
}

interface WeeklyReviewData {
  week_number: number
  year: number
  completed_tasks_count: number
  highlight: string
  anchor_tasks: string[]
  open_tasks_count: number
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      set({ entries: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch journal entries',
        loading: false 
      })
    }
  },

  getTodayEntry: () => {
    const today = new Date().toISOString().split('T')[0]
    const entries = get().entries
    return entries.find(entry => entry.date === today && entry.type === 'daily') || null
  },

  getWeekEntry: (weekNumber, year) => {
    const entries = get().entries
    return entries.find(entry => {
      if (entry.type !== 'weekly') return false
      const entryDate = new Date(entry.date)
      const entryYear = entryDate.getFullYear()
      // Simple week calculation - could be improved
      const firstDayOfYear = new Date(entryYear, 0, 1)
      const pastDaysOfYear = (entryDate.getTime() - firstDayOfYear.getTime()) / 86400000
      const entryWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      return entryYear === year && entryWeek === weekNumber
    }) || null
  },

  createOrUpdateDailyEntry: async (data) => {
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const today = new Date().toISOString().split('T')[0]
      const entryData = {
        user_id: user.id,
        date: today,
        type: 'daily' as const,
        ...data
      }

      const { data: result, error } = await supabase
        .from('journal')
        .upsert(entryData as any, { 
          onConflict: 'user_id,date,type',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const entries = get().entries
      const existingIndex = entries.findIndex(
        e => e.date === today && e.type === 'daily'
      )
      
      if (existingIndex >= 0) {
        entries[existingIndex] = result
      } else {
        entries.unshift(result)
      }

      set({ entries: [...entries], loading: false })
    } catch (error) {
      console.error('Error creating/updating journal entry:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save journal entry',
        loading: false 
      })
    }
  },

  saveMorningPicks: async (taskIds) => {
    await get().createOrUpdateDailyEntry({ morning_picks: taskIds })
  },

  saveEveningReflection: async (reflection: string, completedTaskIds: string[]) => {
    await get().createOrUpdateDailyEntry({ 
      reflection: reflection.trim() || undefined,
      completed_tasks: completedTaskIds 
    })
  },

  saveWeeklyReview: async (data: WeeklyReviewData) => {
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Calculate the date for the week (use Monday of that week)
      const now = new Date()
      const currentDay = now.getDay()
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
      const monday = new Date(now)
      monday.setDate(now.getDate() + mondayOffset)
      
      const weekDate = monday.toISOString().split('T')[0]
      
      const entryData = {
        user_id: user.id,
        date: weekDate,
        type: 'weekly' as const,
        reflection: data.highlight.trim() || undefined,
        weekly_anchors: data.anchor_tasks,
        // Store additional weekly data in a metadata field if needed
      }

      const { data: result, error } = await supabase
        .from('journal')
        .upsert(entryData as any, { 
          onConflict: 'user_id,date,type',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const entries = get().entries
      const existingIndex = entries.findIndex(
        e => e.date === weekDate && e.type === 'weekly'
      )
      
      if (existingIndex >= 0) {
        entries[existingIndex] = result
      } else {
        entries.unshift(result)
      }

      set({ entries: [...entries], loading: false })
    } catch (error) {
      console.error('Error saving weekly review:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save weekly review',
        loading: false 
      })
    }
  },

  clearError: () => set({ error: null })
}))