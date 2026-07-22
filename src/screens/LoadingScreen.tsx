import { Logo } from '../components/Logo'

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-navy-deep px-6">
      <div className="animate-soft-pulse">
        <Logo height={48} />
      </div>
      <p className="mt-8 font-display text-lg font-medium tracking-wide text-sky-light">
        The Best Decade
      </p>
      <div
        className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Loading"
      >
        <div className="h-full w-1/2 animate-pulse rounded-full bg-teal" />
      </div>
    </div>
  )
}
