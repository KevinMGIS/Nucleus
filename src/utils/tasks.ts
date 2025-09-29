import { format, isToday, isThisWeek, parseISO, startOfDay, endOfDay } from 'date-fns'
import { Task } from '@/types'

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'MMM d, yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr)
}

export const formatRelativeDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(parsedDate)) {
    return 'Today'
  }
  
  if (isThisWeek(parsedDate)) {
    return format(parsedDate, 'EEEE')
  }
  
  return formatDate(parsedDate, 'MMM d')
}

// Task filtering utilities
export const filterTasksByDate = (tasks: Task[], filter: 'today' | 'this-week' | 'backlog'): Task[] => {
  const now = new Date()
  
  return tasks.filter(task => {
    if (task.status === 'completed') return false
    
    switch (filter) {
      case 'today':
        return task.due_date ? isToday(parseISO(task.due_date)) : false
      case 'this-week':
        return task.due_date ? isThisWeek(parseISO(task.due_date)) : false
      case 'backlog':
        return !task.due_date || !isThisWeek(parseISO(task.due_date))
      default:
        return true
    }
  })
}

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  
  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'low']
    const bPriority = priorityOrder[b.priority || 'low']
    return bPriority - aPriority
  })
}

// Task validation
export const validateTask = (task: Partial<Task>): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!task.title?.trim()) {
    errors.push('Title is required')
  }
  
  if (task.title && task.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (task.due_date) {
    const dueDate = parseISO(task.due_date)
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Generate task ID
export const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if task is overdue
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.due_date || task.status === 'completed') return false
  
  const dueDate = parseISO(task.due_date)
  const today = startOfDay(new Date())
  
  return dueDate < today
}