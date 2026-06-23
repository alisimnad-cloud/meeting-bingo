import type { BingoCard, WinningLine } from '../types'

function isFilledSquare(card: BingoCard, row: number, col: number): boolean {
  const sq = card[row][col]
  return (
    sq.state === 'manual-filled' ||
    sq.state === 'auto-filled' ||
    sq.state === 'free-space'
  )
}

export function getAllLines(): WinningLine[] {
  const lines: WinningLine[] = []

  for (let r = 0; r < 5; r++) {
    lines.push({
      type: 'row',
      lineIndex: r,
      squares: Array.from({ length: 5 }, (_, c) => ({ row: r, col: c })),
    })
  }

  for (let c = 0; c < 5; c++) {
    lines.push({
      type: 'col',
      lineIndex: 5 + c,
      squares: Array.from({ length: 5 }, (_, r) => ({ row: r, col: c })),
    })
  }

  lines.push({
    type: 'diagonal-main',
    lineIndex: 10,
    squares: Array.from({ length: 5 }, (_, i) => ({ row: i, col: i })),
  })

  lines.push({
    type: 'diagonal-anti',
    lineIndex: 11,
    squares: Array.from({ length: 5 }, (_, i) => ({ row: i, col: 4 - i })),
  })

  return lines
}

export function checkForBingo(card: BingoCard): WinningLine[] {
  return getAllLines().filter((line) =>
    line.squares.every(({ row, col }) => isFilledSquare(card, row, col)),
  )
}

export function getClosestToWin(
  card: BingoCard,
): { line: WinningLine; unfilledCount: number } | null {
  if (checkForBingo(card).length > 0) return null

  let best: { line: WinningLine; unfilledCount: number } | null = null

  for (const line of getAllLines()) {
    const unfilledCount = line.squares.filter(
      ({ row, col }) => !isFilledSquare(card, row, col),
    ).length

    if (best === null || unfilledCount < best.unfilledCount) {
      best = { line, unfilledCount }
    }
  }

  return best
}
