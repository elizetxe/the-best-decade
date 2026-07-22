import {
  DAILY_MODIFIERS,
  FINAL_CHOICES,
  SCENARIOS,
  STRATEGIES,
} from '../data/content'
import type {
  ActiveModifiers,
  DailyModifierId,
  DimensionMap,
  FinalMotivation,
  GameResult,
  GameState,
  RoundResult,
  Scenario,
  StrategyChoice,
  StrategyId,
} from '../types'
import {
  applyImmediate,
  buildResult,
  isBalancedChoice,
  isWholePicture,
} from './scoring'
import { createRng, dailySeed, pickN, randomSeed, shuffle } from './rng'

const BASE: DimensionMap = {
  mobility: 60,
  energy: 60,
  recovery: 60,
  clarity: 60,
}

const UNIT_MULT: DimensionMap = {
  mobility: 1,
  energy: 1,
  recovery: 1,
  clarity: 1,
}

function defaultModifiers(): ActiveModifiers {
  return {
    multipliers: { ...UNIT_MULT },
    strategyUses: {},
    balancedStreak: 0,
    revivalTriggered: false,
    wholePictureCount: 0,
    momentumCount: 0,
  }
}

function phaseForYear(year: number): 1 | 2 | 3 | 4 {
  if (year <= 3) return 1
  if (year <= 6) return 2
  if (year <= 9) return 3
  return 4
}

function buildScenarioSequence(rng: () => number): Scenario[] {
  const p1 = shuffle(
    SCENARIOS.filter((s) => s.phase === 1),
    rng,
  )
  const p2 = shuffle(
    SCENARIOS.filter((s) => s.phase === 2),
    rng,
  )
  const p3 = shuffle(
    SCENARIOS.filter((s) => s.phase === 3),
    rng,
  )
  const p4 = SCENARIOS.find((s) => s.phase === 4)!
  // 3 + 3 + 3 + 1 final
  return [...p1.slice(0, 3), ...p2.slice(0, 3), ...p3.slice(0, 3), p4]
}

function choiceSetForScenario(
  scenario: Scenario,
  year: number,
  rng: () => number,
  usedRecently: StrategyId[],
): StrategyChoice[] {
  if (year === 10) return []

  const pool = STRATEGIES.filter((s) => !usedRecently.includes(s.id))
  const preferred = scenario.weightHints
    ? pool.filter((s) => scenario.weightHints!.includes(s.id))
    : []

  const picks: StrategyChoice[] = []
  // Bias 0–2 preferred options, fill with random
  const preferredCount = Math.min(preferred.length, 1 + Math.floor(rng() * 2))
  picks.push(...pickN(preferred, preferredCount, rng))

  const remaining = pool.filter((s) => !picks.find((p) => p.id === s.id))
  while (picks.length < 3 && remaining.length > 0) {
    const next = remaining.splice(Math.floor(rng() * remaining.length), 1)[0]
    picks.push(next)
  }

  // Fallback if filters too tight
  while (picks.length < 3) {
    const extra = STRATEGIES[Math.floor(rng() * STRATEGIES.length)]
    if (!picks.find((p) => p.id === extra.id)) picks.push(extra)
  }

  return shuffle(picks.slice(0, 3), rng)
}

