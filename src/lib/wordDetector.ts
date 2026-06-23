import type { BingoCard } from '../types'

const ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration continuous delivery'],
  mvp: ['minimum viable product'],
  roi: ['return on investment'],
  api: ['application programming interface'],
  devops: ['dev ops'],
  sla: ['service level agreement'],
  ux: ['user experience'],
  pr: ['pull request'],
  'a/b test': ['a b test', 'ab test', 'split test'],
  sre: ['site reliability engineering'],
  etl: ['extract transform load'],
  cdn: ['content delivery network'],
  wip: ['work in progress'],
  okr: ['objectives and key results'],
  kpi: ['key performance indicator'],
  safe: ['scaled agile framework'],
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\//g, ' ')
    .replace(/-/g, ' ')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesPattern(normTranscript: string, pattern: string): boolean {
  const escaped = escapeRegex(pattern)
  const regex = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'i')
  return regex.test(normTranscript)
}

export function detectWordsWithAliases(
  transcript: string,
  card: BingoCard,
  filledWordIds: Set<string>,
): string[] {
  const normTranscript = normalise(transcript)
  const detected: string[] = []

  for (const row of card) {
    for (const square of row) {
      if (square.state === 'free-space') continue
      if (filledWordIds.has(square.id)) continue

      const normWord = normalise(square.word)
      const aliases = (ALIASES[square.word.toLowerCase()] ?? []).map(normalise)
      const patterns = [normWord, ...aliases]

      for (const pattern of patterns) {
        if (matchesPattern(normTranscript, pattern)) {
          detected.push(square.id)
          break
        }
      }
    }
  }

  return detected
}
