'use client'

import { useState, useEffect } from 'react'
import { Box, Input, IconButton, FormControl, Chip, Typography, Alert } from '@mui/joy'
import { Add, Schedule, Flag, FolderOpen, AutoAwesome } from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { NaturalLanguageTaskParser } from '@/utils/naturalLanguageParser'
import { Task } from '@/types'

interface AddTaskBarProps {
  onAdd: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  placeholder?: string
}

export function AddTaskBar({ onAdd, placeholder = "Add a task... (try: 'Review Code #tomorrow !high $Website')" }: AddTaskBarProps) {
  const [title, setTitle] = useState('')
  const [parser, setParser] = useState<NaturalLanguageTaskParser | null>(null)
  const [parsedPreview, setParsedPreview] = useState<any>(null)
  const { projects } = useTaskStore()

  // Initialize parser when projects are loaded
  useEffect(() => {
    // Always initialize parser, even without projects
    setParser(new NaturalLanguageTaskParser(projects))
  }, [projects])

  // Parse input as user types
  useEffect(() => {
    if (parser && title.trim()) {
      const result = parser.parse(title)
      if (result.confidence > 0.5) {
        setParsedPreview(result)
      } else {
        setParsedPreview(null)
      }
    } else {
      setParsedPreview(null)
    }
  }, [title, parser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      console.log('AddTaskBar: Processing task:', title)
      
      // Parse the natural language input
      const parseResult = parser?.parse(title)
      const parsedData = parseResult?.parsed
      
      console.log('AddTaskBar: Parse result:', parseResult)

      if (!parsedData || !parsedData.title) {
        console.log('AddTaskBar: No valid parsed data, creating simple task')
        // Fallback to simple task creation
        const simpleTask = {
          title: title.trim(),
          status: 'todo' as const,
          is_feature: false
        }
        console.log('AddTaskBar: Simple task data:', simpleTask)
        onAdd(simpleTask)
        setTitle('')
        setParsedPreview(null)
        return
      }

      // Create the task with parsed data
      const taskData = {
        title: parsedData.title,
        status: 'todo' as const,
        is_feature: false,
        // Add parsed fields if they exist
        ...(parsedData.priority && { priority: parsedData.priority }),
        ...(parsedData.due_date && { due_date: parsedData.due_date }),
        ...(parsedData.project_id && { project_id: parsedData.project_id }),
        ...(parsedData.description && { description: parsedData.description })
      }

      console.log('AddTaskBar: Parsed task data:', taskData)
      onAdd(taskData)
      setTitle('')
      setParsedPreview(null)
    } catch (error) {
      console.error('AddTaskBar: Error in handleSubmit:', error)
      // Fallback to simple task creation on error
      const fallbackTask = {
        title: title.trim(),
        status: 'todo' as const,
        is_feature: false
      }
      console.log('AddTaskBar: Using fallback task:', fallbackTask)
      onAdd(fallbackTask)
      setTitle('')
      setParsedPreview(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.surface',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'divider',
          '&:focus-within': {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 2px var(--joy-palette-primary-100)',
          },
        }}
      >
        <FormControl sx={{ flexGrow: 1 }}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            variant="plain"
            sx={{
              border: 'none',
              outline: 'none',
              '&:focus-within': {
                outline: 'none',
                border: 'none',
              },
              '& input': {
                color: 'white'
              }
            }}
            slotProps={{
              input: {
                style: {
                  fontSize: '16px',
                  padding: '8px 0',
                },
              },
            }}
          />
        </FormControl>
        
        <IconButton
          type="submit"
          variant="soft"
          color="primary"
          disabled={!title.trim()}
          sx={{
            minWidth: '40px',
            minHeight: '40px',
          }}
        >
          <Add />
        </IconButton>
      </Box>

      {/* Natural Language Preview */}
      {parsedPreview && (
        <Box sx={{ 
          px: 2, 
          py: 1, 
          bgcolor: 'background.level1', 
          borderRadius: 'sm',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AutoAwesome sx={{ fontSize: 16, color: 'primary.500' }} />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              AI Detected:
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {parsedPreview.parsed.title && (
              <Chip size="sm" variant="outlined" color="neutral">
                📝 {parsedPreview.parsed.title}
              </Chip>
            )}
            {parsedPreview.parsed.priority && (
              <Chip 
                size="sm" 
                variant="soft" 
                color={parsedPreview.parsed.priority === 'high' ? 'danger' : parsedPreview.parsed.priority === 'medium' ? 'warning' : 'success'}
                startDecorator={<Flag sx={{ fontSize: 14 }} />}
              >
                {parsedPreview.parsed.priority}
              </Chip>
            )}
            {parsedPreview.parsed.due_date && (
              <Chip 
                size="sm" 
                variant="soft" 
                color="primary"
                startDecorator={<Schedule sx={{ fontSize: 14 }} />}
              >
                {new Date(parsedPreview.parsed.due_date).toLocaleDateString()}
              </Chip>
            )}
            {parsedPreview.parsed.project_id && (
              <Chip 
                size="sm" 
                variant="soft" 
                color="primary"
                startDecorator={<FolderOpen sx={{ fontSize: 14 }} />}
              >
                {projects.find(p => p.id === parsedPreview.parsed.project_id)?.name || 'Project'}
              </Chip>
            )}
          </Box>

          {parsedPreview.suggestions && parsedPreview.suggestions.length > 0 && (
            <Alert variant="soft" color="neutral" sx={{ mt: 1, fontSize: '12px' }}>
              💡 {parsedPreview.suggestions[0]}
            </Alert>
          )}
        </Box>
      )}

      {/* Quick Reference */}
      <Box sx={{ 
        px: 2, 
        py: 1, 
        bgcolor: 'background.level1', 
        borderRadius: 'sm',
        opacity: 0.7,
        '&:hover': { opacity: 1 }
      }}>
        <Typography level="body-xs" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          💡 Quick syntax: <strong>#tomorrow</strong> for dates • <strong>!high</strong> for priority • <strong>$project</strong> for projects
        </Typography>
      </Box>
    </Box>
  )
}