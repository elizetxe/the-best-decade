import {
  DISCLAIMER_URL,
  DISCLOSURE_FOOTER,
  DISCLOSURE_SHORT,
  PRIVACY_URL,
  TERMS_URL,
} from '../data/content'

interface Props {
  open: boolean
  onClose: () => void
}

export function DisclaimerModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      onClick={onClose}
    >
      <div
        className="glass max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="disclaimer-title"
          className="font-display text-xl font-semibold text-cream sm:text-2xl"
        >
          Game, not medical advice
        </h2>
        <p className="mt-4 text-base leading-relaxed text-sky-light">
          {DISCLOSURE_SHORT}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-soft">{DISCLOSURE_FOOTER}</p>
        <ul className="mt-5 space-y-2 text-base">
          <li>
            <a
              className="text-teal underline-offset-2 hover:underline"
              href={DISCLAIMER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Disclaimer
            </a>
          </li>
          <li>
            <a
              className="text-teal underline-offset-2 hover:underline"
              href={PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              className="text-teal underline-offset-2 hover:underline"
              href={TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>
          </li>
        </ul>
        <button
          type="button"
          className="btn-primary mt-6 min-h-14 w-full rounded-full px-6 font-semibold"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
