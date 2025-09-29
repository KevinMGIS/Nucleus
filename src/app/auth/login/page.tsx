'use client'

import { useRouter } from 'next/navigation'
import { Box, Container, Typography } from '@mui/joy'
import { AuthForm } from '@/components/auth/AuthForm'
import { NucleusSpinner } from '@/components/NucleusIcon'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <NucleusSpinner size={64} />
            <Typography
              level="h1"
              component="h1"
              fontSize="3rem"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg, var(--joy-palette-primary-500), var(--joy-palette-primary-700))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Nucleus
            </Typography>
          </Box>
          <Typography level="body-lg" color="neutral">
            Your personal cockpit for tasks and rituals
          </Typography>
        </Box>

        <AuthForm
          mode="login"
          onToggleMode={() => {}}
          onSuccess={handleSuccess}
        />
      </Box>
    </Container>
  )
}