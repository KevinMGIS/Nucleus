'use client'

import { useEffect } from 'react'
import { Box, Container, Typography, CircularProgress } from '@mui/joy'
import { useTaskStore } from '@/stores/taskStore'
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

  useEffect(() => {
    console.log('Dashboard: useEffect triggered')
    
    // Test authentication
    const testAuth = async () => {
      const userId = await getUserId()
      console.log('Dashboard: Current user ID:', userId)
    }
    testAuth()
    
    // Re-enable fetchTasks to load from database
    fetchTasks()
    fetchProjects()
  }, [fetchTasks, fetchProjects])

  if (loading && tasks.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
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
              onAdd={addTask}
              placeholder="Add a task... (press Enter to save)"
            />
          </Box>

          {/* Error Display */}
          {error && (
            <Box
              mb={3}
              p={2}
              bgcolor="danger.50"
              borderRadius="sm"
              border="1px solid"
              borderColor="danger.200"
            >
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            </Box>
          )}

          {/* Task Sections */}
          <TaskSections
            key={tasks.length}
            tasks={tasks}
            projects={projects}
            onComplete={completeTask}
            onEdit={updateTask}
            onDelete={deleteTask}
            onSnooze={snoozeTask}
          />
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}