export function createGame(options: {
  mode: 'random' | 'daily' | 'challenge'
  seed?: string
  challengeScore?: number | null
  includeDailyModifier?: boolean
}): GameState {
  const seed =
    options.seed ??
    (options.mode === 'daily' ? dailySeed() : randomSeed())
  const rng = createRng(seed)
  const isDaily = options.mode === 'daily' || seed.startsWith('daily-')
  const isChallenge = options.mode === 'challenge'

  let dims = { ...BASE }
  let dailyModifier: DailyModifierId | null = null

  if (isDaily || options.includeDailyModifier) {
    const mod = DAILY_MODIFIERS[Math.floor(rng() * DAILY_MODIFIERS.length)]
    dailyModifier = mod.id
    dims = mod.apply(dims)
  }

  // Mild opening pressure so year 1 still has stakes
  dims = applyYearFriction(dims, 1)

  const scenarios = buildScenarioSequence(rng)
  const choiceSets: StrategyChoice[][] = []
  const recent: StrategyId[] = []

  for (let y = 0; y < 9; y++) {
    const set = choiceSetForScenario(scenarios[y], y + 1, rng, recent)
    choiceSets.push(set)
    recent.push(...set.map((s) => s.id))
    if (recent.length > 6) recent.splice(0, recent.length - 6)
  }

  const finalChoices = shuffle(FINAL_CHOICES, rng).slice(0, 5)

  return {
    seed,
    year: 1,
    dimensions: dims,
    modifiers: defaultModifiers(),
    history: [],
    dailyModifier,
    isDaily,
    isChallenge,
    challengeScore: options.challengeScore ?? null,
    scenarios,
    choiceSets,
    finalChoices,
    currentChoices: choiceSets[0] ?? [],
    currentScenario: scenarios[0] ?? null,
    phase: 'choice',
    lastExplanation: '',
    lastDeltas: {},
    lastCombos: [],
    celebration: null,
  }
}

/** Life friction each year — makes neglect costly and scores more meaningful */
function applyYearFriction(dims: DimensionMap, year: number): DimensionMap {
  const phase = phaseForYear(year)
  const friction =
    phase === 1 ? 1 : phase === 2 ? 2 : phase === 3 ? 3 : 1
  // Slight uneven pressure so balance matters
  return {
    mobility: Math.max(0, dims.mobility - friction - (year === 6 || year === 9 ? 1 : 0)),
    energy: Math.max(0, dims.energy - friction - (year === 5 || year === 8 ? 1 : 0)),
    recovery: Math.max(0, dims.recovery - friction - (year >= 8 ? 1 : 0)),
    clarity: Math.max(0, dims.clarity - friction - (year === 7 ? 1 : 0)),
  }
}

export function applyChoice(
  state: GameState,
  choiceId: StrategyId,
): GameState {
  const choice =
    state.currentChoices.find((c) => c.id === choiceId) ??
    STRATEGIES.find((s) => s.id === choiceId)
  if (!choice || state.year > 9) return state

  const uses = (state.modifiers.strategyUses[choiceId] ?? 0) + 1
  const before = { ...state.dimensions }
  const lowBefore: (keyof DimensionMap)[] = (
    Object.keys(before) as (keyof DimensionMap)[]
  ).filter((k) => before[k] < 35)

  const { next, applied } = applyImmediate(
    before,
    choice.effect.immediate,
    state.modifiers.multipliers,
    uses,
  )

  // Family First daily: boost connection choice
  if (
    state.dailyModifier === 'family_first' &&
    choiceId === 'make_time_connection'
  ) {
    next.clarity = Math.min(100, next.clarity + 3)
    next.energy = Math.min(100, next.energy + 2)
    applied.clarity = (applied.clarity ?? 0) + 3
    applied.energy = (applied.energy ?? 0) + 2
  }

  const combos: string[] = []
  let {
    balancedStreak,
    wholePictureCount,
    momentumCount,
    revivalTriggered,
    multipliers,
  } = state.modifiers

  // Apply next-round multipliers from this choice (overwrite stacking lightly)
  const newMults = { ...multipliers }
  // Decay previous multipliers toward 1
  ;(Object.keys(newMults) as (keyof DimensionMap)[]).forEach((k) => {
    newMults[k] = 1 + (newMults[k] - 1) * 0.35
    if (Math.abs(newMults[k] - 1) < 0.03) newMults[k] = 1
  })
  if (choice.effect.nextModifier) {
    ;(Object.keys(choice.effect.nextModifier) as (keyof DimensionMap)[]).forEach(
      (k) => {
        const m = choice.effect.nextModifier![k] ?? 1
        newMults[k] = Math.min(1.5, Math.max(newMults[k], m))
      },
    )
  }

  // Revival bonus
  for (const k of lowBefore) {
    if (before[k] < 35 && next[k] >= 35) {
      revivalTriggered = true
      next[k] = Math.min(100, next[k] + 5)
      applied[k] = (applied[k] ?? 0) + 5
      combos.push('Revival')
    }
  }

  // Whole Picture
  if (isWholePicture(next)) {
    wholePictureCount += 1
    combos.push('Whole Picture')
    // slight unified boost
    ;(Object.keys(next) as (keyof DimensionMap)[]).forEach((k) => {
      next[k] = Math.min(100, next[k] + 1)
      applied[k] = (applied[k] ?? 0) + 1
    })
  }

  // Momentum
  if (isBalancedChoice(applied)) {
    balancedStreak += 1
    if (balancedStreak >= 3) {
      momentumCount += 1
      combos.push('Momentum')
      ;(Object.keys(next) as (keyof DimensionMap)[]).forEach((k) => {
        next[k] = Math.min(100, next[k] + 2)
        applied[k] = (applied[k] ?? 0) + 2
      })
      balancedStreak = 0
    }
  } else {
    balancedStreak = 0
  }

  const round: RoundResult = {
    year: state.year,
    scenarioId: state.currentScenario?.id ?? '',
    choiceId,
    before,
    after: next,
    deltas: applied,
    combos,
    explanation: choice.effect.explanation,
  }

  return {
    ...state,
    dimensions: next,
    modifiers: {
      multipliers: newMults,
      strategyUses: {
        ...state.modifiers.strategyUses,
        [choiceId]: uses,
      },
      balancedStreak,
      revivalTriggered,
      wholePictureCount,
      momentumCount,
    },
    history: [...state.history, round],
    phase: 'feedback',
    lastExplanation: choice.effect.explanation,
    lastDeltas: applied,
    lastCombos: combos,
    celebration: combos[0] ?? null,
  }
}

