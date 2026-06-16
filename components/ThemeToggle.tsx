'use client'

import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      />
    )
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
      aria-label="Changer le thème"
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: theme === 'dark'
            ? 'radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.4 }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.25, ease: 'backOut' }}
          className="relative z-10"
          style={{ color: theme === 'dark' ? '#A3E635' : '#F59E0B' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}