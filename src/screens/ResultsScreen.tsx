import { useEffect, useMemo, useState } from 'react'
import { DimensionBars } from '../components/DimensionBars'
import { Footer } from '../components/Footer'
import { Logo } from '../components/Logo'
import { RadarChart } from '../components/RadarChart'
import { RevivalCore } from '../components/RevivalCore'
import {
  ARCHETYPES,
  BADGES,
  DISCOVER_CARDS,
  DISCLOSURE_SHORT,
  FINAL_CHOICES,
  HOW_IT_WORKS_URL,
  QUIZ_URL,
} from '../data/content'
import { archetypeName } from '../lib/scoring'
import type { GameResult, PersistedState } from '../types'

interface Props {
  result: GameResult
  stats: PersistedState
  challengeScore: number | null
  shareStatus: string | null
  onPlayAgain: () => void
  onPlayDaily: () => void
  onShare: () => void
  onQuiz: () => void
  onHowItWorks: () => void
  onOpenDisclaimer: () => void
  shareCardUrl: string | null
}

export function ResultsScreen({
  result,
  stats,
  challengeScore,
  shareStatus,
  onPlayAgain,
  onPlayDaily,
  onShare,
  onQuiz,
  onHowItWorks,
  onOpenDisclaimer,
  shareCardUrl,
}: Props) {
  const [openCard, setOpenCard] = useState<string | null>(null)
  const [displayScore, setDisplayScore] = useState(0)
  const arch = ARCHETYPES.find((a) => a.id === result.archetype)
  const motivation = FINAL_CHOICES.find((f) => f.id === result.motivation)
  const earned = useMemo(
    () => BADGES.filter((b) => result.badges.includes(b.id)),
    [result.badges],
  )

  const isNewBest =
    result.score >= stats.highestScore && result.score > 0
  const gapToBest =
    stats.highestScore > result.score
      ? stats.highestScore - result.score
      : 0

  const comparison =
    challengeScore != null && challengeScore > 0
      ? result.score === challengeScore
        ? 'tie'
        : result.score > challengeScore
          ? 'win'
          : 'lose'
      : null

  // Satisfying score count-up
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 900
    const from = Math.max(0, result.score - 120)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setDisplayScore(Math.round(from + (result.score - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [result.score])

  const nextGoal = useMemo(() => {
    if (result.score < 700) return { label: 'Break 700', target: 700 }
    if (result.score < 800) return { label: 'Break 800', target: 800 }
    if (result.score < 900) return { label: 'Break 900', target: 900 }
    return { label: 'Perfect decade run', target: 950 }
  }, [result.score])

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-6 sm:max-w-xl sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-teal/25 blur-3xl" />
        {isNewBest && (
          <div className="absolute bottom-40 right-0 h-56 w-56 rounded-full bg-emerald/15 blur-3xl" />
        )}
      </div>

      <header className="flex items-center justify-between">
        <Logo height={32} />
        {stats.streak > 0 && (
          <span
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-sky-light"
            title="Daily play streak"
          >
            <span aria-hidden>🔥</span> {stats.streak}-day streak
          </span>
        )}
      </header>

      <main className="mt-6 animate-fade-up">
        {isNewBest && (
          <p className="mb-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-emerald">
            New personal best
          </p>
        )}
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Your Revival Score
        </p>
        <p
          className="score-pop mt-2 text-center font-display text-7xl font-bold tabular-nums tracking-tight text-cream sm:text-8xl"
          aria-live="polite"
        >
          {displayScore}
        </p>
        <p className="mt-1 text-center text-base text-soft">of 1,000</p>

        <h2 className="mt-5 text-center font-display text-2xl font-semibold text-teal sm:text-3xl">
          {archetypeName(result.archetype)}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-base text-sky-light">
          {arch?.description}
        </p>

        {comparison && (
          <div className="glass mt-5 rounded-2xl p-4 text-center" role="status">
            {comparison === 'win' && (
              <p className="font-display text-lg font-semibold text-emerald">
                You beat their {challengeScore}. Send the rematch.
              </p>
            )}
            {comparison === 'lose' && challengeScore != null && (
              <p className="font-display text-lg font-semibold text-sky-light">
                They scored {challengeScore}. {challengeScore - result.score} points away — run it back.
              </p>
            )}
            {comparison === 'tie' && (
              <p className="font-display text-lg font-semibold text-cream">
                Perfect tie at {challengeScore}. Rematch?
              </p>
            )}
          </div>
        )}

        {!isNewBest && gapToBest > 0 && (
          <p className="mt-4 text-center text-sm text-sky-light">
            <span className="font-semibold text-cream">{gapToBest} points</span> from your best.
            One more run.
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <RevivalCore dimensions={result.dimensions} size={200} celebrate />
        </div>

        <div className="mt-6">
          <RadarChart dimensions={result.dimensions} size={280} />
        </div>

        <div className="mt-6">
          <DimensionBars dimensions={result.dimensions} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-soft">
              Best combo
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-cream">
              {result.bestCombo}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-soft">
              Next goal
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-cream">
              {nextGoal.label}
            </p>
          </div>
        </div>

        {earned.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-soft">
              Badges earned
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {earned.map((b) => (
                <li
                  key={b.id}
                  className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-sm font-medium text-sky-light"
                  title={b.description}
                >
                  {b.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-lg leading-relaxed text-cream">
          {motivation?.sentence}
        </p>
        <p className="mt-3 text-center text-base text-soft">
          The score is fictional. The reason you chose is real.
        </p>

        {/* PRIMARY CTA — conversion heat */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-teal/35 bg-gradient-to-br from-teal/20 via-navy-mid/80 to-navy-deep p-5 shadow-xl shadow-teal/15">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal/25 blur-2xl"
            aria-hidden
          />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">
            Beyond the game
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-snug text-cream">
            Regenerative care, delivered to your door.
          </h3>
          <p className="mt-2 text-base leading-relaxed text-sky-light">
            The decade was practice. Your real options are personal — and may include
            clinician-led regenerative care at home, plus hormone, peptide, and NAD+
            programs through telehealth. Two minutes. Honest candidacy. No pressure.
          </p>
          <button
            type="button"
            onClick={onQuiz}
            className="btn-primary mt-5 min-h-14 w-full rounded-full px-6 text-lg font-bold tracking-tight shadow-lg shadow-teal/30"
          >
            See Options That Come to You →
          </button>
          <p className="mt-3 text-center text-sm text-soft">
            Licensed clinicians. Personalized plans. Not every person is a candidate —
            and that’s okay.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-soft">{DISCLOSURE_SHORT}</p>
        <p className="mt-2 text-center text-sm italic text-soft">
          Your Revival Score reflects the decisions made in this fictional strategy
          game. It is not a measure of your health or longevity.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onShare}
            className="btn-secondary min-h-14 rounded-full px-6 text-lg font-semibold"
          >
            Challenge a Friend — can they beat {result.score}?
          </button>
          {shareStatus && (
            <p className="text-center text-sm text-emerald" role="status">
              {shareStatus}
            </p>
          )}

          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-secondary min-h-14 rounded-full px-6 text-lg font-semibold"
          >
            {isNewBest ? 'Defend Your Best' : gapToBest > 0 ? `Chase Best (−${gapToBest})` : 'Play Again'}
          </button>
          <button
            type="button"
            onClick={onPlayDaily}
            className="btn-ghost min-h-12 text-base"
          >
            Play Today’s Decade Again
          </button>
          <button
            type="button"
            onClick={onHowItWorks}
            className="btn-ghost min-h-12 text-base"
          >
            How Regenerative Revival Works
          </button>
        </div>

        {/* Trust */}
        <ul className="mt-8 grid gap-2 text-center text-sm text-sky-light sm:grid-cols-3">
          <li className="glass rounded-xl px-3 py-3">Physician-led medical team</li>
          <li className="glass rounded-xl px-3 py-3">100+ licensed clinicians</li>
          <li className="glass rounded-xl px-3 py-3">Nationwide concierge care</li>
        </ul>

        {shareCardUrl && (
          <div className="mt-8">
            <p className="mb-3 text-center text-sm font-medium text-soft">
              Share card preview
            </p>
            <img
              src={shareCardUrl}
              alt="Share card with your Revival Score"
              className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 shadow-xl"
            />
            <a
              href={shareCardUrl}
              download="the-best-decade-score.png"
              className="mt-3 block text-center text-sm text-teal underline-offset-2 hover:underline"
            >
              Download share card
            </a>
          </div>
        )}

        <section className="mt-10" aria-label="Discover">
          <h3 className="font-display text-xl font-semibold text-cream">
            Discover
          </h3>
          <p className="mt-1 text-sm text-soft">
            High-level context only — not recommendations based on your score.
          </p>
          <div className="mt-4 space-y-3">
            {DISCOVER_CARDS.map((card) => {
              const open = openCard === card.id
              return (
                <div key={card.id} className="glass overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenCard(open ? null : card.id)}
                  >
                    <span className="font-display text-base font-semibold text-cream">
                      {card.title}
                    </span>
                    <span className="text-teal" aria-hidden>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  {open && (
                    <p className="border-t border-white/10 px-4 pb-4 pt-2 text-base text-sky-light">
                      {card.body}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer onOpenDisclaimer={onOpenDisclaimer} />
      <span className="sr-only">{HOW_IT_WORKS_URL}</span>
      <span className="sr-only">{QUIZ_URL}</span>
    </div>
  )
}
