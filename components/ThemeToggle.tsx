'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

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