import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'
import { loadState, saveState } from '../lib/storage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  )
}

interface Props {
  /** Show after results settle */
  open: boolean
  onClose: () => void
}

export function InstallPrompt({ open, onClose }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setIos(isIos())
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    if (isStandalone()) return
    const stats = loadState()
    if (stats.pwaInstalled) return
    if (stats.pwaRemindAt && Date.now() < stats.pwaRemindAt) return
    // Soft delay so score lands first
    const t = window.setTimeout(() => {
      setVisible(true)
      track('pwa_prompt_shown', { ios: isIos() })
    }, 1600)
    return () => window.clearTimeout(t)
  }, [open])

  if (!visible) return null

  const remindLater = () => {
    const inSevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000
    saveState({ pwaRemindAt: inSevenDays })
    track('pwa_remind_later')
    setVisible(false)
    onClose()
  }

  const installNative = async () => {
    if (!deferred) return
    track('pwa_install_clicked', { mode: 'native' })
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      saveState({ pwaInstalled: true })
      track('pwa_installed')
    }
    setDeferred(null)
    setVisible(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
    >
      <div className="glass w-full max-w-md animate-fade-up rounded-3xl p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">
          One-tap access
        </p>
        <h2
          id="install-title"
          className="mt-2 font-display text-2xl font-semibold text-cream"
        >
          Keep The Best Decade on your Home Screen
        </h2>
        <p className="mt-2 text-base text-sky-light">
          Open it like an app — full screen, no browser chrome. Perfect for daily
          decades and friend challenges.
        </p>

        {ios ? (
          <ol className="mt-5 space-y-3 text-base text-sky-light">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 font-semibold text-teal">
                1
              </span>
              <span>
                Tap the <strong className="text-cream">Share</strong> button in Safari
                (square with an arrow).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 font-semibold text-teal">
                2
              </span>
              <span>
                Scroll and tap{' '}
                <strong className="text-cream">Add to Home Screen</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 font-semibold text-teal">
                3
              </span>
              <span>
                Tap <strong className="text-cream">Add</strong> — you’re done.
              </span>
            </li>
          </ol>
        ) : deferred ? (
          <button
            type="button"
            onClick={() => void installNative()}
            className="btn-primary mt-6 min-h-14 w-full rounded-full px-6 text-lg font-semibold"
          >
            Add to Home Screen
          </button>
        ) : (
          <p className="mt-4 text-sm text-soft">
            In your browser menu, choose <strong className="text-sky-light">Install app</strong>{' '}
            or <strong className="text-sky-light">Add to Home Screen</strong>.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {!ios && deferred ? null : (
            <button
              type="button"
              onClick={() => {
                track('pwa_ios_got_it')
                setVisible(false)
                onClose()
              }}
              className="btn-secondary min-h-12 w-full rounded-full px-6 font-semibold"
            >
              {ios ? 'Got it' : 'Close'}
            </button>
          )}
          <button
            type="button"
            onClick={remindLater}
            className="btn-ghost min-h-12 text-base"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  )
}
