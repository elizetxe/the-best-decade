import { useState } from 'react'
import { LOGO_AVIF, LOGO_URL } from '../data/content'

interface Props {
  className?: string
  height?: number
  /** Light pill behind dark official logo for contrast on navy UI */
  onDark?: boolean
  /** Subtle space drift + glow — respects reduced motion */
  animated?: boolean
}

export function Logo({
  className = '',
  height = 40,
  onDark = true,
  animated = true,
}: Props) {
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
    <picture>
      <source srcSet={LOGO_AVIF} type="image/avif" />
      <img
        src={LOGO_URL}
        alt="Regenerative Revival"
        height={height}
        width={Math.round(height * 2.5)}
        className="relative z-[1] w-auto object-contain"
        style={{ height, imageRendering: 'auto' }}
        onError={() => setFailed(true)}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  )

  if (!onDark) {
    return (
      <div className={`${animated ? 'logo-orbit' : ''} ${className}`}>{img}</div>
    )
  }

  return (
    <div
      className={`logo-shell relative inline-flex items-center rounded-2xl bg-cream/95 px-3 py-2 shadow-sm ${
        animated ? 'logo-orbit' : ''
      } ${className}`}
    >
      <span className="logo-glow" aria-hidden />
      {img}
    </div>
  )
}
