'use client'

import { Box, List, ListItem, ListItemButton, ListItemContent, Typography, Divider } from '@mui/joy'
import { Dashboard, Today, CalendarMonth, Archive, Insights } from '@mui/icons-material'
import { NucleusSpinner } from '@/components/NucleusIcon'

export function Sidebar() {
  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard', active: true },
    { label: 'Today', icon: <Today />, path: '/dashboard?filter=today' },
    { label: 'This Week', icon: <CalendarMonth />, path: '/dashboard?filter=this-week' },
    { label: 'Backlog', icon: <Archive />, path: '/dashboard?filter=backlog' },
  ]

  const ritualItems = [
    { label: 'Morning Ritual', path: '/rituals/morning' },
    { label: 'Evening Reflection', path: '/rituals/evening' },
    { label: 'Weekly Review', path: '/rituals/weekly' },
  ]

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.surface',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NucleusSpinner size={36} />
          <Typography 
            level="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{ color: 'neutral.800' }}
          >
            Nucleus
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <List size="sm">
          {menuItems.map((item) => (
            <ListItem key={item.label}>
              <ListItemButton
                selected={item.active}
                sx={{
                  borderRadius: 'sm',
                  mb: 0.5,
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
                <ListItemContent>
                  <Typography level="body-sm" fontWeight={item.active ? 'md' : 'normal'}>
                    {item.label}
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Rituals Section */}
        <Typography level="body-xs" sx={{ px: 2, pb: 1, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Rituals
        </Typography>
        <List size="sm">
          {ritualItems.map((item) => (
            <ListItem key={item.label}>
              <ListItemButton
                sx={{
                  borderRadius: 'sm',
                  mb: 0.5,
                }}
              >
                <ListItemContent>
                  <Typography level="body-sm">
                    {item.label}
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Stats Section */}
        <Divider sx={{ my: 2 }} />
        
        <ListItem>
          <ListItemButton
            sx={{
              borderRadius: 'sm',
              mb: 0.5,
            }}
          >
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <Insights />
            </Box>
            <ListItemContent>
              <Typography level="body-sm">
                Stats & Streaks
              </Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )
}