'use client'

import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="transition-all duration-300 ease-out animate-[fadeIn_0.35s_ease-out]">
      {children}
    </div>
  )
}