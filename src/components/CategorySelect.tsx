import type { RefObject } from 'react'
import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { Button } from './ui/Button'
import type { CategoryId } from '../types'

interface CategorySelectProps {
  h1Ref: RefObject<HTMLHeadingElement>
  onSelect: (id: CategoryId) => void
}

export default function CategorySelect({ h1Ref, onSelect }: CategorySelectProps) {
  const [selected, setSelected] = useState<CategoryId | null>(null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-purple-50 to-white px-4 py-12">
      <div className="text-center">
        <h1
          ref={h1Ref}
          tabIndex={-1}
          className="mb-2 text-3xl font-bold text-gray-900 outline-none"
        >
          Choose a category
        </h1>
        <p className="text-gray-600">Pick the buzzwords most likely to come up in your meeting.</p>
      </div>

      <div
        role="group"
        aria-label="Bingo categories"
        className="grid gap-4 sm:grid-cols-3"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id
          return (
            <button
              key={cat.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${cat.name} category${isSelected ? ', selected' : ''}`}
              onClick={() => setSelected(cat.id)}
              className={[
                'flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all',
                'min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-300'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm',
              ].join(' ')}
            >
              <span className="text-4xl" aria-hidden="true">
                {cat.icon}
              </span>
              <div>
                <div className="font-semibold text-gray-900">
                  {cat.name}
                  {isSelected && (
                    <span className="ml-2 text-purple-600" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  e.g. {cat.sampleWords.slice(0, 3).join(', ')}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        disabled={selected === null}
        onClick={() => selected && onSelect(selected)}
        className="px-10"
      >
        Start game
      </Button>
    </main>
  )
}
