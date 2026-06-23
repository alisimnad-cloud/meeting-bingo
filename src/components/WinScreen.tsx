import { useEffect, useRef, useState, type RefObject } from 'react'
import { Button } from './ui/Button'
import BingoCardComponent from './BingoCard'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { shareResult } from '../lib/shareUtils'
import { useToast } from '../hooks/useToast'
import type { Category, GameState } from '../types'

interface WinScreenProps {
  h1Ref: RefObject<HTMLHeadingElement>
  gameState: GameState
  category: Category
  onPlayAgain: () => void
}

function formatElapsed(startedAt: string | null, wonAt: string | null): string {
  if (!startedAt || !wonAt) return ''
  const ms = new Date(wonAt).getTime() - new Date(startedAt).getTime()
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

export default function WinScreen({ h1Ref, gameState, category, onPlayAgain }: WinScreenProps) {
  const reducedMotion = useReducedMotion()
  const { addToast } = useToast()
  const [isSharing, setIsSharing] = useState(false)
  const [fallbackText, setFallbackText] = useState<string | null>(null)
  const fallbackRef = useRef<HTMLTextAreaElement>(null)

  // Dynamic confetti import — never in the initial bundle
  useEffect(() => {
    if (reducedMotion) return
    let cancelled = false
    import('canvas-confetti').then((mod) => {
      if (cancelled) return
      void mod.default({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      })
    })
    return () => {
      cancelled = true
    }
  }, [reducedMotion])

  // Focus the fallback textarea when it appears
  useEffect(() => {
    if (fallbackText) {
      fallbackRef.current?.select()
    }
  }, [fallbackText])

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await shareResult(gameState, category)
      if (result.method === 'clipboard') {
        addToast('Copied to clipboard!', 'success')
      } else if (result.method === 'fallback') {
        setFallbackText(result.text)
      }
    } finally {
      setIsSharing(false)
    }
  }

  const elapsedTime = formatElapsed(gameState.startedAt, gameState.wonAt)
  const filledCount =
    gameState.card?.flat().filter((sq) => sq.state !== 'default' && sq.state !== 'free-space')
      .length ?? 0

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-8">
      {/* Announcement */}
      <div className="text-center">
        <div className="text-6xl" aria-hidden="true">
          {reducedMotion ? '🏆' : '🎉'}
        </div>
        <h1
          ref={h1Ref}
          tabIndex={-1}
          className="mt-3 text-4xl font-bold text-gray-900 outline-none"
        >
          BINGO!
        </h1>
        <p className="mt-1 text-lg text-gray-600">
          {gameState.winningWord
            ? `"${gameState.winningWord}" sealed the deal`
            : 'You won!'}
        </p>
        {elapsedTime && (
          <p className="mt-1 text-sm text-gray-500">
            Time: {elapsedTime} · {filledCount} squares filled
          </p>
        )}
      </div>

      {/* Reduced-motion static banner */}
      {reducedMotion && (
        <div
          role="status"
          className="rounded-xl border-2 border-amber-400 bg-amber-50 px-8 py-4 text-2xl font-bold text-amber-800"
        >
          BINGO!
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={handleShare} isLoading={isSharing} variant="secondary">
          Share result
        </Button>
        <Button size="lg" onClick={onPlayAgain}>
          Play again
        </Button>
      </div>

      {/* Fallback share textarea */}
      {fallbackText && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share your result"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setFallbackText(null)}
        >
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
            <h2 className="mb-3 font-semibold text-gray-900">Copy your result</h2>
            <textarea
              ref={fallbackRef}
              readOnly
              value={fallbackText}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-mono text-gray-700"
              rows={8}
            />
            <Button
              className="mt-3 w-full"
              variant="ghost"
              onClick={() => setFallbackText(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Card review */}
      <details className="w-full">
        <summary className="cursor-pointer rounded-lg py-2 text-sm font-medium text-purple-700 hover:text-purple-900">
          Review your card
        </summary>
        <div className="mt-3">
          {gameState.card && (
            <BingoCardComponent
              card={gameState.card}
              winningLines={gameState.winningLines}
              onToggleSquare={() => {}}
            />
          )}
        </div>
      </details>

      <div aria-live="assertive" className="sr-only">
        BINGO! You won{elapsedTime ? ` in ${elapsedTime}` : ''}!
      </div>
    </main>
  )
}
