import type {
  Archetype,
  Badge,
  DailyModifier,
  FinalChoice,
  Scenario,
  StrategyChoice,
} from '../types'

export const DIMENSIONS = ['mobility', 'energy', 'recovery', 'clarity'] as const

export const DIMENSION_LABELS = {
  mobility: 'Mobility',
  energy: 'Energy',
  recovery: 'Recovery',
  clarity: 'Clarity',
} as const

export const QUIZ_URL = 'https://regenerativerevival.com/consult-router'
export const HOW_IT_WORKS_URL = 'https://regenerativerevival.com/'
export const SITE_URL = 'https://regenerativerevival.com/'
export const DISCLAIMER_URL = 'https://regenerativerevival.com/disclaimer/'
export const PRIVACY_URL = 'https://regenerativerevival.com/privacy-policy/'
export const TERMS_URL = 'https://regenerativerevival.com/terms-conditions/'
export const LOGO_URL = '/logo.png'

export const SCENARIOS: Scenario[] = [
  // Years 1–3: approachable
  {
    id: 'hiking',
    text: 'A big hiking trip is six weeks away.',
    phase: 1,
    weightHints: ['prioritize_mobility', 'build_strength', 'plan_proactively'],
  },
  {
    id: 'sleep_slipping',
    text: 'Work has been relentless and sleep is slipping.',
    phase: 1,
    weightHints: ['protect_sleep', 'reduce_overload', 'restore_basics'],
  },
  {
    id: 'pickleball',
    text: 'Your knee is making pickleball less fun.',
    phase: 1,
    weightHints: ['prioritize_mobility', 'schedule_recovery', 'get_objective_data'],
  },
  {
    id: 'energy_left',
    text: 'You want enough energy left for the people you love.',
    phase: 1,
    weightHints: ['protect_sleep', 'make_time_connection', 'reduce_overload'],
  },
  {
    id: 'feel_good',
    text: 'You feel good, but want to protect your momentum.',
    phase: 1,
    weightHints: ['stay_consistent', 'plan_proactively', 'reassess_routine'],
  },
  {
    id: 'milestone_birthday',
    text: 'You are planning an active milestone birthday.',
    phase: 1,
    weightHints: ['plan_proactively', 'build_strength', 'prioritize_mobility'],
  },
  // Years 4–6: competing priorities
  {
    id: 'stressful_quarter',
    text: 'A stressful quarter has disrupted your routine.',
    phase: 2,
    weightHints: ['restore_basics', 'reduce_overload', 'protect_sleep'],
  },
  {
    id: 'train_harder',
    text: 'You have been training harder but recovering slower.',
    phase: 2,
    weightHints: ['schedule_recovery', 'get_objective_data', 'reassess_routine'],
  },
  {
    id: 'stay_sharp',
    text: 'You want to stay sharp through a demanding week.',
    phase: 2,
    weightHints: ['protect_sleep', 'restore_basics', 'reduce_overload'],
  },
  {
    id: 'travel',
    text: 'Travel interrupted every healthy habit.',
    phase: 2,
    weightHints: ['restore_basics', 'stay_consistent', 'plan_proactively'],
  },
  {
    id: 'calendar_full',
    text: 'Your calendar is full and something has to give.',
    phase: 2,
    weightHints: ['reduce_overload', 'make_time_connection', 'reassess_routine'],
  },
  {
    id: 'joint_stiff',
    text: 'Mornings feel stiffer than they used to.',
    phase: 2,
    weightHints: ['prioritize_mobility', 'schedule_recovery', 'ask_expert_guidance'],
  },
  // Years 7–9: harder tradeoffs
  {
    id: 'competing_goals',
    text: 'Performance goals are competing with recovery needs.',
    phase: 3,
    weightHints: ['schedule_recovery', 'get_objective_data', 'reassess_routine'],
  },
  {
    id: 'foggy_afternoons',
    text: 'Afternoons feel foggy when you need to be sharpest.',
    phase: 3,
    weightHints: ['protect_sleep', 'restore_basics', 'ask_expert_guidance'],
  },
  {
    id: 'plateau',
    text: 'Your usual routine has stopped producing results.',
    phase: 3,
    weightHints: ['reassess_routine', 'get_objective_data', 'ask_expert_guidance'],
  },
  {
    id: 'family_priority',
    text: 'Family needs more of you — and so does your body.',
    phase: 3,
    weightHints: ['make_time_connection', 'reduce_overload', 'plan_proactively'],
  },
  {
    id: 'setback',
    text: 'A small setback threatens to undo months of progress.',
    phase: 3,
    weightHints: ['schedule_recovery', 'stay_consistent', 'ask_expert_guidance'],
  },
  {
    id: 'long_game',
    text: 'You are thinking past this season — into the next decade.',
    phase: 3,
    weightHints: ['plan_proactively', 'get_objective_data', 'stay_consistent'],
  },
  // Year 10 context flavor (final is separate)
  {
    id: 'protect_for',
    text: 'What are you protecting this for?',
    phase: 4,
  },
]

