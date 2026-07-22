import { Logo } from '../components/Logo'

interface Props {
  onComplete: () => void
  onSkip: () => void
}

export function TutorialScreen({ onComplete, onSkip }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-6 sm:max-w-xl sm:px-8">
      <Logo height={32} />
      <h1 className="mt-8 font-display text-3xl font-semibold text-cream">
        How to Play
      </h1>
      <p className="mt-2 text-sky-light">About 15 seconds. Then the decade is yours.</p>

      <ol className="mt-8 space-y-5">
        {[
          {
            n: '1',
            t: 'Ten years. One choice each.',
            d: 'Every round is a year. Read the moment, then pick a strategy card.',
          },
          {
            n: '2',
            t: 'Protect four dimensions.',
            d: 'Mobility, Energy, Recovery, and Clarity. Keep the whole picture strong.',
          },
          {
            n: '3',
            t: 'Combos reward balance.',
            d: 'Whole Picture, Revival, and Momentum bonuses appear when choices compound.',
          },
          {
            n: '4',
            t: 'No wrong way to finish.',
            d: 'You always complete all ten years. The score is a game score — not a health score.',
          },
        ].map((item) => (
          <li key={item.n} className="glass flex gap-4 rounded-2xl p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/20 font-display font-semibold text-teal">
              {item.n}
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-cream">{item.t}</h2>
              <p className="mt-1 text-base text-sky-light">{item.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-base text-soft">
        The goal is not perfection. It is protecting the whole picture.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="btn-primary min-h-14 rounded-full px-6 text-lg font-semibold"
        >
          Got it — Let’s Play
        </button>
        <button type="button" onClick={onSkip} className="btn-ghost min-h-12 text-base">
          Skip
        </button>
      </div>
    </div>
  )
}
