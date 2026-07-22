export type Dimension = 'mobility' | 'energy' | 'recovery' | 'clarity'

export type DimensionMap = Record<Dimension, number>

export type StrategyId =
  | 'protect_sleep'
  | 'schedule_recovery'
  | 'build_strength'
  | 'prioritize_mobility'
  | 'reduce_overload'
  | 'get_objective_data'
  | 'ask_expert_guidance'
  | 'stay_consistent'
  | 'make_time_connection'
  | 'restore_basics'
  | 'plan_proactively'
  | 'reassess_routine'

export type FinalMotivation =
  | 'adventures'
  | 'family'
  | 'staying_in_game'
  | 'feeling_myself'
  | 'performing_best'

export type DailyModifierId =
  | 'travel_week'
  | 'high_pressure'
  | 'comeback_year'
  | 'family_first'
  | 'performance_mode'
  | 'fresh_start'

export type BadgeId =
  | 'whole_picture'
  | 'comeback'
  | 'ten_year_thinker'
  | 'consistency_wins'
  | 'calm_under_pressure'
  | 'strong_finish'

export type ArchetypeId =
  | 'rebuilder'
  | 'strategist'
  | 'momentum_maker'
  | 'balanced_operator'
  | 'long_game_thinker'
  | 'revival_architect'

export type Screen =
  | 'loading'
  | 'start'
  | 'tutorial'
  | 'playing'
  | 'results'
  | 'error'

export interface ChoiceEffect {
  immediate: Partial<DimensionMap>
  nextModifier?: Partial<Record<Dimension, number>>
  explanation: string
}

export interface StrategyChoice {
  id: StrategyId
  title: string
  blurb: string
  effect: ChoiceEffect
  tags: string[]
}

export interface Scenario {
  id: string
  text: string
  phase: 1 | 2 | 3 | 4
  weightHints?: StrategyId[]
}

export interface FinalChoice {
  id: FinalMotivation
  title: string
  sentence: string
}

export interface DailyModifier {
  id: DailyModifierId
  name: string
  description: string
  apply: (dims: DimensionMap) => DimensionMap
}

export interface Badge {
  id: BadgeId
  name: string
  description: string
}

export interface Archetype {
  id: ArchetypeId
  name: string
  description: string
}

export interface RoundResult {
  year: number
  scenarioId: string
  choiceId: StrategyId | FinalMotivation
  before: DimensionMap
  after: DimensionMap
  deltas: Partial<DimensionMap>
  combos: string[]
  explanation: string
}

export interface GameResult {
  score: number
  archetype: ArchetypeId
  dimensions: DimensionMap
  badges: BadgeId[]
  bestCombo: string
  motivation: FinalMotivation
  rounds: RoundResult[]
  seed: string
  dailyModifier: DailyModifierId | null
  consistencyBonus: number
  balanceBonus: number
  resilienceBonus: number
  averageFinal: number
}

export interface ChallengePayload {
  seed: string
  score: number
  archetype?: ArchetypeId
}

export interface PersistedState {
  highestScore: number
  dailyBest: number
  dailyBestDate: string
  streak: number
  lastPlayedDate: string
  badges: BadgeId[]
  soundOn: boolean
  reducedMotion: boolean
  tutorialCompleted: boolean
  totalPlays: number
}

export interface ActiveModifiers {
  multipliers: DimensionMap
  strategyUses: Partial<Record<StrategyId, number>>
  balancedStreak: number
  revivalTriggered: boolean
  wholePictureCount: number
  momentumCount: number
}

export interface GameState {
  seed: string
  year: number
  dimensions: DimensionMap
  modifiers: ActiveModifiers
  history: RoundResult[]
  dailyModifier: DailyModifierId | null
  isDaily: boolean
  isChallenge: boolean
  challengeScore: number | null
  scenarios: Scenario[]
  choiceSets: StrategyChoice[][]
  finalChoices: FinalChoice[]
  currentChoices: StrategyChoice[]
  currentScenario: Scenario | null
  phase: 'choice' | 'feedback' | 'final' | 'done'
  lastExplanation: string
  lastDeltas: Partial<DimensionMap>
  lastCombos: string[]
  celebration: string | null
}
