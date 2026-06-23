import { describe, it, expect } from 'vitest'
import { checkForBingo, getClosestToWin, getAllLines } from './bingoChecker'
import { generateCard } from './cardGenerator'
import { getCategoryById } from '../data/categories'
import type { BingoCard, BingoSquare } from '../types'

function makeEmptyCard(): BingoCard {
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col): BingoSquare => ({
      id: `test-${row}-${col}`,
      word: `word-${row}-${col}`,
      state: row === 2 && col === 2 ? 'free-space' : 'default',
      row,
      col,
    })),
  )
}

function fillRow(card: BingoCard, row: number): BingoCard {
  return card.map((r, ri) =>
    ri !== row
      ? r
      : r.map((sq) =>
          sq.state === 'free-space' ? sq : { ...sq, state: 'manual-filled' },
        ),
  )
}

function fillCol(card: BingoCard, col: number): BingoCard {
  return card.map((r) =>
    r.map((sq) =>
      sq.col !== col || sq.state === 'free-space'
        ? sq
        : { ...sq, state: 'manual-filled' },
    ),
  )
}

function fillCoords(card: BingoCard, coords: Array<[number, number]>): BingoCard {
  const set = new Set(coords.map(([r, c]) => `${r},${c}`))
  return card.map((row) =>
    row.map((sq) =>
      set.has(`${sq.row},${sq.col}`) && sq.state !== 'free-space'
        ? { ...sq, state: 'manual-filled' as const }
        : sq,
    ),
  )
}

describe('getAllLines', () => {
  it('returns exactly 12 lines', () => {
    expect(getAllLines()).toHaveLength(12)
  })

  it('contains 5 rows, 5 cols, 2 diagonals', () => {
    const lines = getAllLines()
    expect(lines.filter((l) => l.type === 'row')).toHaveLength(5)
    expect(lines.filter((l) => l.type === 'col')).toHaveLength(5)
    expect(lines.filter((l) => l.type === 'diagonal-main')).toHaveLength(1)
    expect(lines.filter((l) => l.type === 'diagonal-anti')).toHaveLength(1)
  })
})

describe('checkForBingo', () => {
  it('returns empty array on a fresh card', () => {
    const card = makeEmptyCard()
    expect(checkForBingo(card)).toHaveLength(0)
  })

  it.each([0, 1, 2, 3, 4])('detects bingo on row %i', (row) => {
    const card = fillRow(makeEmptyCard(), row)
    const result = checkForBingo(card)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('row')
    expect(result[0].lineIndex).toBe(row)
  })

  it.each([0, 1, 2, 3, 4])('detects bingo on col %i', (col) => {
    const card = fillCol(makeEmptyCard(), col)
    const result = checkForBingo(card)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('col')
    expect(result[0].lineIndex).toBe(5 + col)
  })

  it('detects bingo on the main diagonal', () => {
    const card = fillCoords(makeEmptyCard(), [
      [0, 0],
      [1, 1],
      [3, 3],
      [4, 4],
    ])
    const result = checkForBingo(card)
    expect(result.some((l) => l.type === 'diagonal-main')).toBe(true)
  })

  it('detects bingo on the anti-diagonal', () => {
    const card = fillCoords(makeEmptyCard(), [
      [0, 4],
      [1, 3],
      [3, 1],
      [4, 0],
    ])
    const result = checkForBingo(card)
    expect(result.some((l) => l.type === 'diagonal-anti')).toBe(true)
  })

  it('free space at [2][2] counts toward winning lines', () => {
    // Row 2 wins with only 4 manual fills (free space at [2][2])
    const card = fillCoords(makeEmptyCard(), [
      [2, 0],
      [2, 1],
      [2, 3],
      [2, 4],
    ])
    const result = checkForBingo(card)
    expect(result.some((l) => l.type === 'row' && l.lineIndex === 2)).toBe(true)
  })

  it('detects multiple simultaneous winning lines', () => {
    // Row 0 + col 0 win at the same time
    const card = fillRow(fillCol(makeEmptyCard(), 0), 0)
    const result = checkForBingo(card)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('works with a generated card', () => {
    const cat = getCategoryById('agile')
    const card = generateCard(cat)
    expect(checkForBingo(card)).toHaveLength(0) // fresh card never has bingo
  })
})

describe('getClosestToWin', () => {
  it('returns null when the card already has bingo', () => {
    const card = fillRow(makeEmptyCard(), 0)
    expect(getClosestToWin(card)).toBeNull()
  })

  it('returns a result with unfilledCount: 1 when one square away', () => {
    // Fill 4 of 5 in row 0 (square [0][0] is left empty)
    const card = fillCoords(makeEmptyCard(), [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ])
    const result = getClosestToWin(card)
    expect(result).not.toBeNull()
    expect(result!.unfilledCount).toBe(1)
  })

  it('returns a result on a fully empty card', () => {
    const card = makeEmptyCard()
    const result = getClosestToWin(card)
    expect(result).not.toBeNull()
    // Free space contributes, so diagonal-main/anti or any line through [2][2] has 1 free + 0 filled
    expect(result!.unfilledCount).toBeGreaterThan(0)
  })

  it('prefers the line with fewer unfilled squares', () => {
    // Row 0: 3 filled (2 missing), Row 1: 4 filled (1 missing)
    const card = fillCoords(
      fillCoords(makeEmptyCard(), [
        [0, 0],
        [0, 1],
        [0, 2],
      ]),
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
    )
    const result = getClosestToWin(card)
    expect(result!.unfilledCount).toBe(1)
    expect(result!.line.lineIndex).toBe(1) // row 1
  })
})
