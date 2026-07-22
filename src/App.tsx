import { useCallback, useEffect, useMemo, useState } from 'react'
import { DisclaimerModal } from './components/DisclaimerModal'
import { DAILY_MODIFIERS, HOW_IT_WORKS_URL, QUIZ_URL } from './data/content'
import {
  advanceAfterFeedback,
  applyChoice,
  applyFinalChoice,
  createGame,
} from './lib/gameEngine'
import { track } from './lib/analytics'
import { playTone, haptic } from './lib/audio'
import { dailySeed } from './lib/rng'
import {
  buildChallengeUrl,
  generateShareCard,
  parseChallengeFromSearch,
  shareChallenge,
} from './lib/share'
import { getTodayBest, loadState, recordPlay, saveState } from './lib/storage'
import type {
  FinalMotivation,
  GameResult,
  GameState,
  PersistedState,
  Screen,
  StrategyId,
} from './types'
import { GameScreen } from './screens/GameScreen'
import { LoadingScreen } from './screens/LoadingScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { StartScreen } from './screens/StartScreen'
import { TutorialScreen } from './screens/TutorialScreen'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [stats, setStats] = useState<PersistedState>(() => loadState())
  const [game, setGame] = useState<GameState | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null)
  const [pendingChallenge, setPendingChallenge] = useState<{
    seed: string
    score: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reducedMotion =
    stats.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  // Initial load + challenge URL
  useEffect(() => {
    const stored = loadState()
    setStats(stored)

    // Sync reduced motion preference from system if first visit
    if (
      !stored.reducedMotion &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setStats(saveState({ reducedMotion: true }))
    }

    const challenge = parseChallengeFromSearch(window.location.search)
    if (challenge) {
      setPendingChallenge({ seed: challenge.seed, score: challenge.score })
      track('challenge_opened', {
        seed: challenge.seed,
        challenger_score: challenge.score,
      })
    }

    track('game_view')
    const t = window.setTimeout(() => setScreen('start'), 700)
    return () => window.clearTimeout(t)
  }, [])

  // Body class for reduced motion
  useEffect(() => {
    document.body.classList.toggle('reduce-motion', !!reducedMotion)
  }, [reducedMotion])

  const todayBest = useMemo(() => getTodayBest(stats), [stats])

  const dailyModifierName = useMemo(() => {
    try {
      const preview = createGame({ mode: 'daily', seed: dailySeed() })
      const mod = DAILY_MODIFIERS.find((m) => m.id === preview.dailyModifier)
      return mod?.name ?? null
    } catch {
      return null
    }
  }, [])

  const startGame = useCallback(
    (mode: 'random' | 'daily' | 'challenge') => {
      try {
        setShareStatus(null)
        setShareCardUrl(null)
        setResult(null)
        setError(null)

        let state: GameState
        if (mode === 'challenge' && pendingChallenge) {
          state = createGame({
            mode: 'challenge',
            seed: pendingChallenge.seed,
            challengeScore: pendingChallenge.score,
          })
          track('game_start', { mode: 'challenge', seed: state.seed })
        } else if (mode === 'daily') {
          state = createGame({ mode: 'daily' })
          track('daily_challenge_start', { seed: state.seed })
          track('game_start', { mode: 'daily', seed: state.seed })
        } else {
          state = createGame({ mode: 'random' })
          track('game_start', { mode: 'random', seed: state.seed })
        }

        setGame(state)
        setScreen('playing')
      } catch (e) {
        setError('Something went wrong starting the game. Please try again.')
        setScreen('error')
        console.error(e)
      }
    },
    [pendingChallenge],
  )

  const handleChooseStrategy = useCallback(
    (id: StrategyId) => {
      if (!game) return
      const next = applyChoice(game, id)
      setGame(next)
      playTone(stats.soundOn, next.lastCombos.length ? 'combo' : 'select')
      haptic(stats.soundOn)
      track('round_complete', { year: next.year, choice: id })
      if (next.lastCombos.length) {
        track('combo_earned', { combo: next.lastCombos.join(',') })
      }
    },
    [game, stats.soundOn],
  )

  const handleContinue = useCallback(() => {
    if (!game) return
    setGame(advanceAfterFeedback(game))
  }, [game])

  const handleFinal = useCallback(
    (motivation: FinalMotivation) => {
      if (!game) return
      const { state, result: res } = applyFinalChoice(game, motivation)
      setGame(state)
      setResult(res)
      const nextStats = recordPlay(res.score, res.badges)
      setStats(nextStats)
      playTone(stats.soundOn, 'complete')
      haptic(stats.soundOn)
      track('game_complete', {
        score: res.score,
        archetype: res.archetype,
        seed: res.seed,
      })
      setScreen('results')

      // Generate share card async
      void generateShareCard(
        res,
        buildChallengeUrl(window.location.origin + window.location.pathname, res.seed, res.score, res.archetype),
      ).then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setShareCardUrl(url)
        }
      })
    },
    [game, stats.soundOn],
  )

  const handleShare = useCallback(async () => {
    if (!result) return
    track('share_clicked', { score: result.score })
    const url = buildChallengeUrl(
      window.location.origin + window.location.pathname,
      result.seed,
      result.score,
      result.archetype,
    )
    track('challenge_link_created', { seed: result.seed })
    const status = await shareChallenge(result, url)
    if (status === 'shared') setShareStatus('Shared. Challenge sent.')
    else if (status === 'copied')
      setShareStatus('Challenge link copied to clipboard.')
    else setShareStatus('Could not share automatically. Copy the link from the address bar after refreshing with challenge params.')
  }, [result])

  const openDisclaimer = () => {
    track('disclaimer_opened')
    setDisclaimerOpen(true)
  }

  if (screen === 'loading') return <LoadingScreen />

  if (screen === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-lg text-cream">{error}</p>
        <button
          type="button"
          className="btn-primary mt-6 min-h-14 rounded-full px-8 font-semibold"
          onClick={() => {
            setError(null)
            setScreen('start')
          }}
        >
          Back to start
        </button>
      </div>
    )
  }

  return (
    <div className={reducedMotion ? 'reduce-motion' : ''}>
      {screen === 'start' && (
        <StartScreen
          stats={stats}
          todayBest={todayBest}
          challengeScore={pendingChallenge?.score ?? null}
          dailyModifierName={dailyModifierName}
          onStart={() => {
            if (pendingChallenge) startGame('challenge')
            else if (!stats.tutorialCompleted) setScreen('tutorial')
            else startGame('random')
          }}
          onDaily={() => startGame('daily')}
          onTutorial={() => setScreen('tutorial')}
          onOpenDisclaimer={openDisclaimer}
          soundOn={stats.soundOn}
          onToggleSound={() => setStats(saveState({ soundOn: !stats.soundOn }))}
        />
      )}

      {screen === 'tutorial' && (
        <TutorialScreen
          onComplete={() => {
            setStats(saveState({ tutorialCompleted: true }))
            track('tutorial_complete')
            if (pendingChallenge) startGame('challenge')
            else startGame('random')
          }}
          onSkip={() => {
            setStats(saveState({ tutorialCompleted: true }))
            if (pendingChallenge) startGame('challenge')
            else startGame('random')
          }}
        />
      )}

      {screen === 'playing' && game && (
        <GameScreen
          state={game}
          reducedMotion={!!reducedMotion}
          personalBest={stats.highestScore}
          onChooseStrategy={handleChooseStrategy}
          onContinue={handleContinue}
          onChooseFinal={handleFinal}
          onOpenDisclaimer={openDisclaimer}
        />
      )}

      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          stats={stats}
          shareStatus={shareStatus}
          shareCardUrl={shareCardUrl}
          challengeScore={game?.isChallenge ? (game.challengeScore ?? null) : null}
          onPlayAgain={() => {
            track('play_again')
            setPendingChallenge(null)
            // Drop challenge query so refresh is clean
            if (window.location.search) {
              window.history.replaceState({}, '', window.location.pathname)
            }
            startGame('random')
          }}
          onPlayDaily={() => {
            track('play_again')
            setPendingChallenge(null)
            startGame('daily')
          }}
          onShare={handleShare}
          onQuiz={() => {
            track('quiz_cta_clicked')
            window.open(QUIZ_URL, '_blank', 'noopener,noreferrer')
          }}
          onHowItWorks={() => {
            track('how_it_works_clicked')
            window.open(HOW_IT_WORKS_URL, '_blank', 'noopener,noreferrer')
          }}
          onOpenDisclaimer={openDisclaimer}
        />
      )}

      <DisclaimerModal
        open={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />
    </div>
  )
}
