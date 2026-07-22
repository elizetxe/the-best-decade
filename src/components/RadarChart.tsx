import { DIMENSION_LABELS, DIMENSIONS } from '../data/content'
import type { DimensionMap } from '../types'

interface Props {
  dimensions: DimensionMap
  size?: number
}

export function RadarChart({ dimensions, size = 280 }: Props) {
  const cx = 150
  const cy = 150
  const maxR = 78

  const points = DIMENSIONS.map((key, i) => {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
    const r = (dimensions[key] / 100) * maxR
    return {
      key,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      value: dimensions[key],
      angle,
    }
  })

  const poly = points.map((p) => `${p.x},${p.y}`).join(' ')

  // Fixed label slots — no clipping
  const labels = [
    { key: 'mobility' as const, x: 150, y: 28, anchor: 'middle' as const },
    { key: 'energy' as const, x: 278, y: 150, anchor: 'end' as const },
    { key: 'recovery' as const, x: 150, y: 278, anchor: 'middle' as const },
    { key: 'clarity' as const, x: 22, y: 150, anchor: 'start' as const },
  ]

  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className="mx-auto max-w-full"
      role="img"
      aria-label={`Dimension chart. Mobility ${dimensions.mobility}, Energy ${dimensions.energy}, Recovery ${dimensions.recovery}, Clarity ${dimensions.clarity}.`}
    >
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon
          key={t}
          points={DIMENSIONS.map((_, i) => {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
            const r = maxR * t
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
          }).join(' ')}
          fill="none"
          stroke="rgba(197,219,247,0.12)"
          strokeWidth="1"
        />
      ))}
      {DIMENSIONS.map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * maxR}
            y2={cy + Math.sin(angle) * maxR}
            stroke="rgba(197,219,247,0.15)"
          />
        )
      })}
      <polygon
        points={poly}
        fill="rgba(14,165,233,0.28)"
        stroke="#0EA5E9"
        strokeWidth="2.5"
      />
      {points.map((p) => (
        <circle
          key={p.key}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="#F7FAFF"
          stroke="#0EA5E9"
          strokeWidth="2"
        />
      ))}
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          dominantBaseline="middle"
          fill="#C5DBF7"
          fontSize="13"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
        >
          {DIMENSION_LABELS[l.key]} {dimensions[l.key]}
        </text>
      ))}
    </svg>
  )
}
