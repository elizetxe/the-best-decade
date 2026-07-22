/** Mulberry32 seeded PRNG for deterministic challenges */
export function createRng(seed: string): () => number {
  let h = hashString(seed)
  return function next() {
    h |= 0
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  return shuffle(arr, rng).slice(0, n)
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function dailySeed(date = new Date()): string {
  return `daily-${todayKey(date)}`
}

export function randomSeed(): string {
  const a = Math.floor(Math.random() * 1e9).toString(36)
  const b = Date.now().toString(36)
  return `run-${a}-${b}`
}
