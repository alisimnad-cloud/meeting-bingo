import { useState } from 'react'
import { cn } from '../lib/utils'
import type { SpeechRecognitionStatus } from '../types'

interface TranscriptPanelProps {
  status: SpeechRecognitionStatus
  transcript: string
  detectedWords: string[]
}

export default function TranscriptPanel({ status, transcript, detectedWords }: TranscriptPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const isListening = status === 'listening'

  return (
    <section aria-label="Speech transcript" className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="transcript-body"
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
        )}
      >
        <span className="flex items-center gap-2 font-medium text-gray-900">
          {isListening ? (
            <>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Listening…
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-gray-300" aria-hidden="true" />
              Transcript
            </>
          )}
        </span>
        <span aria-hidden="true" className="text-gray-400">
          {collapsed ? '▲' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div id="transcript-body" className="px-4 pb-4">
          {detectedWords.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1" aria-label="Detected words">
              {detectedWords.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
          <div
            aria-live="polite"
            aria-label="Live transcript"
            className="min-h-[48px] rounded-lg bg-gray-50 p-3 text-sm text-gray-600"
          >
            {transcript || (
              <span className="text-gray-400 italic">
                {isListening ? 'Waiting for speech…' : 'Enable the mic to start detecting words.'}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
