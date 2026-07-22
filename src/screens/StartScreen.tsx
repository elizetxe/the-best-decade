import { Logo } from '../components/Logo'
import { RevivalCore } from '../components/RevivalCore'
import { Footer } from '../components/Footer'
import { DISCLOSURE_SHORT } from '../data/content'
import type { PersistedState } from '../types'

interface Props {
  stats: PersistedState
  todayBest: number
  challengeScore: number | null
  dailyModifierName: string | null
  onStart: () => void
  onDaily: () => void
  onTutorial: () => void
  onOpenDisclaimer: () => void
  soundOn: boolean
  onToggleSound: () => void
}

export function StartScreen({
  stats,
  todayBest,
  challengeScore,
  dailyModifierName,
  onStart,
  onDaily,
  onTutorial,
  onOpenDisclaimer,
  soundOn,
  onToggleSound,
}: Props) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-6 pt-6 sm:max-w-xl sm:px-8">
      {/* Background accents */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-teal/15 blur-3xl" />
        <div className="absolute -right-16 bottom-40 h-72 w-72 rounded-full bg-sky/10 blur-3xl" />
      </div>

      <header className="flex items-center justify-between gap-3">
        <Logo height={36} />
        <button
          type="button"
          onClick={onToggleSound}
          className="btn-secondary min-h-12 rounded-full px-4 text-sm font-medium"
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Sound on' : 'Sound off'}
        >
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>
      </header>

      <main className="mt-8 flex flex-1 flex-col">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Regenerative Revival
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-cream sm:text-5xl">
          The Best Decade
        </h1>
        <p className="mt-3 text-lg text-sky-light sm:text-xl">
          Ten years. Four dimensions. How well can you protect what matters?
        </p>
        <p className="mt-2 text-sm font-medium text-teal">
          60–90 seconds · Beat your best · Challenge a friend
        </p>

        <div className="mt-8">
          <RevivalCore
            dimensions={{ mobility: 72, energy: 68, recovery: 70, clarity: 74 }}
            size={200}
          />
        </div>

        {challengeScore != null && challengeScore > 0 && (
          <div
            className="glass mt-6 rounded-2xl p-4 text-center"
            role="status"
          >
            <p className="text-sm font-medium uppercase tracking-wider text-teal">
              Challenge received
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-cream">
              Beat {challengeScore}
            </p>
            <p className="mt-1 text-sm text-soft">
              Same decade sequence. Same decisions. Your move.
            </p>
          </div>
        )}

        {dailyModifierName && (
          <p className="mt-4 text-center text-sm text-sky-light">
            Today’s modifier:{' '}
            <span className="font-semibold text-cream">{dailyModifierName}</span>
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Stat label="Best" value={stats.highestScore || '—'} />
          <Stat label="Today" value={todayBest || '—'} />
          <Stat
            label="Streak"
            value={stats.streak ? `${stats.streak}🔥` : '—'}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="btn-primary min-h-14 rounded-full px-6 text-lg font-bold"
          >
            {challengeScore
              ? `Accept Challenge — Beat ${challengeScore}`
              : stats.highestScore
                ? `Play — Beat ${stats.highestScore}`
                : 'Begin Your Decade'}
          </button>
          <button
            type="button"
            onClick={onDaily}
            className="btn-secondary min-h-14 rounded-full px-6 text-lg font-semibold"
          >
            {dailyModifierName
              ? `Today’s Decade · ${dailyModifierName}`
              : "Play Today’s Decade"}
          </button>
          <button
            type="button"
            onClick={onTutorial}
            className="btn-ghost min-h-12 px-4 text-base"
          >
            How to Play (15 sec)
          </button>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-soft">{DISCLOSURE_SHORT}</p>
      </main>

      <Footer onOpenDisclaimer={onOpenDisclaimer} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl px-2 py-3">
      <div className="text-xs font-medium uppercase tracking-wider text-soft">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold tabular-nums text-cream">
        {value}
      </div>
    </div>
  )
}
