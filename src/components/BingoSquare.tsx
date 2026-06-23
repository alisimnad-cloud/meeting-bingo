import { cn } from '../lib/utils'
import type { BingoSquare as BingoSquareType } from '../types'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface BingoSquareProps {
  square: BingoSquareType
  isWinning: boolean
  isOneAway: boolean
  tabIndex: number
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  onClick: () => void
}

const stateLabel: Record<string, string> = {
  default: 'unfilled',
  'manual-filled': 'filled by you',
  'auto-filled': 'filled by speech',
  'free-space': 'free space',
  winning: 'winning square',
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
    </svg>
  )
}

export default function BingoSquare({
  square,
  isWinning,
  isOneAway,
  tabIndex,
  onFocus,
  onKeyDown,
  onClick,
}: BingoSquareProps) {
  const reducedMotion = useReducedMotion()
  const { word, state } = square

  const isFreeSpace = state === 'free-space'
  const isManualFilled = state === 'manual-filled'
  const isAutoFilled = state === 'auto-filled'
  const isFilled = isManualFilled || isAutoFilled || isWinning
  // One-away hint only shows on unfilled, non-free squares when game is not won
  const showOneAway = isOneAway && state === 'default' && !isWinning

  const ariaLabel = `${word}, ${isWinning ? stateLabel.winning : stateLabel[state]}${showOneAway ? ', one away from bingo' : ''}`

  return (
    <button
      role="gridcell"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-pressed={isFreeSpace ? undefined : isFilled}
      disabled={isFreeSpace}
      onClick={isFreeSpace ? undefined : onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex h-full w-full min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg border-2 p-1 text-center text-xs font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
        // Default
        !isFilled && !isFreeSpace && !showOneAway && 'border-gray-200 bg-white text-gray-800 hover:border-purple-300 hover:bg-purple-50',
        // One-away hint (unfilled target square)
        showOneAway && 'border-amber-400 border-dashed bg-amber-50 text-amber-900 hover:bg-amber-100',
        // Manual filled
        isManualFilled && !isWinning && 'border-purple-400 bg-purple-100 text-purple-900',
        // Auto filled
        isAutoFilled && !isWinning && 'border-blue-400 bg-blue-100 text-blue-900',
        // Free space
        isFreeSpace && 'cursor-default border-gray-300 bg-gray-100 text-gray-500',
        // Winning
        isWinning && 'border-amber-400 bg-amber-100 text-amber-900',
        // Winning pulse animation
        isWinning && !reducedMotion && 'animate-pulse',
      )}
    >
      <span className="leading-tight">{word}</span>
      {showOneAway && (
        <span className="text-amber-500" aria-hidden="true">
          ◎
        </span>
      )}
      {isManualFilled && !isWinning && (
        <span className="text-purple-500" aria-hidden="true">
          ✓
        </span>
      )}
      {isAutoFilled && !isWinning && (
        <span className="text-blue-500" aria-hidden="true">
          <MicIcon />
        </span>
      )}
      {isFreeSpace && (
        <span aria-hidden="true">⭐</span>
      )}
      {isWinning && (
        <span aria-hidden="true">✨</span>
      )}
    </button>
  )
}
