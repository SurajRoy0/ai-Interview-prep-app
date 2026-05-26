'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { getDeepgramTokenAction } from '@/actions/interview'

export function useDeepgramSTT({
  enabled,
  onTranscript,
  onTurnEnd,
  onTurnStart,
}: {
  enabled: boolean
  onTranscript: (text: string) => void
  onTurnEnd: (finalText: string) => void
  onTurnStart: () => void
}) {
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const transcriptRef = useRef<string>('')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const onTranscriptRef = useRef(onTranscript)
  const onTurnEndRef = useRef(onTurnEnd)
  const onTurnStartRef = useRef(onTurnStart)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onTurnEndRef.current = onTurnEnd
    onTurnStartRef.current = onTurnStart
  }, [onTranscript, onTurnEnd, onTurnStart])

  const start = useCallback(async () => {
    if (!enabled) return

    const result = await getDeepgramTokenAction()
    if (!result.success || !result.data?.token) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream

      const params = new URLSearchParams({
        eot_threshold: '0.7',
        eot_timeout_ms: '5000',
        model: 'nova-2',
        encoding: 'linear16',
        sample_rate: '16000',
        interim_results: 'true',
      })

      const ws = new WebSocket(
        `wss://api.deepgram.com/v2/listen?${params}`,
        ['token', result.data.token]
      )
      wsRef.current = ws

      ws.onopen = () => {
        setIsListening(true)
        const recorder = new MediaRecorder(stream)
        recorder.ondataavailable = (e) => {
          if (ws.readyState === WebSocket.OPEN && e.data.size > 0) {
            ws.send(e.data)
          }
        }
        recorder.start(100)
        mediaRecorderRef.current = recorder
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.event === 'StartOfTurn') {
            transcriptRef.current = ''
            setIsRecording(true)
            onTurnStartRef.current()
          }

          let transcript = data.transcript
          if (!transcript && data.channel?.alternatives?.[0]?.transcript) {
            transcript = data.channel.alternatives[0].transcript
          }

          if (transcript) {
            transcriptRef.current = transcript
            onTranscriptRef.current(transcript)
          }

          if (data.event === 'EndOfTurn') {
            setIsRecording(false)
            const final = transcriptRef.current.trim()
            transcriptRef.current = ''
            if (final) onTurnEndRef.current(final)
          }
        } catch (err) {
          console.error('[Deepgram] parse error:', err)
        }
      }

      ws.onclose = () => { setIsListening(false); setIsRecording(false) }
      ws.onerror = () => { setIsListening(false); setIsRecording(false) }

    } catch (err) {
      console.error('[Deepgram] Failed to start:', err)
    }

  }, [enabled])

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop()
    wsRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setIsListening(false)
    setIsRecording(false)
  }, [])

  return { start, stop, isListening, isRecording }
}
