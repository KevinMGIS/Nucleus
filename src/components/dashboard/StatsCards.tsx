'use client'

import { Box, Card, CardContent, Typography, Grid } from '@mui/joy'
import { Task } from '@/types'
import { format, isToday, isThisWeek } from 'date-fns'

interface StatsCardsProps {
  tasks: Task[]
  mb?: number
}

export function StatsCards({ tasks, mb }: StatsCardsProps) {
  // Calculate stats
  const todayCompleted = tasks.filter(
    task => task.status === 'completed' && 
    task.completed_at && 
    isToday(new Date(task.completed_at))
  ).length

  const thisWeekCompleted = tasks.filter(
    task => task.status === 'completed' && 
    task.completed_at && 
    isThisWeek(new Date(task.completed_at))
  ).length

  const totalActive = tasks.filter(task => task.status !== 'completed').length
  const totalCompleted = tasks.filter(task => task.status === 'completed').length

  const stats = [
    {
      label: 'Completed Today',
      value: todayCompleted,
      color: 'success' as const,
    },
    {
      label: 'This Week',
      value: thisWeekCompleted,
      color: 'primary' as const,
    },
    {
      label: 'Active Tasks',
      value: totalActive,
      color: 'warning' as const,
    },
    {
      label: 'All Completed',
      value: totalCompleted,
      color: 'neutral' as const,
    },
  ]

  return (
    <Box sx={{ mb }}>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid xs={12} sm={6} md={3} key={stat.label}>
            <Card
              variant="outlined"
              sx={{
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                },
              }}
            >
              <CardContent>
                <Typography
                  level="h2"
                  color={stat.color}
                  sx={{ fontSize: '2rem', fontWeight: 'bold', mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography level="body-sm" color="neutral">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}