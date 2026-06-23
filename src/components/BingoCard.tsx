import { useRef, useState, useCallback } from 'react'
import BingoSquareComponent from './BingoSquare'
import type { BingoCard as BingoCardType, BingoSquare, WinningLine } from '../types'

interface BingoCardProps {
  card: BingoCardType
  winningLines: WinningLine[]
  onToggleSquare: (square: BingoSquare) => void
}

export default function BingoCard({ card, winningLines, onToggleSquare }: BingoCardProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 })

  const winningCoords = new Set(
    winningLines.flatMap((l) => l.squares.map((s) => `${s.row},${s.col}`)),
  )

  const moveFocus = useCallback((row: number, col: number) => {
    setFocusedCell({ row, col })
    const cells = gridRef.current?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')
    const idx = row * 5 + col
    cells?.[idx]?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, row: number, col: number) => {
      let newRow = row
      let newCol = col

      switch (e.key) {
        case 'ArrowRight':
          newCol = col < 4 ? col + 1 : 0
          if (col === 4) newRow = row < 4 ? row + 1 : 0
          break
        case 'ArrowLeft':
          newCol = col > 0 ? col - 1 : 4
          if (col === 0) newRow = row > 0 ? row - 1 : 4
          break
        case 'ArrowDown':
          newRow = row < 4 ? row + 1 : 0
          break
        case 'ArrowUp':
          newRow = row > 0 ? row - 1 : 4
          break
        case 'Home':
          newCol = 0
          break
        case 'End':
          newCol = 4
          break
        default:
          return
      }

      e.preventDefault()
      moveFocus(newRow, newCol)
    },
    [moveFocus],
  )

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Bingo card"
      className="grid grid-cols-5 gap-1 rounded-xl bg-gray-100 p-2"
    >
      {card.map((row, ri) =>
        row.map((square, ci) => (
          <div key={square.id} role="row" style={{ display: 'contents' }}>
            <BingoSquareComponent
              square={square}
              isWinning={winningCoords.has(`${ri},${ci}`)}
              tabIndex={focusedCell.row === ri && focusedCell.col === ci ? 0 : -1}
              onFocus={() => setFocusedCell({ row: ri, col: ci })}
              onKeyDown={(e) => handleKeyDown(e, ri, ci)}
              onClick={() => onToggleSquare(square)}
            />
          </div>
        )),
      )}
    </div>
  )
}
