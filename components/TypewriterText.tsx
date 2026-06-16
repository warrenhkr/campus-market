'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({
  text,
  speed = 40,
  className,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const prevText = useRef('')

  useEffect(() => {
    if (prevText.current === text) return
    prevText.current = text

    let i = 0
    let current = ''

    const timer = setInterval(() => {
      current = text.slice(0, i + 1)
      setDisplayed(current)
      i++
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-5 ml-0.5 align-middle"
          style={{ background: 'var(--primary)' }}
        />
      )}
    </span>
  )
}