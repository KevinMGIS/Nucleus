'use client'

import { Box, List, ListItem, ListItemButton, ListItemContent, Typography, Divider, Card, CardContent, Chip } from '@mui/joy'
import { Dashboard, Today, CalendarMonth, Archive, CheckCircle, TrendingUp, EmojiEvents, LocalFireDepartment, WbSunny, NightlightRound, CalendarViewWeek } from '@mui/icons-material'
import { NucleusSpinner } from '@/components/NucleusIcon'
import { useRouter, usePathname } from 'next/navigation'
import { useTaskStore } from '@/stores/taskStore'
import { useJournalStore } from '@/stores/journalStore'
import { useEffect, useMemo } from 'react'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { tasks, fetchTasks } = useTaskStore()
  const { entries, fetchEntries } = useJournalStore()

  // Fetch data on component mount
  useEffect(() => {
    fetchTasks()
    fetchEntries()
  }, [fetchTasks, fetchEntries])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Today's completed tasks
    const todayCompleted = tasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at && 
      task.completed_at.startsWith(todayStr)
    ).length

    // This week's completed tasks
    const startOfWeek = new Date(today)
    const dayOfWeek = startOfWeek.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(today.getDate() + mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const thisWeekCompleted = tasks.filter(task => {
      if (task.status !== 'completed' || !task.completed_at) return false
      const completedDate = new Date(task.completed_at)
      return completedDate >= startOfWeek
    }).length

    // Check ritual completions
    const todayEntry = entries.find(entry => entry.date === todayStr && entry.type === 'daily')
    const hasMorningRitual = todayEntry?.morning_picks && todayEntry.morning_picks.length > 0
    const hasEveningRitual = todayEntry?.reflection && todayEntry.reflection.trim().length > 0

    // Weekly ritual check (current week)
    const currentWeekNumber = Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    const weeklyEntry = entries.find(entry => {
      if (entry.type !== 'weekly') return false
      const entryDate = new Date(entry.date)
      const entryYear = entryDate.getFullYear()
      const firstDayOfYear = new Date(entryYear, 0, 1)
      const pastDaysOfYear = (entryDate.getTime() - firstDayOfYear.getTime()) / 86400000
      const entryWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      return entryYear === today.getFullYear() && entryWeek === currentWeekNumber
    })
    const hasWeeklyReview = !!weeklyEntry

    // Calculate current streak (consecutive days with journal entries or completed tasks)
    const sortedEntries = [...entries]
      .filter(entry => entry.type === 'daily')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let currentStreak = 0
    let checkDate = new Date(today)
    
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasEntry = sortedEntries.some(entry => entry.date === dateStr)
      const hasCompletedTask = tasks.some(task => 
        task.status === 'completed' && 
        task.completed_at && 
        task.completed_at.startsWith(dateStr)
      )
      
      if (hasEntry || hasCompletedTask) {
        currentStreak++
      } else if (dateStr !== todayStr) { // Allow today to not have activity yet
        break
      }
      
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Weekly streak (consecutive weeks with weekly reviews)
    const weeklyEntries = [...entries]
      .filter(entry => entry.type === 'weekly')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    const weeklyStreak = Math.min(weeklyEntries.length, 8) // Show max 8 weeks

    return {
      todayCompleted,
      thisWeekCompleted,
      currentStreak,
      weeklyStreak,
      hasMorningRitual,
      hasEveningRitual,
      hasWeeklyReview
    }
  }, [tasks, entries])

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Today', icon: <Today />, path: '/today' },
    { label: 'This Week', icon: <CalendarMonth />, path: '/this-week' },
    { label: 'Backlog', icon: <Archive />, path: '/backlog' },
    { label: 'Completed', icon: <CheckCircle />, path: '/completed' },
  ]

  const ritualItems = [
    { label: 'Morning Ritual', path: '/rituals/morning' },
    { label: 'Evening Reflection', path: '/rituals/evening' },
    { label: 'Weekly Review', path: '/rituals/weekly' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

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
            sx={{ color: 'text.primary' }}
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
                selected={pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 'sm',
                  mb: 0.5,
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
                <ListItemContent>
                  <Typography level="body-sm" fontWeight={pathname === item.path ? 'md' : 'normal'}>
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
                onClick={() => handleNavigation(item.path)}
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

        {/* Stats & Streaks Section */}
        <Divider sx={{ my: 2 }} />
        
        <Typography level="body-xs" sx={{ px: 2, pb: 2, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Stats & Streaks
        </Typography>
        
        <Box sx={{ px: 1, pb: 2 }}>
          <Card variant="soft" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                  Today
                </Typography>
                <Chip size="sm" color="success" variant="soft">
                  {stats.todayCompleted}
                </Chip>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                  This Week
                </Typography>
                <Chip size="sm" color="primary" variant="soft">
                  {stats.thisWeekCompleted}
                </Chip>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              {/* Rituals Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WbSunny sx={{ fontSize: '14px', color: stats.hasMorningRitual ? 'warning.500' : 'neutral.400' }} />
                  <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                    Morning
                  </Typography>
                </Box>
                <Chip 
                  size="sm" 
                  color={stats.hasMorningRitual ? "success" : "neutral"} 
                  variant="soft"
                >
                  {stats.hasMorningRitual ? "✓" : "—"}
                </Chip>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <NightlightRound sx={{ fontSize: '14px', color: stats.hasEveningRitual ? 'primary.500' : 'neutral.400' }} />
                  <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                    Evening
                  </Typography>
                </Box>
                <Chip 
                  size="sm" 
                  color={stats.hasEveningRitual ? "success" : "neutral"} 
                  variant="soft"
                >
                  {stats.hasEveningRitual ? "✓" : "—"}
                </Chip>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarViewWeek sx={{ fontSize: '14px', color: stats.hasWeeklyReview ? 'success.500' : 'neutral.400' }} />
                  <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                    Weekly
                  </Typography>
                </Box>
                <Chip 
                  size="sm" 
                  color={stats.hasWeeklyReview ? "success" : "neutral"} 
                  variant="soft"
                >
                  {stats.hasWeeklyReview ? "✓" : "—"}
                </Chip>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocalFireDepartment sx={{ fontSize: '14px', color: 'warning.500' }} />
                  <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                    Daily Streak
                  </Typography>
                </Box>
                <Typography level="body-xs" fontWeight="bold" sx={{ color: 'warning.600' }}>
                  {stats.currentStreak} days
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmojiEvents sx={{ fontSize: '14px', color: 'success.500' }} />
                  <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                    Weekly
                  </Typography>
                </Box>
                <Typography level="body-xs" fontWeight="bold" sx={{ color: 'success.600' }}>
                  {stats.weeklyStreak} {stats.weeklyStreak === 1 ? 'week' : 'weeks'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}