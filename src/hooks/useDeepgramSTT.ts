'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export function useDeepgramSTT() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const deepgramClientRef = useRef<LiveClient | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
      } catch { /* ignore */ }
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (deepgramClientRef.current) {
      try {
        deepgramClientRef.current.finish()
      } catch { /* ignore */ }
      deepgramClientRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const startListening = useCallback(async () => {
    setError(null)
    cleanup()

    try {
      const response = await fetch('/api/deepgram')
      if (!response.ok) throw new Error('Failed to get Deepgram token')
      const { key } = await response.json()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const deepgram = createClient(key)
      const live = deepgram.listen.live({
        model: 'nova-2',
        smart_format: true,
        interim_results: true,
        endpointing: 300,
      })

      live.addListener(LiveTranscriptionEvents.Open, () => {
        setIsListening(true)

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && live.getReadyState() === 1) {
            live.send(event.data)
          }
        })

        mediaRecorder.start(250)
      })

      live.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        const result = data.channel.alternatives[0]
        if (result?.transcript && data.is_final) {
          setTranscript((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : ''
            return prev + separator + result.transcript
          })
        }
      })

      live.addListener(LiveTranscriptionEvents.Error, (err) => {
        console.error('[useDeepgramSTT] Error:', err)
        setError('Transcription connection error. Please try again.')
        setIsListening(false)
      })

      live.addListener(LiveTranscriptionEvents.Close, () => {
        setIsListening(false)
      })

      deepgramClientRef.current = live
    } catch (err) {
      console.error('[useDeepgramSTT] Failed to start:', err)
      setError(err instanceof Error ? err.message : 'Failed to start microphone')
      setIsListening(false)
      cleanup()
    }
  }, [cleanup])

  const stopListening = useCallback(() => {
    cleanup()
    setIsListening(false)
  }, [cleanup])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  const manuallySetTranscript = useCallback((text: string) => {
    setTranscript(text)
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    manuallySetTranscript,
  }
}
