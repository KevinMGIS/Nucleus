'use client'

import { Tabs, TabList, Tab, Chip } from '@mui/joy'
import { TaskFilter } from '@/types'

interface FilterTabsProps {
  currentFilter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  taskCounts: {
    today: number
    'this-week': number
    backlog: number
    completed: number
  }
}

export function FilterTabs({ currentFilter, onFilterChange, taskCounts }: FilterTabsProps) {
  const tabs = [
    { key: 'today' as TaskFilter, label: 'Today', count: taskCounts.today },
    { key: 'this-week' as TaskFilter, label: 'This Week', count: taskCounts['this-week'] },
    { key: 'backlog' as TaskFilter, label: 'Backlog', count: taskCounts.backlog },
    { key: 'completed' as TaskFilter, label: 'Completed', count: taskCounts.completed },
  ]

  return (
    <Tabs
      value={currentFilter}
      onChange={(_, value) => onFilterChange(value as TaskFilter)}
      sx={{ bgcolor: 'transparent' }}
    >
      <TabList
        variant="soft"
        sx={{
          borderRadius: 'lg',
          p: 0.5,
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderRadius: 'md',
              px: 2,
              py: 1,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <Chip
                size="sm"
                variant="soft"
                color={currentFilter === tab.key ? 'primary' : 'neutral'}
              >
                {tab.count}
              </Chip>
            )}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}