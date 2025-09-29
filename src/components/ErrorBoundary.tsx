'use client'

import React from 'react'
import { Box, Typography, Button } from '@mui/joy'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            padding: 4,
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.body'
          }}
        >
          <Typography level="h2" sx={{ mb: 2, color: 'text.primary' }}>
            Something went wrong
          </Typography>
          <Typography level="body-md" sx={{ mb: 3, color: 'text.secondary' }}>
            The application encountered an unexpected error.
          </Typography>
          
          {this.state.error && (
            <Box
              component="details"
              sx={{
                whiteSpace: 'pre-wrap',
                marginTop: 2,
                marginBottom: 3,
                padding: 2,
                bgcolor: 'background.level1',
                borderRadius: 'sm',
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: '600px',
                overflow: 'auto'
              }}
            >
              <Typography component="summary" level="body-sm" sx={{ cursor: 'pointer', mb: 1 }}>
                Error Details
              </Typography>
              <Typography level="body-xs" sx={{ fontFamily: 'monospace' }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
          
          <Button
            color="primary"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}