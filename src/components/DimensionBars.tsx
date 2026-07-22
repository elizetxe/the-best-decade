import { DIMENSION_LABELS, DIMENSIONS } from '../data/content'
import type { Dimension, DimensionMap } from '../types'

interface Props {
  dimensions: DimensionMap
  deltas?: Partial<DimensionMap>
  compact?: boolean
}

const COLORS: Record<Dimension, string> = {
  mobility: 'bg-teal',
  energy: 'bg-emerald',
  recovery: 'bg-sky',
  clarity: 'bg-sky-light',
}

export function DimensionBars({ dimensions, deltas, compact }: Props) {
  return (
    <div className={`grid gap-3 ${compact ? 'gap-2' : ''}`} aria-live="polite">
      {DIMENSIONS.map((key) => {
        const val = dimensions[key]
        const delta = deltas?.[key]
        return (
          <div key={key}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-sky-light sm:text-base">
                {DIMENSION_LABELS[key]}
              </span>
              <span className="font-display text-sm font-semibold tabular-nums text-cream sm:text-base">
                {val}
                {typeof delta === 'number' && delta !== 0 && (
                  <span
                    className={`ml-2 text-sm font-semibold ${
                      delta > 0 ? 'text-emerald' : 'text-soft'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-white/10"
              role="meter"
              aria-valuenow={val}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${DIMENSION_LABELS[key]} ${val} of 100`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${COLORS[key]}`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
