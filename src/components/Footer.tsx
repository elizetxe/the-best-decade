import {
  DISCLAIMER_URL,
  DISCLOSURE_FOOTER,
  PRIVACY_URL,
  SITE_URL,
  TERMS_URL,
} from '../data/content'

interface Props {
  onOpenDisclaimer: () => void
}

export function Footer({ onOpenDisclaimer }: Props) {
  return (
    <footer className="mt-10 border-t border-white/10 px-1 pb-8 pt-6 text-center">
      <button
        type="button"
        onClick={onOpenDisclaimer}
        className="text-sm font-medium text-teal underline-offset-2 hover:underline"
      >
        Game, not medical advice
      </button>
      <p className="mx-auto mt-4 max-w-2xl text-left text-xs leading-relaxed text-soft sm:text-sm">
        {DISCLOSURE_FOOTER}
      </p>
      <nav
        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-sky-light"
        aria-label="Legal"
      >
        <a href={DISCLAIMER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-teal">
          Disclaimer
        </a>
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-teal">
          Privacy
        </a>
        <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-teal">
          Terms
        </a>
        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-teal">
          regenerativerevival.com
        </a>
      </nav>
    </footer>
  )
}
