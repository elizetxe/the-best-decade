import { archetypeName } from './scoring'
import type { ArchetypeId, DimensionMap, GameResult } from '../types'
import { LOGO_URL } from '../data/content'
// Prefer high-res PNG for canvas (AVIF not always drawable)

export function buildChallengeUrl(
  origin: string,
  seed: string,
  score: number,
  archetype?: ArchetypeId,
): string {
  const url = new URL(origin)
  url.searchParams.set('challenge', seed)
  url.searchParams.set('score', String(score))
  if (archetype) url.searchParams.set('arch', archetype)
  return url.toString()
}

export function parseChallengeFromSearch(search: string): {
  seed: string
  score: number
  archetype?: ArchetypeId
} | null {
  const params = new URLSearchParams(search)
  const seed = params.get('challenge')
  const scoreRaw = params.get('score')
  if (!seed) return null
  const score = scoreRaw ? Number(scoreRaw) : 0
  const arch = params.get('arch') as ArchetypeId | null
  return {
    seed,
    score: Number.isFinite(score) ? score : 0,
    archetype: arch || undefined,
  }
}

export function shareText(result: GameResult): string {
  const name = archetypeName(result.archetype)
  return `I scored ${result.score} in The Best Decade and earned '${name}.' Think you can protect your decade better?`
}

export async function shareChallenge(
  result: GameResult,
  challengeUrl: string,
): Promise<'shared' | 'copied' | 'failed'> {
  const text = `${shareText(result)}\n${challengeUrl}`

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'The Best Decade',
        text: shareText(result),
        url: challengeUrl,
      })
      return 'shared'
    } catch (err) {
      // user cancelled or share failed — try clipboard
      if ((err as Error).name === 'AbortError') return 'failed'
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return 'copied'
    } catch {
      return 'failed'
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generateShareCard(
  result: GameResult,
  challengeUrl: string,
): Promise<Blob | null> {
  try {
    const size = 1080
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#021E3C')
    grad.addColorStop(0.45, '#0B0E16')
    grad.addColorStop(1, '#1B3A5C')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    // Soft orbs
    const orb = (x: number, y: number, r: number, c: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, c)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    orb(220, 200, 280, 'rgba(14,165,233,0.22)')
    orb(880, 820, 320, 'rgba(113,167,245,0.16)')
    orb(900, 180, 200, 'rgba(0,187,127,0.1)')

    // Logo on light pill (official mark is dark)
    const logo = await loadImage(LOGO_URL)
    if (logo) {
      const lw = 280
      const lh = (logo.height / logo.width) * lw
      const padX = 28
      const padY = 16
      const boxW = lw + padX * 2
      const boxH = lh + padY * 2
      const bx = (size - boxW) / 2
      const by = 48
      ctx.fillStyle = 'rgba(247,250,255,0.96)'
      roundRect(ctx, bx, by, boxW, boxH, 20)
      ctx.fill()
      ctx.drawImage(logo, bx + padX, by + padY, lw, lh)
    } else {
      ctx.fillStyle = '#F7FAFF'
      ctx.font = '600 36px Poppins, Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Regenerative Revival', size / 2, 100)
    }

    // Title
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(197,219,247,0.85)'
    ctx.font = '500 28px Inter, sans-serif'
    ctx.fillText('THE BEST DECADE', size / 2, 220)

    // Score
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 140px Poppins, Inter, sans-serif'
    ctx.fillText(String(result.score), size / 2, 400)

    ctx.fillStyle = 'rgba(197,219,247,0.9)'
    ctx.font = '500 28px Inter, sans-serif'
    ctx.fillText('Revival Score', size / 2, 450)

    // Archetype
    ctx.fillStyle = '#0EA5E9'
    ctx.font = '600 40px Poppins, Inter, sans-serif'
    ctx.fillText(archetypeName(result.archetype), size / 2, 520)

    // Dimension bars
    drawDimensionViz(ctx, result.dimensions, size / 2, 680, 340)

    // Challenge line
    ctx.fillStyle = '#F7FAFF'
    ctx.font = '600 34px Poppins, Inter, sans-serif'
    ctx.fillText('Can you beat my decade?', size / 2, 900)

    ctx.fillStyle = 'rgba(197,219,247,0.7)'
    ctx.font = '400 20px Inter, sans-serif'
    const short =
      challengeUrl.length > 54
        ? challengeUrl.slice(0, 54) + '…'
        : challengeUrl
    ctx.fillText(short, size / 2, 950)

    ctx.fillStyle = 'rgba(122,127,149,0.9)'
    ctx.font = '400 18px Inter, sans-serif'
    ctx.fillText('Game for education & entertainment only', size / 2, 1010)

    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    )
  } catch {
    return null
  }
}

function drawDimensionViz(
  ctx: CanvasRenderingContext2D,
  dims: DimensionMap,
  cx: number,
  cy: number,
  radius: number,
) {
  const entries: [string, number, string][] = [
    ['Mobility', dims.mobility, '#0EA5E9'],
    ['Energy', dims.energy, '#00BB7F'],
    ['Recovery', dims.recovery, '#71A7F5'],
    ['Clarity', dims.clarity, '#C5DBF7'],
  ]

  const startX = cx - radius / 2
  entries.forEach(([label, val, color], i) => {
    const y = cy - 70 + i * 42
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, startX, y, radius, 14, 7)
    ctx.fill()
    ctx.fillStyle = color
    roundRect(ctx, startX, y, (radius * val) / 100, 14, 7)
    ctx.fill()
    ctx.fillStyle = 'rgba(247,250,255,0.9)'
    ctx.font = '500 18px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(label, startX, y - 6)
    ctx.textAlign = 'right'
    ctx.fillText(String(val), startX + radius, y - 6)
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, h / 2, w / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
