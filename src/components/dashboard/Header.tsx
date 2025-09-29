'use client'

import { Box, Typography, Avatar, IconButton, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy'
import { DarkMode, LightMode, Settings, Logout } from '@mui/icons-material'
import { useColorScheme } from '@mui/joy/styles'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const { mode, setMode } = useColorScheme()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      // Redirect to login page after successful sign out
      router.push('/auth/login')
    } catch (error) {
      console.error('Error during sign out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.surface',
      }}
    >
      {/* Left side - could add breadcrumbs or page title here */}
      <Box />

      {/* Right side - user actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          variant="outlined"
          size="sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
        
        <IconButton
          variant="outlined"
          size="sm"
          aria-label="Settings"
        >
          <Settings />
        </IconButton>
        
        <Dropdown>
          <MenuButton
            slots={{ root: Avatar }}
            slotProps={{
              root: {
                size: 'sm',
                sx: { ml: 1 },
              },
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </MenuButton>
          <Menu placement="bottom-end">
            <MenuItem 
              onClick={handleSignOut}
              disabled={isSigningOut}
              sx={{ 
                color: isSigningOut ? 'neutral.400' : 'inherit',
                cursor: isSigningOut ? 'not-allowed' : 'pointer'
              }}
            >
              <Logout />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  )
}