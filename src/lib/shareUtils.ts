import type { Category, GameState } from '../types'

type ShareResult =
  | { method: 'native' }
  | { method: 'clipboard' }
  | { method: 'fallback'; text: string }

function formatElapsed(startedAt: string | null, wonAt: string | null): string {
  if (!startedAt || !wonAt) return '—'
  const ms = new Date(wonAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function buildShareText(gameState: GameState, category: Category): string {
  const filledCount =
    gameState.card?.flat().filter((sq) => sq.state !== 'default' && sq.state !== 'free-space')
      .length ?? 0
  const time = formatElapsed(gameState.startedAt, gameState.wonAt)
  const word = gameState.winningWord ?? ''

  return [
    'BINGO! I won Meeting Bingo!',
    `Category: ${category.name}`,
    `Time: ${time}`,
    word ? `Winning word: "${word}"` : '',
    `Squares filled: ${filledCount}/24`,
    '',
    'Play at: https://meeting-bingo.vercel.app',
  ]
    .filter((line) => line !== null)
    .join('\n')
}

export async function shareResult(
  gameState: GameState,
  category: Category,
): Promise<ShareResult> {
  const text = buildShareText(gameState, category)
  const title = 'Meeting Bingo — I got BINGO!'

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text })
      return { method: 'native' }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // User cancelled — fall through
      } else {
        // Other error — fall through to clipboard
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return { method: 'clipboard' }
  } catch {
    return { method: 'fallback', text }
  }
}
