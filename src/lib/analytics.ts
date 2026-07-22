type EventName =
  | 'game_view'
  | 'game_start'
  | 'tutorial_complete'
  | 'round_complete'
  | 'combo_earned'
  | 'game_complete'
  | 'play_again'
  | 'daily_challenge_start'
  | 'share_clicked'
  | 'challenge_link_created'
  | 'challenge_opened'
  | 'quiz_cta_clicked'
  | 'how_it_works_clicked'
  | 'disclaimer_opened'

type EventPayload = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export function track(event: EventName, payload: EventPayload = {}): void {
  try {
    const detail = { event, ...payload, ts: Date.now() }

    // Safe console logging for development / no-provider setups
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[analytics]', detail)
    }

    // GA4 / gtag if present
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, payload)
    }

    // dataLayer push
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload })
    }

    // Meta pixel custom events if present
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, payload)
    }

    // Custom event for future adapters
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rr-game-analytics', { detail }))
    }
  } catch {
    // Never break gameplay for analytics
  }
}
