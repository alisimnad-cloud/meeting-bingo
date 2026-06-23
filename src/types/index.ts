export type BingoSquareState =
  | 'default'
  | 'manual-filled'
  | 'auto-filled'
  | 'free-space'
  | 'winning'

export interface BingoSquare {
  id: string
  word: string
  state: BingoSquareState
  row: number
  col: number
}

export type BingoCard = BingoSquare[][]

export interface WinningLine {
  squares: Array<{ row: number; col: number }>
  type: 'row' | 'col' | 'diagonal-main' | 'diagonal-anti'
  lineIndex: number  // 0–11: row0-4, col0-4, diagonal-main=10, diagonal-anti=11
}

export type CategoryId = 'agile' | 'corporate' | 'tech'

export interface GameState {
  schemaVersion: number
  card: BingoCard | null
  categoryId: CategoryId | null
  isWon: boolean
  winningLines: WinningLine[]
  startedAt: string | null
  wonAt: string | null
  winningWord: string | null
}

export interface Category {
  id: CategoryId
  name: string
  icon: string
  sampleWords: string[]
  words: string[]
}

export type SpeechRecognitionStatus =
  | 'idle'
  | 'warming-up'
  | 'listening'
  | 'error'
  | 'unsupported'

export interface SpeechRecognitionState {
  status: SpeechRecognitionStatus
  transcript: string
  detectedWords: string[]
  errorMessage: string | null
  retryCount: number
}

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  durationMs: number
}
