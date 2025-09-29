import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import ThemeProvider from '@/components/ThemeProvider'
import IPadDesktopForcer from '@/components/iPadDesktopForcer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nucleus - Personal Task & Ritual Cockpit',
  description: 'A fast, simple, and habit-friendly place to capture, prioritize, and review your tasks and rituals.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Ensure iPads get desktop experience
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#fb923c' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <IPadDesktopForcer />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}