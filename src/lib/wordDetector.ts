import type { BingoCard } from '../types'

const ALIASES: Record<string, string[]> = {
  // Tech
  'ci/cd': [
    'ci cd',
    'cicd',
    'continuous integration continuous delivery',
    'continuous integration',
    'continuous delivery',
  ],
  'a/b test': ['a b test', 'ab test', 'split test', 'a b testing', 'ab testing'],
  mvp: ['minimum viable product'],
  roi: ['return on investment'],
  api: ['application programming interface'],
  devops: ['dev ops', 'development operations'],
  sla: ['service level agreement', 'service level agreements'],
  slo: ['service level objective', 'service level objectives'],
  sli: ['service level indicator', 'service level indicators'],
  sre: ['site reliability engineering', 'site reliability engineer'],
  etl: ['extract transform load', 'extract transform and load'],
  cdn: ['content delivery network'],
  'blue-green deployment': ['blue green deployment', 'blue green deploy'],
  'infrastructure as code': ['iac', 'infra as code'],
  'event driven': ['event-driven', 'event driven architecture'],
  'message queue': ['message queuing', 'message bus'],
  'rate limiting': ['rate limiter', 'rate limit'],
  'load balancer': ['load balancing'],
  'circuit breaker': ['circuit breaker pattern'],
  'chaos engineering': ['chaos monkey'],
  'dependency injection': ['di', 'inversion of control', 'ioc'],
  'shift left': ['shift-left'],
  'shift right': ['shift-right'],
  'golden path': ['golden path toolchain', 'paved road'],

  // Agile
  wip: ['work in progress', 'works in progress'],
  okr: ['objectives and key results', 'objective and key results'],
  kpi: ['key performance indicator', 'key performance indicators', 'key metrics'],
  safe: ['scaled agile framework', 'scaled agile'],
  'mob programming': ['ensemble programming', 'mob prog'],
  'definition of done': ['dod', 'done done'],
  'definition of ready': ['dor'],
  'planning poker': ['story point poker', 'estimation poker'],
  'story splitting': ['story slicing', 'splitting stories'],
  'working agreement': ['team agreement', 'team norms'],
  'information radiator': ['big visible chart', 'team dashboard'],
  'continuous improvement': ['kaizen', 'continuous improvement cycle'],
  'fail fast': ['fail fast learn fast'],
  'inspect and adapt': ['inspect adapt'],

  // Corporate
  ux: ['user experience'],
  pr: ['pull request'],
  'circle back': ['loop back', 'circle back around', 'revisit'],
  'touch base': ['touching base', 'check in', 'sync up'],
  'move the needle': ['moving the needle', 'make an impact'],
  'boil the ocean': ['boiling the ocean'],
  'low-hanging fruit': ['low hanging fruit', 'easy wins', 'quick wins'],
  'deep dive': ['deep-dive', 'deep diving', 'dig in'],
  'paradigm shift': ['paradigm change', 'mind shift'],
  'value proposition': ['value prop', 'value add'],
  'blue sky': ['blue sky thinking', 'blue-sky thinking', 'blue sky ideation'],
  leverage: ['leveraging', 'capitalize on'],
  'scope creep': ['scope expansion', 'feature creep'],
  'thought leader': ['thought leadership'],
  'pain point': ['pain points', 'friction point'],
  bandwidth: ['capacity', 'bandwidth check'],
  'on my radar': ['on the radar'],
  'at the end of the day': ['at the end of day', 'ultimately'],
  'going forward': ['going forwards', 'from here on out', 'moving forward'],
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
