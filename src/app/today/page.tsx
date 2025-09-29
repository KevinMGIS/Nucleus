'use client'

import { useEffect } from 'react'
import { Box, Container, Typography, CircularProgress, Card, CardContent, Chip } from '@mui/joy'
import { Today } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AddTaskBar } from '@/components/dashboard/AddTaskBar'
import { StatsCards } from '@/components/dashboard/StatsCards'

export default function TodayPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    fetchTasks,
    fetchProjects,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    snoozeTask,
  } = useTaskStore()

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [fetchTasks, fetchProjects])

  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  
  // Filter tasks for today only
  const todayTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false
    if (!t.due_date) return false
    const taskDateString = t.due_date.split('T')[0] // Get YYYY-MM-DD part
    return taskDateString === todayString
  })

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Today sx={{ color: 'primary.500', fontSize: '2rem' }} />
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'neutral.800' }}
              >
                Today
              </Typography>
              <Chip size="lg" color="primary" variant="soft">
                {todayTasks.length}
              </Chip>
            </Box>
            <Typography level="body-lg" color="neutral">
              Focus on what matters today
            </Typography>
          </Box>

          {/* Stats for today's tasks */}
          <StatsCards tasks={todayTasks} mb={4} />

          {/* Add Task Bar */}
          <Box mb={4}>
            <AddTaskBar
              onAdd={addTask}
              placeholder="Add a task for today... (press Enter to save)"
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

          {/* Today's Tasks */}
          {todayTasks.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Today sx={{ fontSize: '3rem', color: 'neutral.300', mb: 2 }} />
                <Typography level="h3" color="neutral" mb={1}>
                  No tasks scheduled for today
                </Typography>
                <Typography level="body-md" color="neutral">
                  Add some tasks to get started with your day!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todayTasks.map((task) => (
                <Card
                  key={task.id}
                  variant="soft"
                  size="sm"
                  sx={{
                    p: 2,
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    bgcolor: 'neutral.100',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 'sm',
                      bgcolor: 'neutral.200',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Complete radio button */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        checked={task.status === 'completed'}
                        onChange={() => completeTask(task.id)}
                        style={{ accentColor: 'var(--joy-palette-success-500)' }}
                      />
                    </Box>
                    
                    {/* Task content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography 
                          level="body-sm" 
                          fontWeight="md" 
                          sx={{ 
                            color: 'text.primary',
                            flexGrow: 1,
                          }}
                        >
                          {task.title}
                        </Typography>
                        {task.priority && (
                          <Chip
                            size="sm"
                            color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'neutral'}
                            variant="soft"
                          >
                            {task.priority}
                          </Chip>
                        )}
                      </Box>
                      {task.description && (
                        <Typography level="body-xs" sx={{ mt: 0.5, color: 'neutral.300' }}>
                          {task.description}
                        </Typography>
                      )}
                      {task.due_date && (
                        <Typography level="body-xs" sx={{ mt: 0.5, color: 'neutral.300' }}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}