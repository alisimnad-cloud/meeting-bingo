import { useEffect, useRef, type RefObject } from 'react'
import type { BingoCard, BingoSquare, Category, WinningLine } from '../types'
import type { SpeechRecognitionStatus } from '../types'
import BingoCardComponent from './BingoCard'
import TranscriptPanel from './TranscriptPanel'
import GameControls from './GameControls'
import { getClosestToWin } from '../lib/bingoChecker'
import { useToast } from '../hooks/useToast'

interface GameBoardProps {
  h1Ref: RefObject<HTMLHeadingElement>
  card: BingoCard
  category: Category
  winningLines: WinningLine[]
  speechStatus: SpeechRecognitionStatus
  transcript: string
  detectedWords: string[]
  ariaLiveText: string
  onToggleSquare: (square: BingoSquare) => void
  onToggleMic: () => void
  onNewCard: () => void
}

export default function GameBoard({
  h1Ref,
  card,
  category,
  winningLines,
  speechStatus,
  transcript,
  detectedWords,
  ariaLiveText,
  onToggleSquare,
  onToggleMic,
  onNewCard,
}: GameBoardProps) {
  const { addToast } = useToast()
  const lastOneAwayLineRef = useRef<number | null>(null)

  // One-away toast
  useEffect(() => {
    if (winningLines.length > 0) return
    const closest = getClosestToWin(card)
    if (!closest || closest.unfilledCount !== 1) {
      lastOneAwayLineRef.current = null
      return
    }
    if (lastOneAwayLineRef.current === closest.line.lineIndex) return
    lastOneAwayLineRef.current = closest.line.lineIndex
    addToast('One away from BINGO!', 'info', 5000)
  }, [card, winningLines, addToast])

  const filledCount = card.flat().filter(
    (sq) => sq.state !== 'default' && sq.state !== 'free-space',
  ).length

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1
          ref={h1Ref}
          tabIndex={-1}
          className="text-xl font-bold text-gray-900 outline-none"
        >
          {category.icon} {category.name} Bingo
        </h1>
        <span className="text-sm text-gray-500">{filledCount}/24 filled</span>
      </div>

      <BingoCardComponent
        card={card}
        winningLines={winningLines}
        onToggleSquare={onToggleSquare}
      />

      <GameControls
        status={speechStatus}
        onToggleMic={onToggleMic}
        onNewCard={onNewCard}
      />

      <TranscriptPanel
        status={speechStatus}
        transcript={transcript}
        detectedWords={detectedWords}
      />

      {/* Screen-reader live region for auto-fills and wins */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaLiveText}
      </div>
    </main>
  )
}
