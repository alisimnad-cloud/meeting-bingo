import { useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setStored((prev) => {
        const next =
          typeof value === 'function'
            ? (value as (prev: T) => T)(prev)
            : value
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(next))
          } catch (e) {
            if (
              e instanceof DOMException &&
              (e.name === 'QuotaExceededError' ||
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            ) {
              console.warn('Storage full — progress won\'t be saved')
            }
          }
        }
        return next
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    }
    setStored(defaultValue)
  }, [key, defaultValue])

  return [stored, setValue, removeValue]
}
