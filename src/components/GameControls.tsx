import { useState } from 'react'
import { Button } from './ui/Button'
import type { SpeechRecognitionStatus } from '../types'

interface GameControlsProps {
  status: SpeechRecognitionStatus
  onToggleMic: () => void
  onNewCard: () => void
}

const MIC_BUTTON_LABELS: Record<SpeechRecognitionStatus, string> = {
  idle: 'Enable mic',
  'warming-up': 'Connecting…',
  listening: 'Stop mic',
  error: 'Retry mic',
  unsupported: 'Mic unavailable',
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      />
    </svg>
  )
}

export default function GameControls({ status, onToggleMic, onNewCard }: GameControlsProps) {
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [micRequested, setMicRequested] = useState(false)

  const isListening = status === 'listening'
  const isWarmingUp = status === 'warming-up'
  const isUnsupported = status === 'unsupported'

  const handleMicClick = () => {
    if (isListening) {
      onToggleMic()
      return
    }
    if (!micRequested) {
      setShowPermissionModal(true)
      return
    }
    onToggleMic()
  }

  const handlePermissionAllow = () => {
    setMicRequested(true)
    setShowPermissionModal(false)
    onToggleMic()
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant={isListening ? 'danger' : 'primary'}
          aria-pressed={isListening}
          disabled={isUnsupported || isWarmingUp}
          isLoading={isWarmingUp}
          onClick={handleMicClick}
          className="flex-1 gap-2 sm:flex-none"
        >
          <MicIcon active={isListening} />
          {MIC_BUTTON_LABELS[status]}
        </Button>

        <Button variant="secondary" onClick={onNewCard} aria-label="Generate a new bingo card">
          New card
        </Button>
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          Mic error — tap retry or check browser permissions.
        </p>
      )}

      {isUnsupported && (
        <p className="mt-1 text-sm text-amber-700">
          Speech recognition isn&apos;t supported in this browser. Tap squares manually.
        </p>
      )}

      {showPermissionModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mic-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="mic-modal-title" className="mb-2 text-lg font-semibold text-gray-900">
              Enable microphone?
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Meeting Bingo uses your browser&apos;s speech engine to detect words. Audio is
              processed by your browser&apos;s built-in speech service and is not stored by this
              app.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={handlePermissionAllow}
                autoFocus
              >
                Enable mic
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowPermissionModal(false)}
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
