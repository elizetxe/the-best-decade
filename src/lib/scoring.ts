import { ARCHETYPES } from '../data/content'
import type {
  ActiveModifiers,
  ArchetypeId,
  BadgeId,
  DailyModifierId,
  DimensionMap,
  FinalMotivation,
  GameResult,
  RoundResult,
  StrategyId,
} from '../types'

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function clampScore(n: number): number {
  return Math.min(1000, Math.max(0, Math.round(n)))
}

export function average(dims: DimensionMap): number {
  return (dims.mobility + dims.energy + dims.recovery + dims.clarity) / 4
}

export function balanceScore(dims: DimensionMap): number {
  const vals = [dims.mobility, dims.energy, dims.recovery, dims.clarity]
  const avg = average(dims)
  const variance =
    vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length
  // 0 variance => 100, high variance => lower
  return clamp(100 - Math.sqrt(variance) * 2.2, 0, 100)
}

export function isWholePicture(dims: DimensionMap): boolean {
  return (
    dims.mobility > 65 &&
    dims.energy > 65 &&
    dims.recovery > 65 &&
    dims.clarity > 65
  )
}

export function isBalancedChoice(deltas: Partial<DimensionMap>): boolean {
  const keys = Object.keys(deltas) as (keyof DimensionMap)[]
  const positives = keys.filter((k) => (deltas[k] ?? 0) > 0)
  return positives.length >= 3
}

export function computeRevivalScore(
  dims: DimensionMap,
  consistencyBonus: number,
  resilienceBuffer: number,
): {
  score: number
  averageFinal: number
  balanceBonus: number
  consistencyPart: number
  resilienceBonus: number
} {
  const averageFinal = average(dims)
  const bal = balanceScore(dims)

  // 55% average, 20% balance, 15% consistency/combo, 10% resilience
  const avgPart = (averageFinal / 100) * 550
  const balPart = (bal / 100) * 200
  const consPart = (clamp(consistencyBonus, 0, 100) / 100) * 150
  const resPart = (clamp(resilienceBuffer, 0, 100) / 100) * 100

  return {
    score: clampScore(avgPart + balPart + consPart + resPart),
    averageFinal,
    balanceBonus: balPart,
    consistencyPart: consPart,
    resilienceBonus: resPart,
  }
}

/** Fast mid-run score estimate for the race-against-yourself loop */
export function estimateLiveScore(
  dims: DimensionMap,
  modifiers: ActiveModifiers,
): number {
  const consistencyBonus = clamp(
    modifiers.momentumCount * 18 +
      modifiers.wholePictureCount * 12 +
      (modifiers.revivalTriggered ? 15 : 0),
    0,
    100,
  )
  const mins = Math.min(dims.mobility, dims.energy, dims.recovery, dims.clarity)
  const resilienceBuffer = clamp(((mins - 20) / 80) * 100, 0, 100)
  return computeRevivalScore(dims, consistencyBonus, resilienceBuffer).score
}

export function comboHint(modifiers: ActiveModifiers, dims: DimensionMap): string | null {
  if (modifiers.balancedStreak === 2) {
    return 'Momentum ready — one more balanced choice'
  }
  if (modifiers.balancedStreak === 1) {
    return 'Balance building — 2 more for Momentum'
  }
  const vals = [dims.mobility, dims.energy, dims.recovery, dims.clarity]
  const below = vals.filter((v) => v <= 65)
  if (below.length === 1) {
    const min = Math.min(...vals)
    if (min > 55 && min <= 65) {
      return 'Whole Picture is close — lift your lowest dimension'
    }
  }
  if (vals.some((v) => v < 35)) {
    return 'A dimension is low — a Revival bonus is available'
  }
  return null
}

export function pickArchetype(
  dims: DimensionMap,
  history: RoundResult[],
  modifiers: ActiveModifiers,
  score: number,
): ArchetypeId {
  const strategyCounts: Record<string, number> = {}
  for (const r of history) {
    strategyCounts[r.choiceId] = (strategyCounts[r.choiceId] ?? 0) + 1
  }

  const dataHeavy =
    (strategyCounts['get_objective_data'] ?? 0) +
    (strategyCounts['ask_expert_guidance'] ?? 0) +
    (strategyCounts['plan_proactively'] ?? 0)

  const rebuildHeavy =
    (strategyCounts['restore_basics'] ?? 0) +
    (strategyCounts['schedule_recovery'] ?? 0) +
    (strategyCounts['protect_sleep'] ?? 0)

  const planHeavy =
    (strategyCounts['plan_proactively'] ?? 0) +
    (strategyCounts['reassess_routine'] ?? 0)

  if (modifiers.revivalTriggered && rebuildHeavy >= 2) return 'rebuilder'
  if (modifiers.momentumCount >= 2) return 'momentum_maker'
  if (balanceScore(dims) >= 88 && isWholePicture(dims)) return 'balanced_operator'
  if (dataHeavy >= 3) return 'strategist'
  if (planHeavy >= 2 && score >= 750) return 'long_game_thinker'
  if (score >= 820 && isWholePicture(dims)) return 'revival_architect'
  if (balanceScore(dims) >= 80) return 'balanced_operator'
  if (dataHeavy >= 2) return 'strategist'
  if (rebuildHeavy >= 3) return 'rebuilder'
  if (modifiers.momentumCount >= 1) return 'momentum_maker'
  if (planHeavy >= 1) return 'long_game_thinker'
  return score >= 700 ? 'revival_architect' : 'rebuilder'
}

