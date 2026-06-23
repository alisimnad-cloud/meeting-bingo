import { describe, it, expect } from 'vitest'
import { generateCard, assertNoDuplicates } from './cardGenerator'
import { getCategoryById } from '../data/categories'

const agile = getCategoryById('agile')

describe('generateCard', () => {
  it('returns a 5×5 grid', () => {
    const card = generateCard(agile)
    expect(card).toHaveLength(5)
    card.forEach((row) => expect(row).toHaveLength(5))
  })

  it('places a free space at [2][2]', () => {
    const card = generateCard(agile)
    const center = card[2][2]
    expect(center.state).toBe('free-space')
    expect(center.word).toBe('FREE')
  })

  it('starts all non-free squares in default state', () => {
    const card = generateCard(agile)
    card.flat().forEach((sq) => {
      if (sq.state !== 'free-space') {
        expect(sq.state).toBe('default')
      }
    })
  })

  it('has 24 non-free squares', () => {
    const card = generateCard(agile)
    const nonFree = card.flat().filter((sq) => sq.state !== 'free-space')
    expect(nonFree).toHaveLength(24)
  })

  it('has no duplicate words', () => {
    const card = generateCard(agile)
    expect(() => assertNoDuplicates(card)).not.toThrow()
  })

  it('each square has a unique id', () => {
    const card = generateCard(agile)
    const ids = card.flat().map((sq) => sq.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each square has correct row and col', () => {
    const card = generateCard(agile)
    card.forEach((row, ri) =>
      row.forEach((sq, ci) => {
        expect(sq.row).toBe(ri)
        expect(sq.col).toBe(ci)
      }),
    )
  })

  it('produces different cards on repeated calls (probabilistic)', () => {
    const cards = Array.from({ length: 3 }, () =>
      generateCard(agile)
        .flat()
        .map((sq) => sq.word)
        .join(','),
    )
    // At least two of the three must differ (extremely unlikely they're all the same)
    const unique = new Set(cards)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('works for all three categories', () => {
    for (const id of ['agile', 'corporate', 'tech'] as const) {
      const cat = getCategoryById(id)
      const card = generateCard(cat)
      expect(card).toHaveLength(5)
      expect(card[2][2].state).toBe('free-space')
      expect(() => assertNoDuplicates(card)).not.toThrow()
    }
  })
})

describe('assertNoDuplicates', () => {
  it('throws on a card with duplicate words', () => {
    const card = generateCard(agile)
    // Inject a duplicate
    card[0][0] = { ...card[0][1], row: 0, col: 0, id: 'agile-0-0' }
    expect(() => assertNoDuplicates(card)).toThrow('duplicate')
  })

  it('does not throw on a valid card', () => {
    const card = generateCard(agile)
    expect(() => assertNoDuplicates(card)).not.toThrow()
  })
})