export const STRATEGIES: StrategyChoice[] = [
  {
    id: 'protect_sleep',
    title: 'Protect sleep',
    blurb: 'Guard rest like it is non-negotiable.',
    tags: ['energy', 'clarity', 'recovery'],
    effect: {
      immediate: { energy: 8, clarity: 7, recovery: 3 },
      nextModifier: { recovery: 1.25 },
      explanation:
        'Rest compounds. Energy and clarity rise now; recovery gains get a lift next year.',
    },
  },
  {
    id: 'schedule_recovery',
    title: 'Schedule recovery',
    blurb: 'Put restoration on the calendar first.',
    tags: ['recovery', 'mobility'],
    effect: {
      immediate: { recovery: 10, mobility: 4, energy: 2, clarity: -1 },
      nextModifier: { mobility: 1.15 },
      explanation:
        'Recovery becomes a plan, not an afterthought. Mobility benefits next year.',
    },
  },
  {
    id: 'build_strength',
    title: 'Build strength',
    blurb: 'Invest in durable physical capacity.',
    tags: ['mobility', 'energy'],
    effect: {
      immediate: { mobility: 9, energy: 5, recovery: -3 },
      nextModifier: { energy: 1.12 },
      explanation:
        'Strength builds capacity. A recovery cost now; energy pays off later.',
    },
  },
  {
    id: 'prioritize_mobility',
    title: 'Prioritize mobility',
    blurb: 'Move well so you can keep moving.',
    tags: ['mobility', 'recovery'],
    effect: {
      immediate: { mobility: 10, recovery: 3, energy: -1 },
      nextModifier: { mobility: 1.14 },
      explanation:
        'Range and ease improve now. Mobility work stays slightly more effective next year.',
    },
  },
  {
    id: 'reduce_overload',
    title: 'Reduce overload',
    blurb: 'Create space by cutting what drains you.',
    tags: ['energy', 'clarity', 'recovery'],
    effect: {
      immediate: { energy: 6, clarity: 6, recovery: 5, mobility: -2 },
      explanation:
        'Less friction, more headroom. A modest trade for sustainable capacity.',
    },
  },
  {
    id: 'get_objective_data',
    title: 'Get objective data',
    blurb: 'Replace guesswork with clear signal.',
    tags: ['clarity', 'strategy'],
    effect: {
      immediate: { clarity: 9, energy: 2, recovery: 2, mobility: -1 },
      nextModifier: { clarity: 1.22, recovery: 1.12 },
      explanation:
        'Clarity jumps. Informed decisions amplify recovery and focus next year.',
    },
  },
  {
    id: 'ask_expert_guidance',
    title: 'Ask for expert guidance',
    blurb: 'Invite experienced perspective.',
    tags: ['clarity', 'balance'],
    effect: {
      immediate: { clarity: 6, recovery: 4, mobility: 3, energy: 2 },
      nextModifier: { mobility: 1.12, recovery: 1.12 },
      explanation:
        'Guidance steadies the whole picture. Several dimensions improve; gains linger.',
    },
  },
  {
    id: 'stay_consistent',
    title: 'Stay consistent',
    blurb: 'Do the simple things, again.',
    tags: ['balance', 'momentum'],
    effect: {
      immediate: { energy: 4, recovery: 4, mobility: 4, clarity: 4 },
      nextModifier: { energy: 1.1, recovery: 1.1, mobility: 1.1, clarity: 1.1 },
      explanation:
        'Even gains across the board. Consistency quietly multiplies what comes next.',
    },
  },
  {
    id: 'make_time_connection',
    title: 'Make time for connection',
    blurb: 'Protect people as carefully as plans.',
    tags: ['clarity', 'energy'],
    effect: {
      immediate: { clarity: 6, energy: 5, recovery: 3, mobility: -1 },
      nextModifier: { clarity: 1.15 },
      explanation:
        'Connection restores purpose. Clarity and energy rise; focus carries forward.',
    },
  },
  {
    id: 'restore_basics',
    title: 'Restore the basics',
    blurb: 'Return to sleep, movement, and rhythm.',
    tags: ['recovery', 'energy'],
    effect: {
      immediate: { recovery: 7, energy: 6, mobility: 3, clarity: 2 },
      explanation:
        'Foundations rebuild capacity. Broad, immediate support without fancy moves.',
    },
  },
  {
    id: 'plan_proactively',
    title: 'Plan proactively',
    blurb: 'Design the year before it designs you.',
    tags: ['clarity', 'strategy'],
    effect: {
      immediate: { clarity: 7, energy: 3, mobility: 2, recovery: -1 },
      nextModifier: { energy: 1.2, mobility: 1.12 },
      explanation:
        'Foresight reduces friction. Energy and mobility gains improve next year.',
    },
  },
  {
    id: 'reassess_routine',
    title: 'Reassess the routine',
    blurb: 'Update what no longer serves you.',
    tags: ['clarity', 'balance'],
    effect: {
      immediate: { clarity: 5, recovery: 5, energy: 3, mobility: 2 },
      nextModifier: { recovery: 1.15, clarity: 1.15 },
      explanation:
        'An honest reset. Recovery and clarity get more lift from future choices.',
    },
  },
]

