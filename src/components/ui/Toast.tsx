import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import type { Toast } from '../../types'

const iconMap: Record<Toast['type'], string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

const colorMap: Record<Toast['type'], string> = {
  info: 'bg-blue-50 border-blue-300 text-blue-800',
  success: 'bg-green-50 border-green-300 text-green-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  error: 'bg-red-50 border-red-300 text-red-800',
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [paused, setPaused] = useState(false)
  const elapsed = useRef(0)
  const lastTick = useRef(Date.now())

  useEffect(() => {
    const tick = () => {
      if (!paused) {
        const now = Date.now()
        elapsed.current += now - lastTick.current
        lastTick.current = now
        if (elapsed.current >= toast.durationMs) {
          onRemove(toast.id)
          return
        }
      } else {
        lastTick.current = Date.now()
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    const rafRef = { current: 0 }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, toast.durationMs, toast.id, onRemove])

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
        colorMap[toast.type],
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="mt-px text-sm font-bold" aria-hidden="true">
        {iconMap[toast.type]}
      </span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="mt-px rounded text-current opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
      >
        ✕
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 p-4 sm:inset-x-auto sm:right-4 sm:w-80"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}
