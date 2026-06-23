import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  createElement,
} from 'react'
import type { Toast } from '../types'

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type'], durationMs?: number) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

let idCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info', durationMs = 3000) => {
      const id = `toast-${++idCounter}`
      setToasts((prev) => {
        const next = [...prev, { id, message, type, durationMs }]
        return next.length > 3 ? next.slice(next.length - 3) : next
      })
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children,
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
