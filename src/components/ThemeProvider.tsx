'use client'

import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'
import { extendTheme } from '@mui/joy/styles'
import { ReactNode } from 'react'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        background: {
          body: '#fafafa',
          surface: '#ffffff',
          level1: '#f5f5f5',
          level2: '#e5e5e5',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Orange for warnings
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#7c2d12',
          100: '#9a3412',
          200: '#c2410c',
          300: '#ea580c',
          400: '#f97316',
          500: '#fb923c', // Lighter orange for dark mode
          600: '#fdba74',
          700: '#fed7aa',
          800: '#ffedd5',
          900: '#fff7ed',
        },
        neutral: {
          50: '#171717',
          100: '#262626',
          200: '#404040',
          300: '#525252',
          400: '#a3a3a3', // Lighter for better readability
          500: '#d4d4d4', // Much lighter for main text
          600: '#e5e5e5', // Even lighter for emphasis
          700: '#f5f5f5', // Very light for headings
          800: '#fafafa', // Near white for high contrast text
          900: '#ffffff', // Pure white for maximum contrast
        },
        background: {
          body: '#121212',
          surface: '#1e1e1e',
          level1: '#262626',
          level2: '#404040',
        },
        warning: {
          50: '#7c2d12',
          100: '#9a3412',
          200: '#c2410c',
          300: '#ea580c',
          400: '#f97316',
          500: '#fb923c', // Orange for dark mode warnings
          600: '#fdba74',
          700: '#fed7aa',
          800: '#ffedd5',
          900: '#fff7ed',
        },
      },
    },
  },
})

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CssVarsProvider 
      theme={theme} 
      defaultMode="system"
      modeStorageKey="nucleus-theme-mode"
      colorSchemeStorageKey="nucleus-color-scheme"
    >
      <CssBaseline />
      {children}
    </CssVarsProvider>
  )
}