'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Checkbox,
  IconButton,
  Chip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Input,
  Button,
} from '@mui/joy'
import { MoreVert, Edit, Delete, Snooze, Flag, FolderOpen, Rocket } from '@mui/icons-material'
import { Task, Project } from '@/types'
import { format, parseISO } from 'date-fns'

interface TaskItemProps {
  task: Task
  project?: Project
  onComplete: () => void
  onEdit: (updates: Partial<Task>) => void
  onDelete: () => void
  onSnooze: (until: string) => void
}

export function TaskItem({ task, project, onComplete, onEdit, onDelete, onSnooze }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleEdit = () => {
    if (isEditing && editTitle.trim() !== task.title) {
      onEdit({ title: editTitle.trim() })
    }
    setIsEditing(!isEditing)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit()
    }
    if (e.key === 'Escape') {
      setEditTitle(task.title)
      setIsEditing(false)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning' 
      case 'low': return 'neutral'
      default: return 'neutral'
    }
  }

  const handleSnooze = (hours: number) => {
    const snoozeUntil = new Date()
    snoozeUntil.setHours(snoozeUntil.getHours() + hours)
    onSnooze(snoozeUntil.toISOString())
  }

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        opacity: task.status === 'completed' ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.300',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Checkbox */}
          <Checkbox
            checked={task.status === 'completed'}
            onChange={onComplete}
            color="success"
            sx={{ mt: 0.5 }}
          />

          {/* Task Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Title */}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleEdit}
                autoFocus
                variant="plain"
                sx={{ fontSize: '1rem', fontWeight: 'md' }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {task.is_feature && (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    startDecorator={<Rocket />}
                  >
                    Feature
                  </Chip>
                )}
                {project && (
                  <Chip
                    size="sm"
                    variant="soft"
                    startDecorator={<FolderOpen />}
                    sx={{ 
                      backgroundColor: project.color || '#e3f2fd',
                      color: project.color ? '#fff' : 'text.primary',
                      borderColor: project.color || 'primary.300',
                    }}
                  >
                    {project.name}
                  </Chip>
                )}
                <Typography
                  level="body-md"
                  sx={{
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    fontWeight: task.is_feature ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsEditing(true)}
                >
                  {task.title}
                </Typography>
              </Box>
            )}

            {/* Metadata */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {/* Priority */}
              {task.priority && (
                <Chip
                  size="sm"
                  variant="soft"
                  color={getPriorityColor(task.priority)}
                  startDecorator={<Flag />}
                >
                  {task.priority}
                </Chip>
              )}

              {/* Due Date */}
              {task.due_date && (
                <Chip
                  size="sm"
                  variant="soft"
                  color={new Date(task.due_date) < new Date() ? 'danger' : 'primary'}
                >
                  {format(parseISO(task.due_date), 'MMM d')}
                </Chip>
              )}

              {/* Status */}
              {task.status === 'snoozed' && task.snoozed_until && (
                <Chip size="sm" variant="soft" color="warning">
                  Snoozed until {format(parseISO(task.snoozed_until), 'MMM d, h:mm a')}
                </Chip>
              )}
            </Box>
          </Box>

          {/* Actions Menu */}
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
              <MenuItem onClick={() => handleSnooze(1)}>
                <Snooze />
                Snooze 1h
              </MenuItem>
              <MenuItem onClick={() => handleSnooze(24)}>
                <Snooze />
                Snooze 1d
              </MenuItem>
              <MenuItem onClick={onDelete} color="danger">
                <Delete />
                Delete
              </MenuItem>
            </Menu>
          </Dropdown>
        </Box>
      </CardContent>
    </Card>
  )
}