import { describe, it, expect } from 'vitest'
import { CATEGORIES, getCategoryById, assertUniqueWords, assertNoCrossCategoryDuplicates } from './categories'

describe('CATEGORIES', () => {
  it('exports 3 categories', () => {
    expect(CATEGORIES).toHaveLength(3)
  })

  it.each(CATEGORIES)('$name has ≥80 words', ({ words }) => {
    expect(words.length).toBeGreaterThanOrEqual(80)
  })

  it.each(CATEGORIES)('$name has no duplicate words (case-insensitive)', ({ id, words }) => {
    expect(() => assertUniqueWords(words, id)).not.toThrow()
  })

  it.each(CATEGORIES)('$name has required fields', ({ id, name, icon, sampleWords, words }) => {
    expect(id).toBeTruthy()
    expect(name).toBeTruthy()
    expect(icon).toBeTruthy()
    expect(sampleWords.length).toBeGreaterThanOrEqual(3)
    expect(sampleWords.length).toBeLessThanOrEqual(5)
    expect(words.length).toBeGreaterThan(0)
  })
})

describe('getCategoryById', () => {
  it('returns the correct category', () => {
    const cat = getCategoryById('agile')
    expect(cat.id).toBe('agile')
  })

  it('throws for an unknown category id', () => {
    expect(() => getCategoryById('unknown' as never)).toThrow('Unknown category')
  })
})

describe('assertNoCrossCategoryDuplicates', () => {
  it('passes for the actual CATEGORIES (no cross-category duplicates)', () => {
    expect(() => assertNoCrossCategoryDuplicates(CATEGORIES)).not.toThrow()
  })

  it('throws when the same word appears in two categories', () => {
    const cats = [
      { id: 'agile' as const, name: 'A', icon: '', sampleWords: [], words: ['sprint', 'pivot'] },
      { id: 'corporate' as const, name: 'B', icon: '', sampleWords: [], words: ['synergy', 'pivot'] },
    ]
    expect(() => assertNoCrossCategoryDuplicates(cats)).toThrow('"pivot"')
  })

  it('is case-insensitive across categories', () => {
    const cats = [
      { id: 'agile' as const, name: 'A', icon: '', sampleWords: [], words: ['Sprint'] },
      { id: 'corporate' as const, name: 'B', icon: '', sampleWords: [], words: ['sprint'] },
    ]
    expect(() => assertNoCrossCategoryDuplicates(cats)).toThrow()
  })
})

describe('assertUniqueWords', () => {
  it('does not throw for unique words', () => {
    expect(() => assertUniqueWords(['foo', 'bar', 'baz'], 'test')).not.toThrow()
  })

  it('throws when duplicates are present', () => {
    expect(() => assertUniqueWords(['foo', 'bar', 'foo'], 'test')).toThrow(
      'Duplicate words in category "test"'
    )
  })

  it('is case-insensitive', () => {
    expect(() => assertUniqueWords(['Foo', 'foo'], 'test')).toThrow()
  })
})
