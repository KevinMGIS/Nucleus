import { create } from 'zustand'
import { Task, Project, TaskFilter } from '@/types'
import { supabase, getUserId } from '@/lib/supabase'
import { dbOperations, mutationQueue } from '@/utils/db'

interface TaskStore {
  // State
  tasks: Task[]
  projects: Project[]
  loading: boolean
  error: string | null
  filter: TaskFilter
  
  // Actions
  setTasks: (tasks: Task[]) => void
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: (filter: TaskFilter) => void
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  snoozeTask: (id: string, until: string) => Promise<void>
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  // Data fetching
  fetchTasks: () => Promise<void>
  fetchProjects: () => Promise<void>
  
  // Sync operations
  syncOfflineChanges: () => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  projects: [],
  loading: false,
  error: null,
  filter: 'today',
  
  // Basic setters
  setTasks: (tasks: Task[]) => set({ tasks }),
  setProjects: (projects: Project[]) => set({ projects }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setFilter: (filter: TaskFilter) => set({ filter }),
  
  // Task operations
  addTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const task: Task = {
        ...taskData,
        id: crypto.randomUUID(), // Use proper UUID format
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Add to local store immediately
      set((state) => ({ tasks: [...state.tasks, task] }))
      
      // Try to sync with Supabase
      try {
        const { data, error } = await (supabase as any).from('tasks').insert({
          ...task,
          user_id: userId,
        }).select()
        
        if (error) {
          console.error('addTask: Supabase error:', error)
          throw error
        }
      } catch (error) {
        console.warn('addTask: Failed to sync task to server:', error)
        // For now, just continue - offline mode
      }
    } catch (error) {
      console.error('addTask: Error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add task' })
    }
  },
  
  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = { ...updates, updated_at: new Date().toISOString() }
      
      // Update local store
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updatedTask } : task
        )
      }))
      
      // Try to sync with Supabase
      try {
        const { error } = await (supabase as any)
          .from('tasks')
          .update(updatedTask)
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.warn('Failed to sync task update to server:', error)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' })
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      // Remove from local store
      set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }))
      
      // Try to sync with Supabase
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.warn('Failed to sync task deletion to server:', error)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' })
    }
  },
  
  completeTask: async (id: string) => {
    await get().updateTask(id, { 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    })
  },
  
  snoozeTask: async (id: string, until: string) => {
    await get().updateTask(id, { 
      status: 'snoozed', 
      snoozed_until: until 
    })
  },
  
  // Project operations
  addProject: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const project: Project = {
        ...projectData,
        id: crypto.randomUUID(), // Use proper UUID format
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      set((state) => ({ projects: [...state.projects, project] }))
      
      try {
        const { error } = await (supabase as any).from('projects').insert({
          ...project,
          user_id: userId,
        })
        
        if (error) throw error
      } catch (error) {
        console.warn('Failed to sync project to server:', error)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add project' })
    }
  },
  
  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = { ...updates, updated_at: new Date().toISOString() }
      
      set((state) => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...updatedProject } : project
        )
      }))
      
      try {
        const { error } = await (supabase as any)
          .from('projects')
          .update({
            ...updatedProject,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.warn('Failed to sync project update to server:', error)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update project' })
    }
  },
  
  deleteProject: async (id: string) => {
    try {
      set((state) => ({
        projects: state.projects.filter(project => project.id !== id)
      }))
      
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      } catch (error) {
        console.warn('Failed to sync project deletion to server:', error)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete project' })
    }
  },
  
  // Data fetching
  fetchTasks: async () => {
    try {
      set({ loading: true, error: null })
      
      const userId = await getUserId()
      if (!userId) {
        set({ tasks: [], loading: false })
        return
      }
      
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('fetchTasks: Supabase error:', error)
        throw error
      }
      
      set({ tasks: data || [], loading: false })
    } catch (error) {
      console.warn('fetchTasks: Failed to fetch from database:', error)
      // For development, just use empty tasks
      set({ 
        tasks: [], 
        loading: false, 
        error: null // Don't show error for missing Supabase setup
      })
    }
  },
  
  fetchProjects: async () => {
    try {
      const userId = await getUserId()
      if (!userId) {
        set({ projects: [] })
        return
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ projects: data || [] })
    } catch (error) {
      // For development, just use empty projects
      set({ projects: [] })
    }
  },
  
  // Sync offline changes
  syncOfflineChanges: async () => {
    try {
      // This will be implemented when IndexedDB is set up
      console.log('Syncing offline changes...')
    } catch (error) {
      console.error('Failed to sync offline changes:', error)
    }
  },
}))