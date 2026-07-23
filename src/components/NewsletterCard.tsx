import { useState, type FormEvent } from 'react'
import { NEWSLETTER_ENDPOINT } from '../data/content'
import { track } from '../lib/analytics'
import { loadState, saveState } from '../lib/storage'

interface Props {
  score: number
  archetype: string
  onDone: () => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function NewsletterCard({ score, archetype, onDone }: Props) {
  const already = Boolean(loadState().newsletterEmail)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  // Returning subscribers — silent
  if (already) return null

  if (status === 'success') {
    return (
      <div
        className="glass mt-6 animate-fade-up rounded-3xl border border-emerald/30 p-5"
        role="status"
      >
        <p className="font-display text-lg font-semibold text-emerald">
          You’re on the list.
        </p>
        <p className="mt-1 text-base text-sky-light">
          Weekly notes on regenerative care — calm, clinical, never spammy.
        </p>
      </div>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!isValidEmail(value)) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    setStatus('loading')
    track('newsletter_submit_attempt', { score })

    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: value,
          score,
          archetype,
          source: 'the-best-decade',
          _subject: 'The Best Decade — Weekly regenerative insights',
          _template: 'table',
          _captcha: 'false',
        }),
      })

      if (!res.ok) {
        // no-cors form fallback still delivers for many inboxes
        const form = new FormData()
        form.append('email', value)
        form.append('score', String(score))
        form.append('archetype', archetype)
        form.append('source', 'the-best-decade')
        form.append('_subject', 'The Best Decade — Weekly regenerative insights')
        await fetch(NEWSLETTER_ENDPOINT.replace('/ajax', ''), {
          method: 'POST',
          body: form,
          mode: 'no-cors',
        })
      }

      saveState({ newsletterEmail: value, newsletterAt: Date.now() })
      setStatus('success')
      track('newsletter_subscribed', { score })
      window.setTimeout(onDone, 1000)
    } catch {
      try {
        const form = new FormData()
        form.append('email', value)
        form.append('score', String(score))
        form.append('archetype', archetype)
        form.append('source', 'the-best-decade')
        form.append('_subject', 'The Best Decade — Weekly regenerative insights')
        await fetch(NEWSLETTER_ENDPOINT.replace('/ajax', ''), {
          method: 'POST',
          body: form,
          mode: 'no-cors',
        })
        saveState({ newsletterEmail: value, newsletterAt: Date.now() })
        setStatus('success')
        track('newsletter_subscribed', { score, mode: 'fallback' })
        window.setTimeout(onDone, 1000)
      } catch {
        setStatus('error')
        setError('Something went wrong. Try again in a moment.')
        track('newsletter_error')
      }
    }
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 animate-fade-up">
      <div
        className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-teal/15 blur-2xl"
        aria-hidden
      />
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
        Stay sharp
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-cream">
        Want a weekly note on regenerative care?
      </h3>
      <p className="mt-2 text-base text-sky-light">
        Short, physician-led insights on longevity, recovery, and options that may
        come to your door — no hype, unsubscribe anytime.
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          enterKeyHint="send"
          placeholder="you@email.com"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="min-h-14 w-full rounded-2xl border border-white/15 bg-navy-deep/60 px-4 text-lg text-cream outline-none ring-teal placeholder:text-soft focus:border-teal/50 focus:ring-2"
          required
          disabled={status === 'loading'}
        />
        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary min-h-14 w-full rounded-full px-6 text-lg font-semibold disabled:opacity-70"
        >
          {status === 'loading' ? 'Joining…' : 'Send me weekly insights'}
        </button>
        <button
          type="button"
          onClick={() => {
            track('newsletter_skipped')
            onDone()
          }}
          className="btn-ghost min-h-12 w-full text-base"
        >
          Not now
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-soft">
        Educational only — not medical advice. We never sell your email.
      </p>
    </div>
  )
}
