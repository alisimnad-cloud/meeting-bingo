import { useCallback } from 'react'
import type { CategoryId, GameState } from '../types'
import { generateCard } from '../lib/cardGenerator'
import { checkForBingo } from '../lib/bingoChecker'
import { getCategoryById } from '../data/categories'
import { useLocalStorage } from './useLocalStorage'

const CURRENT_SCHEMA_VERSION = 1

const DEFAULT_STATE: GameState = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  card: null,
  categoryId: null,
  isWon: false,
  winningLines: [],
  startedAt: null,
  wonAt: null,
  winningWord: null,
}

export function useGame() {
  const [gameState, setGameState, clearGameState] = useLocalStorage<GameState>(
    'bingo-game-state',
    DEFAULT_STATE,
  )

  // Clear stale schema on first access (runs synchronously in render — safe for guards)
  if (gameState.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    clearGameState()
  }

  const startGame = useCallback(
    (categoryId: CategoryId) => {
      const category = getCategoryById(categoryId)
      const card = generateCard(category)
      setGameState({
        ...DEFAULT_STATE,
        categoryId,
        card,
        startedAt: new Date().toISOString(),
      })
    },
    [setGameState],
  )

  const fillSquare = useCallback(
    (row: number, col: number, isAuto: boolean) => {
      setGameState((prev) => {
        if (!prev.card || prev.isWon) return prev
        const square = prev.card[row][col]
        if (square.state === 'free-space') return prev

        const newSquareState =
          square.state === 'default'
            ? isAuto
              ? ('auto-filled' as const)
              : ('manual-filled' as const)
            : ('default' as const)

        const newCard = prev.card.map((r, ri) =>
          r.map((sq, ci) =>
            ri === row && ci === col ? { ...sq, state: newSquareState } : sq,
          ),
        )

        const winningLines = checkForBingo(newCard)
        const justWon = winningLines.length > 0 && !prev.isWon

        return {
          ...prev,
          card: newCard,
          isWon: winningLines.length > 0,
          winningLines,
          wonAt: justWon ? new Date().toISOString() : prev.wonAt,
          winningWord: justWon ? square.word : prev.winningWord,
        }
      })
    },
    [setGameState],
  )

  const newCard = useCallback(() => {
    setGameState((prev) => {
      if (!prev.categoryId) return prev
      const category = getCategoryById(prev.categoryId)
      const card = generateCard(category)
      return {
        ...DEFAULT_STATE,
        categoryId: prev.categoryId,
        card,
        startedAt: new Date().toISOString(),
      }
    })
  }, [setGameState])

  const resetGame = useCallback(() => {
    clearGameState()
  }, [clearGameState])

  return { gameState, startGame, fillSquare, newCard, resetGame }
}
