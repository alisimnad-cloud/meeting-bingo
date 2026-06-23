import type { BingoCard, BingoSquare, Category } from '../types'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateCard(category: Category): BingoCard {
  const words = shuffle(category.words).slice(0, 24)
  const card: BingoCard = []
  let wordIdx = 0

  for (let row = 0; row < 5; row++) {
    const rowArr: BingoSquare[] = []
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        rowArr.push({
          id: `${category.id}-free`,
          word: 'FREE',
          state: 'free-space',
          row,
          col,
        })
      } else {
        const word = words[wordIdx++]
        rowArr.push({
          id: `${category.id}-${row}-${col}`,
          word,
          state: 'default',
          row,
          col,
        })
      }
    }
    card.push(rowArr)
  }

  return card
}

export function assertNoDuplicates(card: BingoCard): void {
  const words = card
    .flat()
    .filter((sq) => sq.state !== 'free-space')
    .map((sq) => sq.word.toLowerCase())
  const unique = new Set(words)
  if (unique.size !== words.length) {
    throw new Error('Card contains duplicate words')
  }
}