export function advanceAfterFeedback(state: GameState): GameState {
  if (state.phase !== 'feedback') return state
  const nextYear = state.year + 1
  // Each new year applies life friction before the next decision
  const weathered = applyYearFriction(state.dimensions, nextYear)

  if (nextYear === 10) {
    return {
      ...state,
      year: 10,
      dimensions: weathered,
      phase: 'final',
      currentScenario: state.scenarios[9] ?? state.currentScenario,
      currentChoices: [],
      celebration: null,
    }
  }

  if (nextYear > 10) {
    return { ...state, phase: 'done' }
  }

  const idx = nextYear - 1
  return {
    ...state,
    year: nextYear,
    dimensions: weathered,
    phase: 'choice',
    currentScenario: state.scenarios[idx] ?? null,
    currentChoices: state.choiceSets[idx] ?? [],
    celebration: null,
    lastCombos: [],
  }
}

export function applyFinalChoice(
  state: GameState,
  motivation: FinalMotivation,
): { state: GameState; result: GameResult } {
  const final = FINAL_CHOICES.find((f) => f.id === motivation) ?? FINAL_CHOICES[0]
  const before = { ...state.dimensions }
  // Final motivation personalizes the close only — no material score gaming
  const after = { ...before }

  const round: RoundResult = {
    year: 10,
    scenarioId: 'protect_for',
    choiceId: motivation,
    before,
    after,
    deltas: {},
    combos: [],
    explanation: final.sentence,
  }

  const history = [...state.history, round]
  const result = buildResult(
    after,
    history,
    state.modifiers,
    state.seed,
    state.dailyModifier,
    motivation,
  )

  return {
    state: {
      ...state,
      dimensions: after,
      history,
      phase: 'done',
      lastExplanation: final.sentence,
      lastDeltas: round.deltas,
      lastCombos: [],
      celebration: null,
    },
    result,
  }
}

export function phaseLabel(year: number): string {
  const p = phaseForYear(year)
  if (p === 1) return 'Building foundations'
  if (p === 2) return 'Competing priorities'
  if (p === 3) return 'Meaningful tradeoffs'
  return 'What you protect for'
}
