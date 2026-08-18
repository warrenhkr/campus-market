'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: number
  readOnly?: boolean
}

export function StarRating({ value, onChange, size = 16, readOnly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const interactive = !readOnly && !!onChange
  const displayValue = hovered ?? value

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`} role={interactive ? 'radiogroup' : undefined} aria-label="Note">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const filled = starValue <= displayValue
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={interactive ? 'transition-transform hover:scale-110' : ''}
            style={{ background: 'transparent', border: 'none', padding: 0, lineHeight: 0 }}
            aria-label={`${starValue} étoile${starValue > 1 ? 's' : ''}`}
          >
            <Star size={size} fill={filled ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
          </button>
        )
      })}
    </div>
  )
}