export const FINAL_CHOICES: FinalChoice[] = [
  {
    id: 'adventures',
    title: 'More adventures',
    sentence:
      'You protected capacity for the trails, trips, and unplanned yeses still ahead.',
  },
  {
    id: 'family',
    title: 'More time with family',
    sentence:
      'You protected energy for the people who make the decade worth protecting.',
  },
  {
    id: 'staying_in_game',
    title: 'Staying in the game',
    sentence:
      'You protected the ability to keep showing up — in motion, in work, in life.',
  },
  {
    id: 'feeling_myself',
    title: 'Feeling like myself',
    sentence:
      'You protected the sense of self that no score can measure — only you recognize.',
  },
  {
    id: 'performing_best',
    title: 'Performing at my best',
    sentence:
      'You protected the edge that lets you lead, create, and deliver when it counts.',
  },
]

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: 'travel_week',
    name: 'Travel Week',
    description: 'Routines are disrupted. Basics matter more.',
    apply: (d) => ({
      ...d,
      energy: Math.max(45, d.energy - 4),
      recovery: Math.max(45, d.recovery - 3),
    }),
  },
  {
    id: 'high_pressure',
    name: 'High-Pressure Quarter',
    description: 'Clarity is under strain. Guard focus carefully.',
    apply: (d) => ({
      ...d,
      clarity: Math.max(45, d.clarity - 5),
      energy: Math.max(48, d.energy - 2),
    }),
  },
  {
    id: 'comeback_year',
    name: 'Comeback Year',
    description: 'You start a little lower — revival bonuses are ripe.',
    apply: (d) => ({
      mobility: Math.max(40, d.mobility - 8),
      energy: Math.max(40, d.energy - 6),
      recovery: Math.max(40, d.recovery - 7),
      clarity: Math.max(42, d.clarity - 5),
    }),
  },
  {
    id: 'family_first',
    name: 'Family First',
    description: 'Connection choices carry extra heart this decade.',
    apply: (d) => d,
  },
  {
    id: 'performance_mode',
    name: 'Performance Mode',
    description: 'Ambition is high. Recovery is the quiet constraint.',
    apply: (d) => ({
      ...d,
      recovery: Math.max(48, d.recovery - 4),
      mobility: Math.min(70, d.mobility + 3),
    }),
  },
  {
    id: 'fresh_start',
    name: 'Fresh Start',
    description: 'A clean slate. Balanced openings, open possibilities.',
    apply: (_d) => ({
      mobility: 62,
      energy: 62,
      recovery: 62,
      clarity: 62,
    }),
  },
]

