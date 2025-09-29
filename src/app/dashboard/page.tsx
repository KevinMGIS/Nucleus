'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, CircularProgress, Button } from '@mui/joy'
import { useTaskStore } from '@/stores/taskStore'
import { useJournalStore } from '@/stores/journalStore'
import { getUserId } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AddTaskBar } from '@/components/dashboard/AddTaskBar'
import { TaskSections } from '@/components/dashboard/TaskSections'
import { StatsCards } from '@/components/dashboard/StatsCards'

export default function DashboardPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    fetchTasks,
    fetchProjects,
    addTask,
    completeTask,
    updateTask,
    deleteTask,
    snoozeTask,
  } = useTaskStore()
  
  const { entries, fetchEntries, error: journalError } = useJournalStore()
  const [isLoading, setIsLoading] = useState(true)
  const [componentError, setComponentError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        setComponentError(null)
        
        console.log('Dashboard: Fetching data...')
        
        // Test authentication
        const userId = await getUserId()
        console.log('Dashboard: Current user ID:', userId)
        
        // Fetch all data
        await Promise.all([
          fetchTasks(),
          fetchProjects(),
          fetchEntries()
        ])
        
        console.log('Dashboard: Data loaded successfully')
      } catch (error) {
        console.error('Dashboard: Failed to load data:', error)
        setComponentError('Failed to load dashboard data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [fetchTasks, fetchProjects, fetchEntries])

  const handleAddTask = async (taskData: any) => {
    try {
      console.log('Dashboard: Adding task:', taskData)
      await addTask(taskData)
      console.log('Dashboard: Task added successfully')
    } catch (error) {
      console.error('Dashboard: Failed to add task:', error)
      setComponentError('Failed to add task. Please try again.')
    }
  }

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      console.log('Dashboard: Updating task:', taskId, updates)
      await updateTask(taskId, updates)
      console.log('Dashboard: Task updated successfully')
    } catch (error) {
      console.error('Dashboard: Failed to update task:', error)
      setComponentError('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log('Dashboard: Deleting task:', taskId)
      await deleteTask(taskId)
      console.log('Dashboard: Task deleted successfully')
    } catch (error) {
      console.error('Dashboard: Failed to delete task:', error)
      setComponentError('Failed to delete task. Please try again.')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log('Dashboard: Completing task:', taskId)
      await completeTask(taskId)
      console.log('Dashboard: Task completed successfully')
    } catch (error) {
      console.error('Dashboard: Failed to complete task:', error)
      setComponentError('Failed to complete task. Please try again.')
    }
  }

  const handleSnoozeTask = async (taskId: string, until: string) => {
    try {
      console.log('Dashboard: Snoozing task:', taskId, until)
      await snoozeTask(taskId, until)
      console.log('Dashboard: Task snoozed successfully')
    } catch (error) {
      console.error('Dashboard: Failed to snooze task:', error)
      setComponentError('Failed to snooze task. Please try again.')
    }
  }

  // Error state
  if (componentError || error || journalError) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box
            sx={{
              padding: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography level="h3" color="danger">
              Something went wrong
            </Typography>
            <Typography level="body-md" color="neutral">
              {componentError || error || journalError}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                color="primary"
                onClick={() => {
                  setComponentError(null)
                  window.location.reload()
                }}
              >
                Refresh Page
              </Button>
              <Button 
                color="neutral"
                variant="soft"
                onClick={() => setComponentError(null)}
              >
                Dismiss Error
              </Button>
            </Box>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  // Loading state
  if (isLoading || (loading && tasks.length === 0)) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress />
            <Typography level="body-md" color="neutral">
              Loading your tasks...
            </Typography>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Stats Cards */}
          <StatsCards tasks={tasks} mb={4} />

          {/* Add Task Bar */}
          <Box mb={4}>
            <AddTaskBar
              onAdd={handleAddTask}
              placeholder="Add a task... (press Enter to save)"
            />
          </Box>

          {/* Error Display */}
          {componentError && (
            <Box
              mb={3}
              p={2}
              bgcolor="danger.50"
              borderRadius="sm"
              border="1px solid"
              borderColor="danger.200"
            >
              <Typography level="body-sm" color="danger">
                {componentError}
              </Typography>
            </Box>
          )}

          {/* Task Sections */}
          <TaskSections
            key={tasks.length}
            tasks={tasks}
            projects={projects}
            onComplete={handleCompleteTask}
            onEdit={handleUpdateTask}
            onDelete={handleDeleteTask}
            onSnooze={handleSnoozeTask}
          />
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}