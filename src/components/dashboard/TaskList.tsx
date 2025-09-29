'use client'

import { Box, Typography, List, ListItem, Card, CardContent } from '@mui/joy'
import { Task, Project, TaskFilter } from '@/types'
import { TaskItem } from './TaskItem'
import { isToday, isThisWeek, parseISO } from 'date-fns'

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  filter: TaskFilter
  onComplete: (taskId: string) => void
  onEdit: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onSnooze: (taskId: string, until: string) => void
}

export function TaskList({
  tasks,
  projects,
  filter,
  onComplete,
  onEdit,
  onDelete,
  onSnooze,
}: TaskListProps) {
  // Filter tasks based on current filter
  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case 'today':
        return (
          task.status !== 'completed' &&
          task.due_date &&
          isToday(parseISO(task.due_date))
        )
      case 'this-week':
        return (
          task.status !== 'completed' &&
          task.due_date &&
          isThisWeek(parseISO(task.due_date))
        )
      case 'backlog':
        return task.status !== 'completed' && !task.due_date
      case 'completed':
        return task.status === 'completed'
      default:
        return true
    }
  })

  // Sort tasks by priority and date
  const sortedTasks = filteredTasks.sort((a, b) => {
    // First sort by completion status
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1

    // Then by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority || 'low']
    const bPriority = priorityOrder[b.priority || 'low']
    
    if (aPriority !== bPriority) return bPriority - aPriority

    // Finally by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1

    // Fallback to creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (sortedTasks.length === 0) {
    return (
      <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
        <CardContent>
          <Typography level="body-lg" color="neutral">
            {filter === 'completed' 
              ? "No completed tasks yet. Start crushing those goals! 🎯"
              : filter === 'today'
              ? "No tasks for today. Perfect time to plan ahead! ✨"
              : filter === 'this-week'
              ? "No tasks this week. Time to set some goals! 📅"
              : "Your backlog is empty. Add some tasks to get started! 📝"
            }
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <List
        sx={{
          gap: 1,
          p: 0,
        }}
      >
        {sortedTasks.map((task) => (
          <ListItem key={task.id} sx={{ p: 0 }}>
            <TaskItem
              task={task}
              project={projects.find(p => p.id === task.project_id)}
              onComplete={() => onComplete(task.id)}
              onEdit={(updates) => onEdit(task.id, updates)}
              onDelete={() => onDelete(task.id)}
              onSnooze={(until) => onSnooze(task.id, until)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}