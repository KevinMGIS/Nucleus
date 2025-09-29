'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  Box,
  Link,
  Divider,
} from '@mui/joy'
import { auth } from '@/lib/supabase'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onToggleMode: () => void
  onSuccess?: () => void
}

export function AuthForm({ mode, onToggleMode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await auth.signIn(email, password)
        if (error) throw error
        setMessage('Logged in successfully!')
        onSuccess?.()
      } else {
        const { error } = await auth.signUp(email, password)
        if (error) throw error
        setMessage('Account created! Please check your email to confirm your account.')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <CardContent>
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert color="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ color: 'neutral.700' }}>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </FormControl>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel sx={{ color: 'neutral.700' }}>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            sx={{ mb: 2 }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}