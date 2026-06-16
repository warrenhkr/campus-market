'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: (e: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
})

// Initialise le thème depuis localStorage AVANT le premier render
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('cm-theme') as Theme) ?? 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)
  const [animating, setAnimating] = useState(false)

  // Applique la classe sur <html> sans setState dans l'effet
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('cm-theme', theme)
  }, [theme])

  const toggleTheme = (e: React.MouseEvent) => {
    if (animating) return
    setRipple({ x: e.clientX, y: e.clientY })
    setAnimating(true)

    setTimeout(() => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }, 350)

    setTimeout(() => {
      setRipple(null)
      setAnimating(false)
    }, 800)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key="liquid-ripple"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 80, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, delay: 0.6 },
            }}
            style={{
              position: 'fixed',
              top: ripple.y,
              left: ripple.x,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: theme === 'dark' ? '#FAFAFA' : '#0A0A0A',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)