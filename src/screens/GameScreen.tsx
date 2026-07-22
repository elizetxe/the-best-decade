import { useEffect, useMemo, useRef } from 'react'
import { DimensionBars } from '../components/DimensionBars'
import { Logo } from '../components/Logo'
import { Particles } from '../components/Particles'
import { RevivalCore } from '../components/RevivalCore'
import { DAILY_MODIFIERS, DIMENSION_LABELS } from '../data/content'
import { phaseLabel } from '../lib/gameEngine'
import { comboHint, estimateLiveScore } from '../lib/scoring'
import type { Dimension, FinalMotivation, GameState, StrategyId } from '../types'

interface Props {
  state: GameState
  reducedMotion: boolean
  personalBest: number
  onChooseStrategy: (id: StrategyId) => void
  onContinue: () => void
  onChooseFinal: (id: FinalMotivation) => void
  onOpenDisclaimer: () => void
}

function impactTags(immediate: Partial<Record<Dimension, number>>): string[] {
  const tags: string[] = []
  ;(Object.keys(immediate) as Dimension[]).forEach((k) => {
    const v = immediate[k] ?? 0
    if (v >= 4) tags.push(`+${DIMENSION_LABELS[k]}`)
    else if (v <= -2) tags.push(`tradeoff`)
  })
  // de-dupe tradeoff
  return Array.from(new Set(tags)).slice(0, 3)
}

