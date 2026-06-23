import { describe, it, expect } from 'vitest'
import { detectWordsWithAliases } from './wordDetector'
import type { BingoCard, BingoSquare } from '../types'

function makeCard(words: string[]): BingoCard {
  const allWords = [...words]
  while (allWords.length < 24) allWords.push(`filler-${allWords.length}`)
  const card: BingoCard = []
  let idx = 0
  for (let row = 0; row < 5; row++) {
    const r: BingoSquare[] = []
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        r.push({ id: 'free', word: 'FREE', state: 'free-space', row, col })
      } else {
        const word = allWords[idx++]
        r.push({ id: `sq-${row}-${col}`, word, state: 'default', row, col })
      }
    }
    card.push(r)
  }
  return card
}

function firstId(card: BingoCard, word: string): string {
  return card.flat().find((sq) => sq.word === word)!.id
}

describe('detectWordsWithAliases', () => {
  it('detects an exact word match (case-insensitive)', () => {
    const card = makeCard(['velocity'])
    const ids = detectWordsWithAliases('We discussed VELOCITY in depth', card, new Set())
    expect(ids).toContain(firstId(card, 'velocity'))
  })

  it('detects a phrase match', () => {
    const card = makeCard(['user story'])
    const ids = detectWordsWithAliases('write a user story for this feature', card, new Set())
    expect(ids).toContain(firstId(card, 'user story'))
  })

  it('detects alias: "continuous integration" matches CI/CD', () => {
    const card = makeCard(['CI/CD'])
    const ids = detectWordsWithAliases(
      'we run continuous integration continuous delivery pipelines',
      card,
      new Set(),
    )
    expect(ids).toContain(firstId(card, 'CI/CD'))
  })

  it('handles slash tokens: CI/CD in transcript normalises', () => {
    const card = makeCard(['CI/CD'])
    const ids = detectWordsWithAliases('our CI/CD pipeline runs every commit', card, new Set())
    expect(ids).toContain(firstId(card, 'CI/CD'))
  })

  it('handles hyphenated words: on-call on card matches on-call in transcript', () => {
    const card = makeCard(['on-call'])
    const ids = detectWordsWithAliases('the on-call engineer handles incidents', card, new Set())
    expect(ids).toContain(firstId(card, 'on-call'))
  })

  it('handles smart quotes in transcript', () => {
    const card = makeCard(['velocity'])
    const ids = detectWordsWithAliases('‘velocity’ metric', card, new Set())
    expect(ids).toContain(firstId(card, 'velocity'))
  })

  it('does NOT match partial words (pivot != pivoting)', () => {
    const card = makeCard(['pivot'])
    const ids = detectWordsWithAliases('we are pivoting the strategy', card, new Set())
    expect(ids).not.toContain(firstId(card, 'pivot'))
  })

  it('skips squares already in filledWordIds', () => {
    const card = makeCard(['velocity'])
    const id = firstId(card, 'velocity')
    const filledIds = new Set([id])
    const ids = detectWordsWithAliases('velocity', card, filledIds)
    expect(ids).not.toContain(id)
  })

  it('skips free-space squares', () => {
    const card = makeCard(['velocity'])
    const freeId = card[2][2].id
    const ids = detectWordsWithAliases('FREE', card, new Set())
    expect(ids).not.toContain(freeId)
  })

  it('returns empty array when no words match', () => {
    const card = makeCard(['velocity'])
    const ids = detectWordsWithAliases('nothing here matches at all', card, new Set())
    expect(ids).toHaveLength(0)
  })

  it('detects multiple words in one transcript', () => {
    const card = makeCard(['velocity', 'sprint', 'backlog'])
    const ids = detectWordsWithAliases('velocity sprint backlog review', card, new Set())
    expect(ids).toHaveLength(3)
  })

  it('MVP alias: "minimum viable product" matches MVP', () => {
    const card = makeCard(['MVP'])
    const ids = detectWordsWithAliases('ship the minimum viable product', card, new Set())
    expect(ids).toContain(firstId(card, 'MVP'))
  })

  it('PR alias: "pull request" matches PR', () => {
    const card = makeCard(['pull request'])
    const ids = detectWordsWithAliases('open a pull request for review', card, new Set())
    expect(ids).toContain(firstId(card, 'pull request'))
  })
})
