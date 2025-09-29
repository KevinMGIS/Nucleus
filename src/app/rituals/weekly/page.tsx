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
  Radio,
  IconButton,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Menu,
  MenuItem,
  Dropdown,
  MenuButton
} from '@mui/joy'
import { 
  CalendarViewWeek, 
  CheckCircle, 
  Star, 
  TrendingUp,
  KeyboardArrowDown,
  MoreVert,
  Schedule,
  Done,
  MoveToInbox,
  PriorityHigh,
  Archive
} from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { useJournalStore } from '@/stores/journalStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Task, Project } from '@/types'

// Helper function to get current week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Helper function to get week date range
function getWeekRange(): { start: Date; end: Date; weekNumber: number } {
  const now = new Date()
  const currentDay = now.getDay()
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Monday as start of week
  
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  return {
    start: monday,
    end: sunday,
    weekNumber: getWeekNumber(now)
  }
}

export default function WeeklyReviewPage() {
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
    getWeekEntry,
    saveWeeklyReview,
  } = useJournalStore()

  const [highlight, setHighlight] = useState('')
  const [selectedAnchors, setSelectedAnchors] = useState<string[]>([])
  const [isCompletingReview, setIsCompletingReview] = useState(false)
  const [weekRange, setWeekRange] = useState(getWeekRange())

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    fetchEntries()
    setWeekRange(getWeekRange())
  }, [fetchTasks, fetchProjects, fetchEntries])

  // Filter tasks for current week's open work
  const openThisWeekTasks = tasks.filter(task => {
    if (task.status === 'completed') return false
    if (!task.due_date) return false
    
    const dueDate = new Date(task.due_date)
    return dueDate >= weekRange.start && dueDate <= weekRange.end
  })

  // Filter completed tasks for this week
  const completedThisWeekTasks = tasks.filter(task => {
    if (task.status !== 'completed' || !task.completed_at) return false
    
    const completedDate = new Date(task.completed_at)
    return completedDate >= weekRange.start && completedDate <= weekRange.end
  })

  // Filter tasks for next week's anchor selection
  const anchorCandidates = tasks.filter(task => {
    if (task.status === 'completed') return false
    // Include backlog tasks and next week tasks
    const dueDate = task.due_date ? new Date(task.due_date) : null
    return !dueDate || dueDate > weekRange.end
  })

  // Group open tasks by project
  const tasksByProject = openThisWeekTasks.reduce((acc, task) => {
    const projectId = task.project_id || 'no-project'
    if (!acc[projectId]) {
      acc[projectId] = []
    }
    acc[projectId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Check if weekly review is already completed
  const hasCompletedWeeklyReview = false // Will implement with journal store

  const handleCompleteWeeklyReview = async () => {
    if (isCompletingReview) return
    setIsCompletingReview(true)

    try {
      // Tag selected anchors with weekly focus
      for (const taskId of selectedAnchors) {
        await updateTask(taskId, { 
          weekly_focus: true,
          due_date: new Date(weekRange.end.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week
        })
      }

      // Save weekly review to journal
      await saveWeeklyReview({
        week_number: weekRange.weekNumber,
        year: weekRange.start.getFullYear(),
        completed_tasks_count: completedThisWeekTasks.length,
        highlight,
        anchor_tasks: selectedAnchors,
        open_tasks_count: openThisWeekTasks.length,
      })

      // Refresh tasks to show updates
      await fetchTasks()
    } catch (error) {
      console.error('Error completing weekly review:', error)
    } finally {
      setIsCompletingReview(false)
    }
  }

  const toggleAnchorSelection = (taskId: string) => {
    setSelectedAnchors(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId)
      } else if (prev.length < 5) {
        return [...prev, taskId]
      }
      return prev
    })
  }

  if (loading || journalLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size="lg" />
            </Box>
          </Container>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                level="h1" 
                component="h1"
                sx={{ color: 'text.primary' }}
              >
                Weekly Review
              </Typography>
              {hasCompletedWeeklyReview && (
                <Chip size="lg" color="success" variant="soft" startDecorator={<CheckCircle />}>
                  Completed
                </Chip>
              )}
            </Box>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              Week {weekRange.weekNumber} • {weekRange.start.toLocaleDateString()} - {weekRange.end.toLocaleDateString()}
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

          {/* Step 1: Review Open Work */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarViewWeek sx={{ color: 'primary.500' }} />
                Step 1: Review Open Work
                <Chip size="sm" variant="soft" color="primary">
                  {openThisWeekTasks.length} tasks
                </Chip>
              </Typography>

              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                Review your remaining tasks for this week. Take quick actions to organize your work.
              </Typography>

              {Object.keys(tasksByProject).length === 0 ? (
                <Alert color="success" sx={{ mb: 3 }}>
                  🎉 No open tasks for this week! You're all caught up.
                </Alert>
              ) : (
                <AccordionGroup>
                  {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
                    const project = projects.find(p => p.id === projectId)
                    const projectName = project?.name || 'No Project'
                    
                    return (
                      <Accordion key={projectId}>
                        <AccordionSummary>
                          <Typography level="title-md">
                            {projectName}
                            <Chip size="sm" variant="soft" color="neutral" sx={{ ml: 1 }}>
                              {projectTasks.length}
                            </Chip>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {projectTasks.map((task) => (
                              <OpenWorkTaskItem
                                key={task.id}
                                task={task}
                                onComplete={() => completeTask(task.id)}
                                onUpdate={(updates) => updateTask(task.id, updates)}
                                onDelete={() => deleteTask(task.id)}
                              />
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </AccordionGroup>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Wins & Reflection */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: 'success.500' }} />
                Step 2: Wins & Reflection
              </Typography>

              <Alert color="success" sx={{ mb: 3 }}>
                This week you completed <strong>{completedThisWeekTasks.length}</strong> tasks! 
                {completedThisWeekTasks.length > 0 && ' Great progress! 🎉'}
              </Alert>

              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                What was the highlight of your week? Celebrate your wins and reflect on your progress.
              </Typography>

              <Textarea
                placeholder="Share your highlight of the week... What went well? What are you proud of?"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                minRows={3}
                maxRows={6}
                sx={{ mb: 2 }}
              />

              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                Your reflection will be saved in your weekly journal.
              </Typography>
            </CardContent>
          </Card>

          {/* Step 3: Set Next Week's Anchors */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star sx={{ color: 'warning.500' }} />
                Step 3: Set Next Week's Anchors
                <Chip size="sm" variant="soft" color="warning">
                  {selectedAnchors.length}/5 selected
                </Chip>
              </Typography>

              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                Choose 3-5 key tasks to focus on next week. These will become your weekly anchors.
              </Typography>

              {anchorCandidates.length === 0 ? (
                <Alert color="neutral">
                  No tasks available for next week's anchors. Consider adding some tasks to your backlog.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {anchorCandidates.slice(0, 20).map((task) => (
                    <AnchorTaskCard
                      key={task.id}
                      task={task}
                      isSelected={selectedAnchors.includes(task.id)}
                      onToggle={() => toggleAnchorSelection(task.id)}
                      projects={projects}
                      disabled={!selectedAnchors.includes(task.id) && selectedAnchors.length >= 5}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Complete Review Action */}
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button
              size="lg"
              color="primary"
              variant="solid"
              disabled={isCompletingReview || selectedAnchors.length === 0}
              loading={isCompletingReview}
              onClick={handleCompleteWeeklyReview}
              startDecorator={<CheckCircle />}
            >
              {isCompletingReview ? 'Completing Review...' : 'Complete Weekly Review'}
            </Button>
            
            {hasCompletedWeeklyReview && (
              <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 1 }}>
                Review completed! You can update your reflection anytime.
              </Typography>
            )}
          </Box>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Open Work Task Item Component
interface OpenWorkTaskItemProps {
  task: Task
  onComplete: () => void
  onUpdate: (updates: Partial<Task>) => void
  onDelete: () => void
}

function OpenWorkTaskItem({ task, onComplete, onUpdate, onDelete }: OpenWorkTaskItemProps) {
  return (
    <ListItem>
      <ListItemDecorator>
        <Radio
          checked={false}
          onChange={onComplete}
          style={{ accentColor: 'var(--joy-palette-success-500)' }}
        />
      </ListItemDecorator>
      
      <ListItemContent sx={{ flexGrow: 1 }}>
        <Typography level="body-sm" fontWeight="md" sx={{ color: 'text.primary' }}>
          {task.title}
        </Typography>
        {task.description && (
          <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {task.description}
          </Typography>
        )}
        {task.due_date && (
          <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Typography>
        )}
      </ListItemContent>

      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
        >
          <MoreVert />
        </MenuButton>
        <Menu>
          <MenuItem onClick={onComplete}>
            <ListItemDecorator><Done /></ListItemDecorator>
            Mark Complete
          </MenuItem>
          <MenuItem onClick={() => onUpdate({ due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })}>
            <ListItemDecorator><Schedule /></ListItemDecorator>
            Snooze (1 week)
          </MenuItem>
          <MenuItem onClick={() => onUpdate({ due_date: undefined })}>
            <ListItemDecorator><MoveToInbox /></ListItemDecorator>
            Move to Backlog
          </MenuItem>
          <MenuItem onClick={() => onUpdate({ priority: 'high' })}>
            <ListItemDecorator><PriorityHigh /></ListItemDecorator>
            Set High Priority
          </MenuItem>
          <MenuItem onClick={onDelete} color="danger">
            <ListItemDecorator><Archive /></ListItemDecorator>
            Delete Task
          </MenuItem>
        </Menu>
      </Dropdown>
    </ListItem>
  )
}

// Anchor Task Card Component
interface AnchorTaskCardProps {
  task: Task
  isSelected: boolean
  onToggle: () => void
  projects: Project[]
  disabled: boolean
}

function AnchorTaskCard({ task, isSelected, onToggle, projects, disabled }: AnchorTaskCardProps) {
  const project = projects.find(p => p.id === task.project_id)

  return (
    <Card
      variant={isSelected ? "solid" : "outlined"}
      color={isSelected ? "primary" : "neutral"}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        '&:hover': disabled ? {} : {
          transform: 'translateY(-2px)',
          boxShadow: 'sm'
        }
      }}
      onClick={disabled ? undefined : onToggle}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            level="body-sm" 
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
            level="body-xs" 
            sx={{ 
              mt: 1, 
              color: isSelected ? 'primary.200' : 'text.secondary' 
            }}
          >
            {task.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}