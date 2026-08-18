'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (window.localStorage.getItem('cm-theme') as 'dark' | 'light' | null) ?? 'dark'
  })

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem('cm-theme', theme)
    }
  }, [mounted, theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-xl"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: theme === 'dark' ? '#A3E635' : '#F59E0B',
      }}
      aria-label="Changer le thème"
      type="button"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}