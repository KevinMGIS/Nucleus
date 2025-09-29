'use client'

import { useEffect, useState } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Chip, 
  Button,
  Textarea,
  Divider,
  Alert,
  Radio
} from '@mui/joy'
import { NightlightRound, CheckCircle, AccessTime, Star, Today as TodayIcon } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { useJournalStore } from '@/stores/journalStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Task } from '@/types'

export default function EveningRitualPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    fetchTasks,
    fetchProjects,
    completeTask,
    updateTask,
    deleteTask,
  } = useTaskStore()

  const {
    loading: journalLoading,
    error: journalError,
    fetchEntries,
    getTodayEntry,
    saveEveningReflection,
  } = useJournalStore()

  const [reflection, setReflection] = useState('')
  const [isFinishingDay, setIsFinishingDay] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    fetchEntries()
  }, [fetchTasks, fetchProjects, fetchEntries])

  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]

  // Get today's journal entry and load existing reflection
  const todayEntry = getTodayEntry()
  const hasCompletedEveningRitual = todayEntry?.reflection !== undefined

  useEffect(() => {
    if (todayEntry?.reflection) {
      setReflection(todayEntry.reflection)
    }
  }, [todayEntry])

  // Filter tasks completed today
  const completedTodayTasks = tasks.filter((task) => {
    if (task.status !== 'completed' || !task.completed_at) return false
    
    // Check if completed today
    const completedDate = new Date(task.completed_at).toISOString().split('T')[0]
    return completedDate === todayString
  })

  // Filter remaining tasks for today (not completed)
  const remainingTodayTasks = tasks.filter((task) => {
    if (task.status === 'completed' || !task.due_date) return false
    const taskDateString = task.due_date.split('T')[0]
    return taskDateString === todayString
  })

  const handleFinishDay = async () => {
    if (isFinishingDay) return

    setIsFinishingDay(true)
    
    try {
      // Save reflection and completed task IDs to journal
      const completedTaskIds = completedTodayTasks.map(task => task.id)
      
      await saveEveningReflection(reflection, completedTaskIds)
      
    } catch (error) {
      console.error('Error finishing day:', error)
    } finally {
      setIsFinishingDay(false)
    }
  }

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
              <NightlightRound sx={{ color: 'primary.500', fontSize: '2rem' }} />
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'text.primary' }}
              >
                Evening Ritual
              </Typography>
              {hasCompletedEveningRitual && (
                <Chip size="lg" color="success" variant="soft" startDecorator={<CheckCircle />}>
                  Completed
                </Chip>
              )}
            </Box>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              Reflect on your day and celebrate your progress
            </Typography>
          </Box>

          {/* Error Display */}
          {(error || journalError) && (
            <Box
              mb={3}
              p={2}
              bgcolor="danger.50"
              borderRadius="sm"
              border="1px solid"
              borderColor="danger.200"
            >
              <Typography level="body-sm" color="danger">
                {error || journalError}
              </Typography>
            </Box>
          )}

          {/* Today's Remaining Tasks */}
          {remainingTodayTasks.length > 0 && (
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TodayIcon sx={{ color: 'primary.500' }} />
                  Today's Tasks
                  <Chip size="sm" variant="soft" color="primary">
                    {remainingTodayTasks.length} remaining
                  </Chip>
                </Typography>

                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                  Complete your remaining tasks for today to wrap up your day.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {remainingTodayTasks.map((task) => (
                    <TodaysTaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      onComplete={() => completeTask(task.id)}
                      onEdit={(updates: Partial<Task>) => updateTask(task.id, updates)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Today's Accomplishments */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'success.500' }} />
                Today's Accomplishments
                <Chip size="sm" variant="soft" color="success">
                  {completedTodayTasks.length}
                </Chip>
              </Typography>

              {completedTodayTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AccessTime sx={{ fontSize: '2rem', color: 'neutral.300', mb: 2 }} />
                  <Typography level="body-md" color="neutral" mb={1}>
                    No tasks completed today yet
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Complete some tasks throughout the day to see them here.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {completedTodayTasks.map((task) => (
                    <CompletedTaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Reflection Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star sx={{ color: 'warning.500' }} />
                Daily Reflection
                <Chip size="sm" variant="soft" color="neutral">
                  Optional
                </Chip>
              </Typography>

              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                Take a moment to reflect on your day. What went well? What did you learn?
              </Typography>

              <Textarea
                placeholder="Share your thoughts about today... (optional)"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                minRows={3}
                maxRows={6}
                sx={{ mb: 2 }}
              />

              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                Your reflection will be saved privately in your journal.
              </Typography>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          {(completedTodayTasks.length > 0 || remainingTodayTasks.length > 0) && (
            <Alert
              color={remainingTodayTasks.length === 0 ? "success" : "primary"}
              variant="soft"
              sx={{ mb: 4 }}
              startDecorator={remainingTodayTasks.length === 0 ? <CheckCircle /> : <TodayIcon />}
            >
              {remainingTodayTasks.length === 0 ? (
                <>
                  Perfect! You completed all {completedTodayTasks.length} task{completedTodayTasks.length !== 1 ? 's' : ''} for today. 
                  {completedTodayTasks.length >= 3 && " Outstanding productivity!"}
                </>
              ) : (
                <>
                  You've completed {completedTodayTasks.length} task{completedTodayTasks.length !== 1 ? 's' : ''} today. 
                  {remainingTodayTasks.length > 0 && ` ${remainingTodayTasks.length} task${remainingTodayTasks.length !== 1 ? 's' : ''} remaining to finish your day.`}
                </>
              )}
            </Alert>
          )}

          {/* Action Button */}
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button
              size="lg"
              color="primary"
              variant="solid"
              disabled={isFinishingDay}
              loading={isFinishingDay}
              onClick={handleFinishDay}
              startDecorator={<NightlightRound />}
            >
              {isFinishingDay ? 'Finishing Day...' : 'Finish Day'}
            </Button>
            
            {hasCompletedEveningRitual && (
              <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 1 }}>
                Day completed! You can update your reflection anytime.
              </Typography>
            )}
          </Box>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Completed Task Card Component
interface CompletedTaskCardProps {
  task: Task
  projects: any[]
}

function CompletedTaskCard({ task, projects }: CompletedTaskCardProps) {
  const project = projects.find(p => p.id === task.project_id)
  const completedTime = task.completed_at ? new Date(task.completed_at) : null

  return (
    <Card
      variant="soft"
      color="success"
      size="sm"
      sx={{
        opacity: 0.9,
        transition: 'all 0.2s ease',
        '&:hover': {
          opacity: 1,
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <CheckCircle sx={{ color: 'success.500', fontSize: '1.2rem', mt: 0.2 }} />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                level="body-md" 
                fontWeight="md"
                sx={{ 
                  color: 'success.700',
                  textDecoration: 'line-through',
                  flexGrow: 1,
                }}
              >
                {task.title}
              </Typography>
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
              <Typography level="body-sm" sx={{ mb: 1, color: 'success.600', fontStyle: 'italic' }}>
                {task.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {completedTime && (
                  <Typography level="body-xs" color="success">
                    Completed at {completedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// Today's Task Card Component (for remaining tasks)
interface TodaysTaskCardProps {
  task: Task
  projects: any[]
  onComplete: () => void
  onEdit: (updates: Partial<Task>) => void
  onDelete: () => void
}

function TodaysTaskCard({ task, projects, onComplete, onEdit, onDelete }: TodaysTaskCardProps) {
  const project = projects.find(p => p.id === task.project_id)

  return (
    <Card
      variant="soft"
      size="sm"
      sx={{
        p: 2,
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
        <Radio
          checked={task.status === 'completed'}
          onChange={onComplete}
          size="sm"
          sx={{
            mt: 0.5,
            '&.Mui-checked': {
              color: 'success.500',
            }
          }}
        />
        
        {/* Task content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              level="body-sm" 
              fontWeight="md" 
              sx={{ 
                color: 'white',
                flexGrow: 1,
              }}
            >
              {task.title}
            </Typography>
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
            <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
              {task.description}
            </Typography>
          )}
          {task.due_date && (
            <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Due today
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  )
}