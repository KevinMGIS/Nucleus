'use client'

import { useState } from 'react'
import { Box, Typography, Card, CardContent, Chip, IconButton, Input, Menu, MenuButton, MenuItem, Dropdown, Radio } from '@mui/joy'
import { Today, CalendarMonth, Archive, CheckCircle, Edit, MoreVert, Delete, Check, Close } from '@mui/icons-material'
import { Task, Project } from '@/types'

interface TaskCardProps {
  task: Task
  onEdit: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
}

function TaskCard({ task, onEdit, onDelete, onComplete, onDragStart, onDragEnd }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isDragging, setIsDragging] = useState(false)

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onEdit(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Card
      variant="soft"
      size="sm"
      draggable
      onDragStart={() => {
        setIsDragging(true)
        onDragStart(task)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        onDragEnd()
      }}
      sx={{
        p: 2,
        cursor: 'grab',
        transition: 'all 0.2s ease',
        bgcolor: 'neutral.100',  // Light grey background
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(5deg)' : 'none',
        '&:hover': {
          transform: isDragging ? 'rotate(5deg)' : 'translateY(-1px)',
          boxShadow: 'sm',
          bgcolor: 'neutral.200',  // Slightly darker on hover
        },
        '&:active': {
          cursor: 'grabbing',
          transform: 'scale(0.98)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Complete radio button */}
        <Radio
          checked={task.status === 'completed'}
          onChange={() => onComplete(task.id)}
          size="sm"
          sx={{
            mt: 0.5,
            '&.Mui-checked': {
              color: 'success.500',
            }
          }}
        />
        
        {/* Task content */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexGrow: 1 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                variant="outlined"
                size="sm"
                sx={{ 
                  flexGrow: 1,
                  '& input': {
                    color: 'white'
                  }
                }}
              />
              <IconButton size="sm" variant="soft" color="success" onClick={handleSave}>
                <Check />
              </IconButton>
              <IconButton size="sm" variant="soft" color="neutral" onClick={handleCancel}>
                <Close />
              </IconButton>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography 
                  level="body-sm" 
                  fontWeight="md" 
                  sx={{ 
                    color: 'white',
                    cursor: 'pointer',
                    flexGrow: 1,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setIsEditing(true)}
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
            </>
          )}
        </Box>

        {!isEditing && (
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{ root: { variant: 'plain', size: 'sm' } }}
            >
              <MoreVert />
            </MenuButton>
            <Menu placement="bottom-end">
              <MenuItem onClick={() => setIsEditing(true)}>
                <Edit />
                Edit
              </MenuItem>
              <MenuItem onClick={() => onComplete(task.id)}>
                <CheckCircle />
                Complete
              </MenuItem>
              <MenuItem onClick={() => onDelete(task.id)} color="danger">
                <Delete />
                Delete
              </MenuItem>
            </Menu>
          </Dropdown>
        )}
        </Box>
      </Box>
    </Card>
  )
}

interface TaskSectionProps {
  title: string
  icon: React.ReactNode
  tasks: Task[]
  projects: Project[]
  color: 'primary' | 'warning' | 'neutral' | 'success'
  sectionType: 'today' | 'week' | 'backlog'
  onComplete: (id: string) => void
  onEdit: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onSnooze: (id: string, until: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDrop: (sectionType: 'today' | 'week' | 'backlog') => void
  dragOverSection: string | null
  setDragOverSection: (section: string | null) => void
}

function TaskSection({ 
  title, 
  icon, 
  tasks, 
  projects, 
  color,
  sectionType,
  onComplete, 
  onEdit, 
  onDelete, 
  onSnooze,
  onDragStart,
  onDragEnd,
  onDrop,
  dragOverSection,
  setDragOverSection
}: TaskSectionProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        minHeight: '200px',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 'sm',
          borderColor: `${color}.300`,
        },
      }}
    >
      <CardContent>
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: `${color}.500`, display: 'flex' }}>
              {icon}
            </Box>
            <Typography level="h4" fontWeight="bold" sx={{ color: 'neutral.800' }}>
              {title}
            </Typography>
          </Box>
          <Chip
            size="sm"
            color={color}
            variant="soft"
          >
            {tasks.length}
          </Chip>
        </Box>

        {/* Tasks List */}
        <Box
          sx={{
            minHeight: '120px',
            p: 1,
            borderRadius: 'sm',
            backgroundColor: dragOverSection === sectionType ? `${color}.50` : 'background.level1',
            border: '2px dashed',
            borderColor: dragOverSection === sectionType ? `${color}.500` : (tasks.length > 0 ? 'transparent' : `${color}.200`),
            transition: 'all 0.2s ease',
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverSection(sectionType)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            // Only clear if leaving the actual drop zone, not a child element
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOverSection(null)
            }
          }}
          onDrop={(e) => {
            e.preventDefault()
            onDrop(sectionType)
            setDragOverSection(null)
          }}
        >
          {tasks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '120px',
                color: 'neutral.400',
              }}
            >
              <Typography level="body-sm">
                Drop tasks here or add new ones
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onComplete={onComplete}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

interface TaskSectionsProps {
  tasks: Task[]
  projects: Project[]
  onComplete: (id: string) => void
  onEdit: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onSnooze: (id: string, until: string) => void
}

export function TaskSections({
  tasks,
  projects,
  onComplete,
  onEdit,
  onDelete,
  onSnooze,
}: TaskSectionsProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  
  // Get end of week (7 days from now)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Filter tasks into sections
  const todayTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.due_date) return false
    const taskDateString = t.due_date.split('T')[0] // Get YYYY-MM-DD part
    return taskDateString === todayString
  })

  const thisWeekTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.due_date) return false
    const taskDate = new Date(t.due_date)
    const taskDateString = t.due_date.split('T')[0]
    
    // Include tasks from tomorrow through end of week
    return taskDateString !== todayString && taskDate <= weekFromNow && taskDate > today
  })

  const backlogTasks = tasks.filter(
    (t) => t.status !== 'completed' && !t.due_date
  )

  // Handle dropping tasks into different sections
  const handleDrop = (sectionType: 'today' | 'week' | 'backlog') => {
    if (!draggedTask) return
    
    let newDueDate: string | null = null
    
    switch (sectionType) {
      case 'today':
        newDueDate = todayString
        break
      case 'week':
        // Set to tomorrow if dropping in "This Week"
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        newDueDate = tomorrow.toISOString().split('T')[0]
        break
      case 'backlog':
        newDueDate = null
        break
    }
    
    onEdit(draggedTask.id, { due_date: newDueDate || undefined })
    setDraggedTask(null)
    setDragOverSection(null)
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverSection(null)
  }

  return (
    <Box>
      <TaskSection
        title="Today"
        icon={<Today />}
        tasks={todayTasks}
        projects={projects}
        color="primary"
        sectionType="today"
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onSnooze={onSnooze}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        dragOverSection={dragOverSection}
        setDragOverSection={setDragOverSection}
      />

      <TaskSection
        title="This Week"
        icon={<CalendarMonth />}
        tasks={thisWeekTasks}
        projects={projects}
        color="warning"
        sectionType="week"
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onSnooze={onSnooze}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        dragOverSection={dragOverSection}
        setDragOverSection={setDragOverSection}
      />

      <TaskSection
        title="Backlog"
        icon={<Archive />}
        tasks={backlogTasks}
        projects={projects}
        color="neutral"
        sectionType="backlog"
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onSnooze={onSnooze}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        dragOverSection={dragOverSection}
        setDragOverSection={setDragOverSection}
      />
    </Box>
  )
}