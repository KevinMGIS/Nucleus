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
  Checkbox,
  Divider,
  Alert
} from '@mui/joy'
import { WbSunny, CheckCircle, AccessTime } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { useJournalStore } from '@/stores/journalStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Task } from '@/types'

export default function MorningRitualPage() {
  const {
    tasks,
    projects,
    loading,
    error,
    fetchTasks,
    fetchProjects,
    updateTask,
  } = useTaskStore()

  const {
    loading: journalLoading,
    error: journalError,
    fetchEntries,
    getTodayEntry,
    saveMorningPicks,
  } = useJournalStore()

  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isStartingDay, setIsStartingDay] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    fetchEntries()
  }, [fetchTasks, fetchProjects, fetchEntries])

  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  
  // Get end of week (7 days from now)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Filter tasks for backlog and this week (excluding already today tasks)
  const backlogTasks = tasks.filter((t) => 
    t.status !== 'completed' && !t.due_date
  )

  const thisWeekTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.due_date) return false
    const taskDate = new Date(t.due_date)
    const taskDateString = t.due_date.split('T')[0]
    
    // Include tasks from tomorrow through end of week (exclude today)
    return taskDateString !== todayString && taskDate <= weekFromNow && taskDate > today
  })

  // Check if ritual has been completed today
  const todayEntry = getTodayEntry()
  const hasCompletedRitual = todayEntry?.morning_picks && todayEntry.morning_picks.length > 0

  // Check if we already have tasks for today (ritual completed)
  const todayTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.due_date) return false
    const taskDateString = t.due_date.split('T')[0]
    return taskDateString === todayString
  })

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleStartDay = async () => {
    if (selectedTasks.length === 0 || selectedTasks.length > 3) {
      return
    }

    setIsStartingDay(true)
    
    try {
      // Update each selected task to have today as due date
      for (const taskId of selectedTasks) {
        await updateTask(taskId, { due_date: todayString })
      }
      
      // Save to journal table
      await saveMorningPicks(selectedTasks)
      setSelectedTasks([])
    } catch (error) {
      console.error('Error starting day:', error)
    } finally {
      setIsStartingDay(false)
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

  const availableTasks = [...backlogTasks, ...thisWeekTasks]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header */}
          <Box mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WbSunny sx={{ color: 'warning.500', fontSize: '2rem' }} />
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'text.primary' }}
              >
                Morning Ritual
              </Typography>
              {hasCompletedRitual && (
                <Chip size="lg" color="success" variant="soft" startDecorator={<CheckCircle />}>
                  Completed
                </Chip>
              )}
            </Box>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              Start your day with intention by picking 2–3 focus tasks
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

          {/* Ritual Completed State */}
          {hasCompletedRitual ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: '3rem', color: 'success.500', mb: 2 }} />
                <Typography level="h3" color="success" mb={1}>
                  Today's focus is set!
                </Typography>
                <Typography level="body-md" color="neutral" mb={3}>
                  You've selected your focus tasks for today. Check the Today view to see your picks.
                </Typography>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => window.location.reload()}
                >
                  Adjust Today's Focus
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Instructions */}
              <Alert
                color="primary"
                variant="soft"
                sx={{ mb: 4 }}
                startDecorator={<AccessTime />}
              >
                Select 2–3 tasks from your backlog or this week's tasks to focus on today. Quality over quantity!
              </Alert>

              {/* Task Selection */}
              {availableTasks.length === 0 ? (
                <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
                  <CardContent>
                    <WbSunny sx={{ fontSize: '3rem', color: 'neutral.300', mb: 2 }} />
                    <Typography level="h3" color="neutral" mb={1}>
                      No tasks available for selection
                    </Typography>
                    <Typography level="body-md" color="neutral">
                      Add some tasks to your backlog or schedule them for this week to start your morning ritual.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Backlog Tasks */}
                  {backlogTasks.length > 0 && (
                    <Box mb={4}>
                      <Typography level="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: 'neutral.500' }}>📋</Typography>
                        Backlog Tasks
                        <Chip size="sm" variant="soft" color="neutral">
                          {backlogTasks.length}
                        </Chip>
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {backlogTasks.map((task) => (
                          <TaskSelectionCard
                            key={task.id}
                            task={task}
                            projects={projects}
                            isSelected={selectedTasks.includes(task.id)}
                            onToggle={() => handleTaskToggle(task.id)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* This Week Tasks */}
                  {thisWeekTasks.length > 0 && (
                    <Box mb={4}>
                      <Typography level="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: 'warning.500' }}>📅</Typography>
                        This Week Tasks
                        <Chip size="sm" variant="soft" color="warning">
                          {thisWeekTasks.length}
                        </Chip>
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {thisWeekTasks.map((task) => (
                          <TaskSelectionCard
                            key={task.id}
                            task={task}
                            projects={projects}
                            isSelected={selectedTasks.includes(task.id)}
                            onToggle={() => handleTaskToggle(task.id)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Action Button */}
                  <Box sx={{ textAlign: 'center', pt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                      <Typography level="body-sm" color="neutral">
                        Selected: {selectedTasks.length}/3 tasks
                      </Typography>
                    </Box>
                    <Button
                      size="lg"
                      color="primary"
                      variant="solid"
                      disabled={selectedTasks.length === 0 || selectedTasks.length > 3 || isStartingDay}
                      loading={isStartingDay}
                      onClick={handleStartDay}
                      startDecorator={<WbSunny />}
                    >
                      {isStartingDay ? 'Starting Day...' : 'Start Day'}
                    </Button>
                    {selectedTasks.length > 3 && (
                      <Typography level="body-xs" color="danger" sx={{ mt: 1 }}>
                        Please select no more than 3 tasks for optimal focus
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Task Selection Card Component
interface TaskSelectionCardProps {
  task: Task
  projects: any[]
  isSelected: boolean
  onToggle: () => void
}

function TaskSelectionCard({ task, projects, isSelected, onToggle }: TaskSelectionCardProps) {
  const project = projects.find(p => p.id === task.project_id)

  return (
    <Card
      variant={isSelected ? "solid" : "outlined"}
      color={isSelected ? "primary" : "neutral"}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      }}
      onClick={onToggle}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Checkbox
            checked={isSelected}
            onChange={onToggle}
            size="sm"
            sx={{ mt: 0.5 }}
          />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                level="body-md" 
                fontWeight="md"
                sx={{ 
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  flexGrow: 1,
                }}
              >
                {task.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {task.priority && (
                  <Chip
                    size="sm"
                    color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}
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
              <Typography 
                level="body-sm" 
                sx={{ 
                  mt: 0.5, 
                  color: isSelected ? 'primary.100' : 'neutral.600' 
                }}
              >
                {task.description}
              </Typography>
            )}
            {task.due_date && (
              <Typography 
                level="body-xs" 
                sx={{ 
                  mt: 0.5, 
                  color: isSelected ? 'primary.200' : 'neutral.500' 
                }}
              >
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}