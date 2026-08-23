'use client'

import { Toaster } from 'sonner'
import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster theme="system" position="top-right" />
    </ThemeProvider>
  )
}
