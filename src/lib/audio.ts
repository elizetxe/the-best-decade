/** Optional subtle UI tones — off by default */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    return ctx
  } catch {
    return null
  }
}

export function playTone(
  enabled: boolean,
  kind: 'select' | 'combo' | 'complete' = 'select',
): void {
  if (!enabled) return
  const audio = getCtx()
  if (!audio) return

  try {
    if (audio.state === 'suspended') void audio.resume()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    const now = audio.currentTime
    if (kind === 'select') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(480, now)
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.08)
      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)
      osc.start(now)
      osc.stop(now + 0.12)
    } else if (kind === 'combo') {
      // Two-note sparkle
      const osc2 = audio.createOscillator()
      const gain2 = audio.createGain()
      osc2.connect(gain2)
      gain2.connect(audio.destination)
      osc.frequency.setValueAtTime(523.25, now)
      osc2.frequency.setValueAtTime(659.25, now + 0.06)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      gain2.gain.setValueAtTime(0.04, now + 0.06)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc.start(now)
      osc.stop(now + 0.22)
      osc2.start(now + 0.06)
      osc2.stop(now + 0.3)
    } else {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(392, now)
      osc.frequency.linearRampToValueAtTime(587, now + 0.28)
      gain.gain.setValueAtTime(0.055, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
      osc.start(now)
      osc.stop(now + 0.44)
    }
  } catch {
    // ignore audio failures
  }
}

export function haptic(enabled: boolean): void {
  if (!enabled) return
  try {
    if (navigator.vibrate) navigator.vibrate(12)
  } catch {
    // ignore
  }
}
