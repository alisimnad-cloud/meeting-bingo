import type { RefObject } from 'react'
import { Button } from './ui/Button'

interface LandingPageProps {
  h1Ref: RefObject<HTMLHeadingElement>
  onStart: () => void
}

export default function LandingPage({ h1Ref, onStart }: LandingPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-purple-50 to-white px-4 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-6xl" aria-hidden="true">
          🎯
        </div>
        <h1
          ref={h1Ref}
          tabIndex={-1}
          className="text-4xl font-bold text-gray-900 outline-none sm:text-5xl"
        >
          Meeting Bingo
        </h1>
        <p className="max-w-md text-lg text-gray-600">
          Turn your next meeting into a game. Your browser listens for buzzwords and fills your card
          automatically — no phone-watching needed.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button size="lg" onClick={onStart} className="px-10">
          Play now
        </Button>

        <ul className="flex flex-col gap-2 text-sm text-gray-500" aria-label="How it works">
          <li className="flex items-center gap-2">
            <span aria-hidden="true">🎤</span> Pick a category, get a random card
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">👂</span> Enable the mic — audio processed by your
            browser&apos;s speech engine
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">🏆</span> Fill a row, column, or diagonal to win
          </li>
        </ul>
      </div>

      <p className="max-w-xs text-center text-xs text-gray-400">
        No data leaves your device. Works offline after first load.
      </p>
    </main>
  )
}
