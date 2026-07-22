import type { DimensionMap } from '../types'
import { isWholePicture } from '../lib/scoring'

interface Props {
  dimensions: DimensionMap
  size?: number
  celebrate?: boolean
  className?: string
}

export function RevivalCore({
  dimensions,
  size = 220,
  celebrate = false,
  className = '',
}: Props) {
  const { mobility, energy, recovery, clarity } = dimensions
  const whole = isWholePicture(dimensions)
  const cx = 100
  const cy = 100

  const rings = [
    { key: 'mobility', label: 'Mobility', value: mobility, color: '#0EA5E9', r: 78 },
    { key: 'energy', label: 'Energy', value: energy, color: '#00BB7F', r: 62 },
    { key: 'recovery', label: 'Recovery', value: recovery, color: '#71A7F5', r: 46 },
    { key: 'clarity', label: 'Clarity', value: clarity, color: '#C5DBF7', r: 30 },
  ]

  const avg = (mobility + energy + recovery + clarity) / 4

  return (
    <div
      className={`relative mx-auto ${className} ${whole || celebrate ? 'animate-ring-glow' : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Revival Core. Mobility ${mobility}, Energy ${energy}, Recovery ${recovery}, Clarity ${clarity}.`}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(14,165,233,0.35)" />
            <stop offset="55%" stopColor="rgba(2,30,60,0.15)" />
            <stop offset="100%" stopColor="rgba(11,14,22,0)" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={92} fill="url(#coreGlow)" />

        {/* Connection lines when whole picture */}
        {whole &&
          rings.map((ring, i) => {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
            const x = cx + Math.cos(angle) * 70
            const y = cy + Math.sin(angle) * 70
            return (
              <line
                key={`line-${ring.key}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgba(14,165,233,0.35)"
                strokeWidth="1.5"
              />
            )
          })}

        {rings.map((ring) => {
          const progress = ring.value / 100
          const strokeW = 5 + progress * 4
          const opacity = 0.35 + progress * 0.55
          const grow = 1 + (progress - 0.6) * 0.08
          return (
            <g key={ring.key}>
              <circle
                cx={cx}
                cy={cy}
                r={ring.r * grow}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeW + 2}
              />
              <circle
                cx={cx}
                cy={cy}
                r={ring.r * grow}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeW}
                strokeOpacity={opacity}
                strokeDasharray={`${2 * Math.PI * ring.r * progress} ${2 * Math.PI * ring.r}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                className={whole ? 'animate-soft-pulse' : ''}
              />
            </g>
          )
        })}

        {/* Center nucleus */}
        <circle
          cx={cx}
          cy={cy}
          r={16 + (avg / 100) * 6}
          fill={whole ? 'rgba(14,165,233,0.45)' : 'rgba(14,165,233,0.22)'}
          stroke="rgba(197,219,247,0.45)"
          strokeWidth="1.5"
          className="animate-soft-pulse"
        />
        <circle cx={cx} cy={cy} r={6} fill="#F7FAFF" opacity={0.85} />
      </svg>

      {/* Dimension chips */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { label: 'M', value: mobility, style: { top: '2%', left: '50%', transform: 'translateX(-50%)' } },
          { label: 'E', value: energy, style: { top: '50%', right: '0%', transform: 'translateY(-50%)' } },
          { label: 'R', value: recovery, style: { bottom: '2%', left: '50%', transform: 'translateX(-50%)' } },
          { label: 'C', value: clarity, style: { top: '50%', left: '0%', transform: 'translateY(-50%)' } },
        ].map((d) => (
          <span
            key={d.label}
            className="absolute rounded-full border border-white/10 bg-navy-deep/70 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sky-light backdrop-blur-sm"
            style={d.style}
          >
            {d.label} {d.value}
          </span>
        ))}
      </div>
    </div>
  )
}
