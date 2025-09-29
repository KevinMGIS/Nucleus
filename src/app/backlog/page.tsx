'use client'

import { useEffect } from 'react'
import { Box, Container, Typography, CircularProgress, Card, CardContent, Chip } from '@mui/joy'
import { Archive } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AddTaskBar } from '@/components/dashboard/AddTaskBar'
import { StatsCards } from '@/components/dashboard/StatsCards'

export default function BacklogPage() {
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

  // Filter tasks for backlog (no due date and not completed)
  const backlogTasks = tasks.filter((t) => 
    t.status !== 'completed' && !t.due_date
  )

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
              <Archive sx={{ color: 'neutral.500', fontSize: '2rem' }} />
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'neutral.800' }}
              >
                Backlog
              </Typography>
              <Chip size="lg" color="neutral" variant="soft">
                {backlogTasks.length}
              </Chip>
            </Box>
            <Typography level="body-lg" color="neutral">
              Ideas and tasks for future planning
            </Typography>
          </Box>

          {/* Stats for backlog tasks */}
          <StatsCards tasks={backlogTasks} mb={4} />

          {/* Add Task Bar */}
          <Box mb={4}>
            <AddTaskBar
              onAdd={addTask}
              placeholder="Add an idea to your backlog... (press Enter to save)"
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

          {/* Backlog Tasks */}
          {backlogTasks.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Archive sx={{ fontSize: '3rem', color: 'neutral.300', mb: 2 }} />
                <Typography level="h3" color="neutral" mb={1}>
                  Your backlog is empty
                </Typography>
                <Typography level="body-md" color="neutral">
                  Capture ideas and tasks here for future planning. Tasks without due dates automatically go to your backlog.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {backlogTasks.map((task) => (
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