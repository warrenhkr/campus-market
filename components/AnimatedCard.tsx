import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  index?: number
}

export function AnimatedCard({ children, className, index = 0 }: AnimatedCardProps) {
  return (
    <div
      className={[
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1',
        className,
      ].join(' ')}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {children}
    </div>
  )
}