export function GameScreen({
  state,
  reducedMotion,
  personalBest,
  onChooseStrategy,
  onContinue,
  onChooseFinal,
  onOpenDisclaimer,
}: Props) {
  const mod = state.dailyModifier
    ? DAILY_MODIFIERS.find((m) => m.id === state.dailyModifier)
    : null

  const liveScore = useMemo(
    () => estimateLiveScore(state.dimensions, state.modifiers),
    [state.dimensions, state.modifiers],
  )

  const hint = useMemo(
    () =>
      state.phase === 'choice'
        ? comboHint(state.modifiers, state.dimensions)
        : null,
    [state.phase, state.modifiers, state.dimensions],
  )

  const vsBest =
    personalBest > 0
      ? liveScore - personalBest
      : null

  // Auto-advance feedback for a faster, more addictive loop
  const continueRef = useRef(onContinue)
  continueRef.current = onContinue
  useEffect(() => {
    if (state.phase !== 'feedback') return
    const delay = state.lastCombos.length > 0 ? (reducedMotion ? 900 : 1400) : reducedMotion ? 650 : 950
    const t = window.setTimeout(() => continueRef.current(), delay)
    return () => window.clearTimeout(t)
  }, [state.phase, state.year, state.lastCombos.length, reducedMotion])

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8 pt-4 sm:max-w-xl sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Logo height={28} />
        <div className="text-right">
          <p className="font-display text-sm font-semibold text-cream">
            Year {state.year}
            <span className="text-soft"> / 10</span>
          </p>
          <p className="text-xs text-soft">{phaseLabel(state.year)}</p>
        </div>
      </header>

      {/* Live race bar */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-soft">
            Pace score
          </p>
          <p
            key={liveScore}
            className="font-display text-xl font-bold tabular-nums text-cream score-pop"
            aria-live="polite"
          >
            {liveScore}
          </p>
        </div>
        <div className="text-right">
          {vsBest == null ? (
            <p className="text-xs text-sky-light">Set your first best</p>
          ) : vsBest >= 0 ? (
            <p className="text-sm font-semibold text-emerald">
              {vsBest === 0 ? 'Tied with best' : `+${vsBest} vs best`}
            </p>
          ) : (
            <p className="text-sm font-semibold text-sky">
              {vsBest} vs best
            </p>
          )}
          {personalBest > 0 && (
            <p className="text-[11px] text-soft">Best {personalBest}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={state.year}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-label={`Year ${state.year} of 10`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal via-sky to-emerald transition-all duration-300"
          style={{ width: `${(state.year / 10) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-wide text-soft">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={i < state.year ? 'text-teal' : ''}
            aria-hidden
          >
            {i + 1}
          </span>
        ))}
      </div>

      {mod && (
        <p className="mt-2 text-center text-xs font-medium uppercase tracking-wider text-teal">
          {mod.name}
        </p>
      )}

      <div className="mt-3 flex justify-center">
        <RevivalCore
          dimensions={state.dimensions}
          size={160}
          celebrate={state.lastCombos.length > 0}
        />
      </div>

      <div className="mt-3">
        <DimensionBars
          dimensions={state.dimensions}
          deltas={state.phase === 'feedback' ? state.lastDeltas : undefined}
          compact
        />
      </div>

      {hint && state.phase === 'choice' && (
        <p
          className="mt-3 rounded-xl border border-teal/25 bg-teal/10 px-3 py-2 text-center text-sm font-medium text-sky-light animate-fade-up"
          role="status"
        >
          {hint}
        </p>
      )}

      {/* Scenario */}
      <section className="glass relative mt-4 overflow-hidden rounded-3xl p-5">
        <Particles
          active={state.phase === 'feedback'}
          reducedMotion={reducedMotion}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
          This year
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-cream sm:text-2xl">
          {state.currentScenario?.text}
        </h2>
        {state.year === 1 && state.phase === 'choice' && (
          <p className="mt-3 text-sm text-soft">
            Protect the whole picture. Momentum compounds.
          </p>
        )}
        {state.phase === 'feedback' && (
          <div className="mt-4 animate-fade-up" role="status" aria-live="polite">
            {state.lastCombos.length > 0 && (
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {state.lastCombos.map((c) => (
                  <span
                    key={c}
                    className="combo-toast rounded-full bg-gradient-to-r from-teal/30 to-emerald/25 px-4 py-1.5 text-sm font-bold tracking-wide text-cream shadow-lg shadow-teal/20"
                  >
                    ✦ {c}
                  </span>
                ))}
              </div>
            )}
            <p className="text-base text-sky-light">{state.lastExplanation}</p>
            <p className="mt-3 text-center text-xs text-soft">
              Next year in a moment…
            </p>
          </div>
        )}
      </section>

      {/* Choices */}
      {state.phase === 'choice' && (
        <div className="mt-4 flex flex-col gap-3" role="list" aria-label="Strategy choices">
          <p className="text-sm font-medium text-sky-light">
            Tap a strategy — choose with intent
          </p>
          {state.currentChoices.map((choice, idx) => {
            const tags = impactTags(choice.effect.immediate)
            return (
              <button
                key={choice.id}
                type="button"
                role="listitem"
                onClick={() => onChooseStrategy(choice.id)}
                className="card-choice glass min-h-16 rounded-2xl px-5 py-4 text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="block font-display text-lg font-semibold text-cream">
                    {choice.title}
                  </span>
                  <span className="mt-0.5 shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-soft">
                    {idx + 1}
                  </span>
                </span>
                <span className="mt-1 block text-base text-sky-light">{choice.blurb}</span>
                {tags.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          t === 'tradeoff'
                            ? 'bg-white/5 text-soft'
                            : 'bg-teal/15 text-teal'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {state.phase === 'feedback' && (
        <button
          type="button"
          onClick={onContinue}
          className="btn-primary mt-5 min-h-14 w-full rounded-full px-6 text-lg font-semibold"
          autoFocus
        >
          {state.year >= 9 ? 'Final year →' : 'Next year →'}
        </button>
      )}

      {state.phase === 'final' && (
        <div className="mt-5 flex flex-col gap-3">
          <p className="font-display text-lg font-semibold text-cream">
            What are you protecting this for?
          </p>
          <p className="text-sm text-soft">
            This personalizes your close — it does not change medical advice.
          </p>
          {state.finalChoices.map((fc) => (
            <button
              key={fc.id}
              type="button"
              onClick={() => onChooseFinal(fc.id)}
              className="card-choice glass min-h-14 rounded-2xl px-5 py-4 text-left font-display text-lg font-semibold text-cream"
            >
              {fc.title}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenDisclaimer}
        className="mt-6 self-center text-sm text-soft underline-offset-2 hover:text-teal hover:underline"
      >
        Game, not medical advice
      </button>
    </div>
  )
}
