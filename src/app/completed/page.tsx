'use client'

import { useEffect } from 'react'
import { Box, Container, Typography, CircularProgress, Card, CardContent, Chip } from '@mui/joy'
import { CheckCircle } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Task, Project } from '@/types'

interface CompletedTaskCardProps {
  task: Task
  projects: Project[]
  onEdit: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
}

function CompletedTaskCard({ task, projects, onEdit, onDelete }: CompletedTaskCardProps) {
  const project = projects.find(p => p.id === task.project_id)
  
  const handleReopen = () => {
    onEdit(task.id, { status: 'todo' })
  }

  const handleDelete = () => {
    onDelete(task.id)
  }

  return (
    <Card
      variant="soft"
      color="success"
      size="sm"
      sx={{
        mb: 2,
        opacity: 0.8,
        transition: 'all 0.2s ease',
        '&:hover': {
          opacity: 1,
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: 'success.500', fontSize: '1.2rem' }} />
            <Typography 
              level="body-md" 
              fontWeight="md"
              sx={{ 
                textDecoration: 'line-through',
                color: 'success.700'
              }}
            >
              {task.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {task.priority && (
              <Chip
                size="sm"
                color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'neutral'}
                variant="soft"
              >
                {task.priority}
              </Chip>
            )}
            {project && (
              <Chip size="sm" variant="soft" color="neutral">
                {project.name}
              </Chip>
            )}
          </Box>
        </Box>
        
        {task.description && (
          <Typography level="body-sm" color="neutral" sx={{ mb: 1, fontStyle: 'italic' }}>
            {task.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {task.completed_at && (
              <Typography level="body-xs" color="success">
                Completed: {new Date(task.completed_at).toLocaleDateString()}
              </Typography>
            )}
            {task.due_date && (
              <Typography level="body-xs" color="neutral">
                Was due: {new Date(task.due_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography
              level="body-xs"
              sx={{ 
                cursor: 'pointer',
                color: 'primary.500',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={handleReopen}
            >
              Reopen
            </Typography>
            <Typography
              level="body-xs"
              sx={{ 
                cursor: 'pointer',
                color: 'danger.500',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={handleDelete}
            >
              Delete
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function CompletedPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    fetchTasks,
    fetchProjects,
    updateTask,
    deleteTask,
  } = useTaskStore()

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [fetchTasks, fetchProjects])

  const completedTasks = tasks.filter((t) => t.status === 'completed')

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
              <CheckCircle sx={{ color: 'success.500', fontSize: '2rem' }} />
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'neutral.800' }}
              >
                Completed Tasks
              </Typography>
              <Chip size="lg" color="success" variant="soft">
                {completedTasks.length}
              </Chip>
            </Box>
            <Typography level="body-lg" color="neutral">
              View and manage your completed tasks
            </Typography>
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

          {/* Completed Tasks */}
          {completedTasks.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: '3rem', color: 'neutral.300', mb: 2 }} />
                <Typography level="h3" color="neutral" mb={1}>
                  No completed tasks yet
                </Typography>
                <Typography level="body-md" color="neutral">
                  Tasks you complete will appear here for review and management.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {completedTasks.map((task) => (
                <CompletedTaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onEdit={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </Box>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}