import type { BadgeId, PersistedState } from '../types'
import { todayKey } from './rng'

const KEY = 'rr-best-decade-v1'

const DEFAULT: PersistedState = {
  highestScore: 0,
  dailyBest: 0,
  dailyBestDate: '',
  streak: 0,
  lastPlayedDate: '',
  badges: [],
  soundOn: false,
  reducedMotion: false,
  tutorialCompleted: false,
  totalPlays: 0,
}

function safeParse(raw: string | null): PersistedState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<PersistedState>
    return {
      ...DEFAULT,
      ...data,
      badges: Array.isArray(data.badges) ? (data.badges as BadgeId[]) : [],
    }
  } catch {
    return null
  }
}

export function loadState(): PersistedState {
  try {
    return safeParse(localStorage.getItem(KEY)) ?? { ...DEFAULT }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveState(partial: Partial<PersistedState>): PersistedState {
  const current = loadState()
  const next = { ...current, ...partial }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage may be unavailable — gameplay continues
  }
  return next
}

export function recordPlay(score: number, newBadges: BadgeId[]): PersistedState {
  const current = loadState()
  const today = todayKey()
  let streak = current.streak
  const last = current.lastPlayedDate

  if (last !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey = todayKey(yesterday)
    streak = last === yKey ? streak + 1 : 1
  }

  const dailyBest =
    current.dailyBestDate === today
      ? Math.max(current.dailyBest, score)
      : score

  const badges = Array.from(new Set([...current.badges, ...newBadges]))

  return saveState({
    highestScore: Math.max(current.highestScore, score),
    dailyBest,
    dailyBestDate: today,
    streak,
    lastPlayedDate: today,
    badges,
    totalPlays: current.totalPlays + 1,
  })
}

export function getTodayBest(state: PersistedState): number {
  return state.dailyBestDate === todayKey() ? state.dailyBest : 0
}