export function collectBadges(
  dims: DimensionMap,
  modifiers: ActiveModifiers,
  score: number,
  dailyModifier: DailyModifierId | null,
  finished: boolean,
): BadgeId[] {
  const badges: BadgeId[] = []
  if (modifiers.wholePictureCount > 0 || isWholePicture(dims)) {
    badges.push('whole_picture')
  }
  if (modifiers.revivalTriggered) badges.push('comeback')
  if (finished) badges.push('ten_year_thinker')
  if (modifiers.momentumCount >= 3) badges.push('consistency_wins')
  if (
    score >= 700 &&
    dailyModifier &&
    ['travel_week', 'high_pressure', 'comeback_year', 'performance_mode'].includes(
      dailyModifier,
    )
  ) {
    badges.push('calm_under_pressure')
  }
  if (
    dims.mobility >= 70 &&
    dims.energy >= 70 &&
    dims.recovery >= 70 &&
    dims.clarity >= 70
  ) {
    badges.push('strong_finish')
  }
  return badges
}

export function buildResult(
  dims: DimensionMap,
  history: RoundResult[],
  modifiers: ActiveModifiers,
  seed: string,
  dailyModifier: DailyModifierId | null,
  motivation: FinalMotivation,
): GameResult {
  const consistencyBonus = clamp(
    modifiers.momentumCount * 18 +
      modifiers.wholePictureCount * 12 +
      (modifiers.revivalTriggered ? 15 : 0) +
      Math.min(20, Object.values(modifiers.strategyUses).filter((n) => (n ?? 0) >= 1).length * 3),
    0,
    100,
  )

  // Remaining resilience = how much headroom above danger zone
  const mins = Math.min(dims.mobility, dims.energy, dims.recovery, dims.clarity)
  const resilienceBuffer = clamp(((mins - 20) / 80) * 100, 0, 100)

  const scored = computeRevivalScore(dims, consistencyBonus, resilienceBuffer)
  const archetype = pickArchetype(dims, history, modifiers, scored.score)
  const badges = collectBadges(dims, modifiers, scored.score, dailyModifier, true)

  let bestCombo = 'Steady Progress'
  if (modifiers.momentumCount >= 3) bestCombo = 'Momentum Mastery'
  else if (modifiers.momentumCount >= 1) bestCombo = 'Momentum'
  else if (modifiers.wholePictureCount >= 2) bestCombo = 'Whole Picture Streak'
  else if (modifiers.wholePictureCount >= 1) bestCombo = 'Whole Picture'
  else if (modifiers.revivalTriggered) bestCombo = 'Revival'

  return {
    score: scored.score,
    archetype,
    dimensions: { ...dims },
    badges,
    bestCombo,
    motivation,
    rounds: history,
    seed,
    dailyModifier,
    consistencyBonus: scored.consistencyPart,
    balanceBonus: scored.balanceBonus,
    resilienceBonus: scored.resilienceBonus,
    averageFinal: scored.averageFinal,
  }
}

export function archetypeName(id: ArchetypeId): string {
  return ARCHETYPES.find((a) => a.id === id)?.name ?? 'The Strategist'
}

export function diminishingReturns(
  base: number,
  uses: number,
): number {
  if (uses <= 1) return base
  if (uses === 2) return base * 0.65
  if (uses === 3) return base * 0.4
  return base * 0.25
}

export function applyImmediate(
  dims: DimensionMap,
  deltas: Partial<DimensionMap>,
  mults: DimensionMap,
  strategyUses: number,
): { next: DimensionMap; applied: Partial<DimensionMap> } {
  const applied: Partial<DimensionMap> = {}
  const next = { ...dims }
  ;(Object.keys(deltas) as (keyof DimensionMap)[]).forEach((k) => {
    const raw = deltas[k] ?? 0
    const scaled = diminishingReturns(raw, strategyUses)
    const withMult = scaled > 0 ? scaled * (mults[k] ?? 1) : scaled
    const rounded = Math.round(withMult * 10) / 10
    applied[k] = Math.round(rounded)
    next[k] = clamp(next[k] + rounded)
  })
  return { next, applied }
}

export type StrategyUseMap = Partial<Record<StrategyId, number>>
