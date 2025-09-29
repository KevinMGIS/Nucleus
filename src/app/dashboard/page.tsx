'use client'

import { useEffect } from 'react'
import { Box, Container, Typography, CircularProgress } from '@mui/joy'
import { useTaskStore } from '@/stores/taskStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AddTaskBar } from '@/components/dashboard/AddTaskBar'
import { TaskList } from '@/components/dashboard/TaskList'
import { FilterTabs } from '@/components/dashboard/FilterTabs'
import { StatsCards } from '@/components/dashboard/StatsCards'

export default function DashboardPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    filter,
    fetchTasks,
    fetchProjects,
    addTask,
    completeTask,
    updateTask,
    deleteTask,
    snoozeTask,
    setFilter,
  } = useTaskStore()

  useEffect(() => {
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
          {/* Header */}
          <Box mb={4}>
            <Typography 
              level="h1" 
              component="h1" 
              mb={1}
              sx={{ color: 'neutral.800' }}
            >
              Dashboard
            </Typography>
            <Typography level="body-lg" color="neutral">
              Your personal cockpit for tasks and rituals
            </Typography>
          </Box>

          {/* Stats Cards */}
          <StatsCards tasks={tasks} mb={4} />

          {/* Add Task Bar */}
          <Box mb={4}>
            <AddTaskBar
              onAdd={addTask}
              placeholder="Add a task... (press Enter to save)"
            />
          </Box>

          {/* Filter Tabs */}
          <Box mb={3}>
            <FilterTabs
              currentFilter={filter}
              onFilterChange={setFilter}
              taskCounts={{
                today: tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()).length,
                'this-week': tasks.filter(t => t.status !== 'completed' && t.due_date).length,
                backlog: tasks.filter(t => t.status !== 'completed' && !t.due_date).length,
                completed: tasks.filter(t => t.status === 'completed').length,
              }}
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

          {/* Task List */}
          <TaskList
            tasks={tasks}
            projects={projects}
            filter={filter}
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