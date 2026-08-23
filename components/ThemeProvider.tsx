'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('cm-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('cm-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}