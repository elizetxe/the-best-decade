/**
 * Lightweight engine self-tests (run with: npx tsx src/lib/engine.test.ts)
 */
import {
  advanceAfterFeedback,
  applyChoice,
  applyFinalChoice,
  createGame,
} from './gameEngine'
import { clamp, clampScore } from './scoring'
import type { StrategyId } from '../types'

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

function playFull(seed: string, pickIndex = 0) {
  let state = createGame({ mode: 'challenge', seed, challengeScore: 500 })
  const choiceIds: string[] = []

  for (let y = 1; y <= 9; y++) {
    assert(state.phase === 'choice', `year ${y} should be choice`)
    assert(state.currentChoices.length === 3, `year ${y} needs 3 choices`)
    const pick = state.currentChoices[pickIndex % 3]
    choiceIds.push(pick.id)
    state = applyChoice(state, pick.id as StrategyId)
    assert(state.phase === 'feedback', 'should feedback')
    // dims in range
    for (const v of Object.values(state.dimensions)) {
      assert(v >= 0 && v <= 100, `dim out of range: ${v}`)
    }
    state = advanceAfterFeedback(state)
  }

  assert(state.phase === 'final', 'year 10 final')
  const { result } = applyFinalChoice(state, 'family')
  assert(result.score >= 0 && result.score <= 1000, `score ${result.score}`)
  assert(!!result.archetype, 'archetype')
  return { result, choiceIds, seed }
}

// Determinism
const a = playFull('challenge-test-seed-42', 0)
const b = playFull('challenge-test-seed-42', 0)
assert(
  JSON.stringify(a.choiceIds) === JSON.stringify(b.choiceIds),
  'same seed must produce same choice sequence',
)
assert(a.result.score === b.result.score, 'same seed same score path')

// Different picks different scores often
const c = playFull('challenge-test-seed-42', 1)
// sequence of offered choices same, picks different
assert(
  JSON.stringify(a.choiceIds) !== JSON.stringify(c.choiceIds) ||
    a.result.score !== c.result.score,
  'different pick indices should diverge',
)

// Daily seed format
const daily = createGame({ mode: 'daily', seed: 'daily-2026-07-22' })
assert(daily.isDaily || daily.seed.startsWith('daily-'), 'daily flag')
assert(daily.dailyModifier != null, 'daily has modifier')

// Clamp helpers
assert(clamp(-5) === 0, 'clamp low')
assert(clamp(150) === 100, 'clamp high')
assert(clampScore(2000) === 1000, 'score clamp')

// No early elimination — always 10 rounds of history after finish
assert(a.result.rounds.length === 10, 'ten rounds')

// Always-winning check: play all strategies across seeds, verify variance
const scores: number[] = []
for (let s = 0; s < 8; s++) {
  for (let pick = 0; pick < 3; pick++) {
    scores.push(playFull(`seed-var-${s}`, pick).result.score)
  }
}
const min = Math.min(...scores)
const max = Math.max(...scores)
assert(max - min > 20, `scores should vary (min ${min} max ${max})`)
assert(min >= 0 && max <= 1000, 'scores in range')
assert(max < 1000, 'should not always hit ceiling')
assert(min < 900, 'should not always be elite')

// Deterministic daily
const d1 = createGame({ mode: 'daily', seed: 'daily-2026-07-22' })
const d2 = createGame({ mode: 'daily', seed: 'daily-2026-07-22' })
assert(d1.dailyModifier === d2.dailyModifier, 'daily modifier deterministic')
assert(
  d1.choiceSets[0].map((c) => c.id).join() ===
    d2.choiceSets[0].map((c) => c.id).join(),
  'daily choices deterministic',
)

// Challenge embeds score comparison data
const challenged = createGame({
  mode: 'challenge',
  seed: 'challenge-test-seed-42',
  challengeScore: 842,
})
assert(challenged.challengeScore === 842, 'challenge score embedded')

console.log('✓ All engine tests passed')
console.log(`  Sample score range across runs: ${min}–${max}`)
console.log(`  Deterministic score for seed-42 pick0: ${a.result.score}`)
