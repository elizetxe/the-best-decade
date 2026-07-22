interface Props {
  active: boolean
  reducedMotion?: boolean
}

export function Particles({ active, reducedMotion }: Props) {
  if (!active || reducedMotion) return null

  const dots = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-teal/70"
          style={{
            left: `${8 + ((i * 17) % 84)}%`,
            bottom: `${10 + (i % 5) * 8}%`,
            animation: `particle-rise ${0.9 + (i % 4) * 0.15}s ease-out ${i * 0.04}s both`,
          }}
        />
      ))}
    </div>
  )
}