export const BADGES: Badge[] = [
  {
    id: 'whole_picture',
    name: 'Whole Picture',
    description: 'Kept all four dimensions above 65 in a run.',
  },
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Revived a dimension from below 35.',
  },
  {
    id: 'ten_year_thinker',
    name: 'Ten-Year Thinker',
    description: 'Finished all ten years with intention.',
  },
  {
    id: 'consistency_wins',
    name: 'Consistency Wins',
    description: 'Triggered Momentum three times or more.',
  },
  {
    id: 'calm_under_pressure',
    name: 'Calm Under Pressure',
    description: 'Scored 700+ during a hard daily modifier.',
  },
  {
    id: 'strong_finish',
    name: 'Strong Finish',
    description: 'All dimensions 70+ at the end.',
  },
]

export const ARCHETYPES: Archetype[] = [
  {
    id: 'rebuilder',
    name: 'The Rebuilder',
    description: 'You focus on restoring what slipped — patiently and deliberately.',
  },
  {
    id: 'strategist',
    name: 'The Strategist',
    description: 'You favor insight, data, and expert perspective over guesswork.',
  },
  {
    id: 'momentum_maker',
    name: 'The Momentum Maker',
    description: 'You string good decisions together until progress compounds.',
  },
  {
    id: 'balanced_operator',
    name: 'The Balanced Operator',
    description: 'You refuse to let any one dimension carry the decade alone.',
  },
  {
    id: 'long_game_thinker',
    name: 'The Long-Game Thinker',
    description: 'You plan ahead and protect capacity for years still to come.',
  },
  {
    id: 'revival_architect',
    name: 'The Revival Architect',
    description: 'You design resilience — building systems that hold under pressure.',
  },
]

export const MICROCOPY = [
  'The goal is not perfection. It is protecting the whole picture.',
  'A strong decade is rarely built by one dramatic decision.',
  'Momentum compounds.',
  'Your best decade is something you build.',
  'You protected what mattered without sacrificing everything else.',
  'The score is fictional. The reason you chose is real.',
]

export const DISCLOSURE_SHORT =
  'For education and entertainment only. This game does not evaluate your health, diagnose any condition, predict longevity, or recommend treatment. A licensed clinician must determine whether any therapy is appropriate. Individual results vary.'

export const DISCLOSURE_FOOTER =
  "Statements regarding services have not been evaluated by the FDA. Regenerative Revival's services are not intended to diagnose, treat, cure, or prevent disease. Regenerative therapies may be considered off-label for many musculoskeletal applications. Compounded medications are not FDA-approved. Telehealth and prescribing are subject to clinical evaluation and state-specific requirements."

export const DISCOVER_CARDS = [
  {
    id: 'regen',
    title: 'Regenerative Care',
    body: 'Regenerative medicine may be delivered in the patient’s home by a licensed nurse practitioner under physician oversight. Not every person or joint is a candidate — a licensed clinician must determine candidacy.',
  },
  {
    id: 'hormones',
    title: 'Hormones & Peptides',
    body: 'Hormone optimization and peptide therapy are coordinated through telehealth. Plans are personalized and may be built around labs, under a physician-led medical team.',
  },
  {
    id: 'nad',
    title: 'NAD+ & Cellular Health',
    body: 'NAD+ therapy and longevity protocols are part of clinician-led care — coordinated with the same medical team that may manage hormones, peptides, and regenerative services.',
  },
  {
    id: 'team',
    title: 'One Coordinated Medical Team',
    body: 'Regenerative Revival brings 8+ years in regenerative medicine, 100+ licensed clinicians, 50 states covered, and 6,000+ patients treated — backed by Arora Health Group.',
  },
] as const
