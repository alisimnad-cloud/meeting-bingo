import { useState, useCallback, useRef, useEffect } from 'react'
import { ToastProvider, useToast } from './hooks/useToast'
import { ToastContainer } from './components/ui/Toast'
import { useGame } from './hooks/useGame'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { detectWordsWithAliases } from './lib/wordDetector'
import { getCategoryById } from './data/categories'
import { ErrorBoundary } from './components/ErrorBoundary'
import LandingPage from './components/LandingPage'
import CategorySelect from './components/CategorySelect'
import GameBoard from './components/GameBoard'
import WinScreen from './components/WinScreen'
import type { CategoryId } from './types'

type Screen = 'landing' | 'category' | 'game' | 'win'

function AppInner() {
  const [screen, setScreen] = useState<Screen>('landing')
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const { gameState, startGame, fillSquare, newCard, resetGame } = useGame()
  const filledWordIds = useRef(new Set<string>())
  const [detectedWords, setDetectedWords] = useState<string[]>([])
  const [ariaLiveText, setAriaLiveText] = useState('')
  const { toasts, removeToast } = useToast()

  // Focus h1 on every screen change for screen-reader context
  useEffect(() => {
    const id = setTimeout(() => h1Ref.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [screen])

  // Transition to win screen when game is won
  useEffect(() => {
    if (gameState.isWon && screen === 'game') {
      setScreen('win')
    }
  }, [gameState.isWon, screen])

  const onFinalResult = useCallback(
    (transcript: string) => {
      if (!gameState.card) return
      const newIds = detectWordsWithAliases(transcript, gameState.card, filledWordIds.current)
      for (const id of newIds) {
        filledWordIds.current.add(id)
        const square = gameState.card.flat().find((sq) => sq.id === id)
        if (square) {
          fillSquare(square.row, square.col, true)
          setDetectedWords((prev) => [square.word, ...prev].slice(0, 10))
          setAriaLiveText(`${square.word} detected and filled`)
        }
      }
    },
    [gameState.card, fillSquare],
  )

  const speech = useSpeechRecognition(onFinalResult)

  const handleToggleMic = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening()
    } else {
      speech.startListening()
    }
  }, [speech])

  const handleNewCard = useCallback(() => {
    filledWordIds.current = new Set()
    speech.resetTranscript()
    setDetectedWords([])
    newCard()
  }, [newCard, speech])

  const handleReset = useCallback(() => {
    filledWordIds.current = new Set()
    speech.stopListening()
    speech.resetTranscript()
    setDetectedWords([])
    setAriaLiveText('')
    resetGame()
    setScreen('landing')
  }, [resetGame, speech])

  const handleCategorySelect = useCallback(
    (id: CategoryId) => {
      startGame(id)
      setScreen('game')
    },
    [startGame],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {screen === 'landing' && (
        <LandingPage h1Ref={h1Ref} onStart={() => setScreen('category')} />
      )}

      {screen === 'category' && (
        <CategorySelect h1Ref={h1Ref} onSelect={handleCategorySelect} />
      )}

      {screen === 'game' && gameState.card && gameState.categoryId && (
        <ErrorBoundary onReset={handleReset}>
          <GameBoard
            h1Ref={h1Ref}
            card={gameState.card}
            category={getCategoryById(gameState.categoryId)}
            winningLines={gameState.winningLines}
            speechStatus={speech.status}
            transcript={speech.transcript}
            detectedWords={detectedWords}
            ariaLiveText={ariaLiveText}
            onToggleSquare={(sq) => fillSquare(sq.row, sq.col, false)}
            onToggleMic={handleToggleMic}
            onNewCard={handleNewCard}
          />
        </ErrorBoundary>
      )}

      {screen === 'win' && gameState.card && gameState.categoryId && (
        <ErrorBoundary onReset={handleReset}>
          <WinScreen
            h1Ref={h1Ref}
            gameState={gameState}
            category={getCategoryById(gameState.categoryId)}
            onPlayAgain={handleReset}
          />
        </ErrorBoundary>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
