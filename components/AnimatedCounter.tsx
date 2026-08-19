interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({
  value,
  duration = 1500,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  void duration

  return (
    <span>
      {prefix}{new Intl.NumberFormat('fr-FR').format(value)}{suffix}
    </span>
  )
}