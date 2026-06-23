import { useEffect, useRef, useState, useCallback } from 'react'
import type { SpeechRecognitionStatus } from '../types'

declare global {
  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
}

const BACKOFF_BASE_MS = 500
const MAX_RETRIES = 5

interface SpeechState {
  status: SpeechRecognitionStatus
  transcript: string
  errorMessage: string | null
}

export function useSpeechRecognition(onFinalResult: (transcript: string) => void) {
  const mountedRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onFinalResultRef = useRef(onFinalResult)
  onFinalResultRef.current = onFinalResult

  const [state, setState] = useState<SpeechState>(() => ({
    status:
      typeof window !== 'undefined' &&
      (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        ? 'idle'
        : 'unsupported',
    transcript: '',
    errorMessage: null,
  }))

  const statusRef = useRef<SpeechRecognitionStatus>(state.status)

  const setStatus = useCallback(
    (status: SpeechRecognitionStatus, extra: Partial<SpeechState> = {}) => {
      statusRef.current = status
      setState((prev) => ({ ...prev, status, ...extra }))
    },
    [],
  )

  const stopInternal = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    retryCountRef.current = 0
    try {
      recognitionRef.current?.abort()
    } catch {
      /* ignore */
    }
  }, [])

  const startRecognition = useCallback(() => {
    try {
      recognitionRef.current?.start()
    } catch {
      /* already started or not initialised */
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      if (!mountedRef.current) return
      setStatus('listening')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!mountedRef.current) return
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          onFinalResultRef.current(result[0].transcript)
        } else {
          interim += result[0].transcript
        }
      }
      if (interim) {
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript
            ? prev.transcript + ' ' + interim
            : interim,
        }))
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (!mountedRef.current) return
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setStatus('error', { errorMessage: 'Microphone access denied. Check browser settings.' })
      }
      // other errors handled by onend auto-restart
    }

    recognition.onend = () => {
      if (!mountedRef.current) return
      const currentStatus = statusRef.current
      if (currentStatus !== 'listening' && currentStatus !== 'warming-up') return

      if (retryCountRef.current >= MAX_RETRIES) {
        setStatus('error', {
          errorMessage: 'Speech recognition stopped. Please tap retry.',
        })
        return
      }

      const delay = BACKOFF_BASE_MS * Math.pow(2, retryCountRef.current)
      retryCountRef.current++
      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) startRecognition()
      }, delay)
    }

    const handleVisibilityChange = () => {
      if (!mountedRef.current) return
      if (!document.hidden && statusRef.current === 'listening') {
        startRecognition()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mountedRef.current = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
    }
  }, [setStatus, startRecognition])

  const startListening = useCallback(() => {
    retryCountRef.current = 0
    setStatus('warming-up', { errorMessage: null })
    startRecognition()
  }, [setStatus, startRecognition])

  const stopListening = useCallback(() => {
    setStatus('idle', { errorMessage: null })
    stopInternal()
  }, [setStatus, stopInternal])

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '' }))
    retryCountRef.current = 0
  }, [])

  return {
    status: state.status,
    isListening: state.status === 'listening',
    transcript: state.transcript,
    errorMessage: state.errorMessage,
    startListening,
    stopListening,
    resetTranscript,
  }
}
