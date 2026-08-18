'use client'

import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function useTheme() {
  return {
    theme: 'dark' as const,
    toggleTheme: () => undefined,
  }
}