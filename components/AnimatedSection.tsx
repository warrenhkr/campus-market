interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  // Keep the fade animation, but avoid moving the section in layout space.
  // The vertical transform was visually lifting the content and creating overlap
  // between headings and the cards underneath on seller pages.
  const directionMap = {
    up: '',
    down: '',
    left: '',
    right: '',
  } as const

  return (
    <div
      className={[
        'opacity-100 transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]',
        directionMap[direction],
        className,
      ].join(' ')}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}