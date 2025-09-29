'use client'

import { useState } from 'react'
import { Box, Input, IconButton, FormControl } from '@mui/joy'
import { Add } from '@mui/icons-material'

interface AddTaskBarProps {
  onAdd: (task: { title: string }) => void
  placeholder?: string
}

export function AddTaskBar({ onAdd, placeholder = "Add a task..." }: AddTaskBarProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd({ title: title.trim() })
      setTitle('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
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
  )
}