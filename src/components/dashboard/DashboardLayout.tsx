'use client'

import { ReactNode } from 'react'
import { Box, Sheet } from '@mui/joy'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Sheet
          sx={{
            flexGrow: 1,
            p: 0,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {children}
        </Sheet>
      </Box>
    </Box>
  )
}