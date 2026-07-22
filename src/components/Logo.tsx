import { useState } from 'react'
import { LOGO_URL } from '../data/content'

interface Props {
  className?: string
  height?: number
  /** Light pill behind dark official logo for contrast on navy UI */
  onDark?: boolean
}

export function Logo({ className = '', height = 40, onDark = true }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`font-display font-semibold tracking-tight text-cream ${className}`}
        style={{ fontSize: Math.max(16, height * 0.45) }}
        role="img"
        aria-label="Regenerative Revival"
      >
        Regenerative <span className="text-teal">Revival</span>
      </div>
    )
  }

  const img = (
    <img
      src={LOGO_URL}
      alt="Regenerative Revival"
      height={height}
      className="w-auto object-contain"
      style={{ height }}
      onError={() => setFailed(true)}
      decoding="async"
    />
  )

  if (!onDark) {
    return <div className={className}>{img}</div>
  }

  return (
    <div
      className={`inline-flex items-center rounded-2xl bg-cream/95 px-3 py-2 shadow-sm ${className}`}
    >
      {img}
    </div>
  )
}
