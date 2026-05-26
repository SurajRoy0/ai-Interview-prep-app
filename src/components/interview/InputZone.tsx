'use client'

import { useInterviewStore } from '@/store/interview-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, MicOff, SendHorizontal } from 'lucide-react'
import { useDeepgramSTT } from '@/hooks/useDeepgramSTT'
import { useEffect, useRef, useState } from 'react'

export function InputZone({ onSubmitTurn }: { onSubmitTurn: (answer: string, mode: string) => void }) {
  const { phase, setPhase, setLiveTranscript, textInputContent, setTextInputContent } = useInterviewStore()
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  // Tracks whether the user is holding the Tab key to prevent repeat events
  const tabHeldRef = useRef(false)

  const isInputActive = phase === 'waiting_input' || phase === 'recording'

  const { start, stop, isRecording } = useDeepgramSTT({
    enabled: voiceEnabled && isInputActive,
    onTranscript: (text) => setLiveTranscript(text),
    onTurnEnd: (finalText) => {
      setLiveTranscript('')
      setPhase('processing')
      onSubmitTurn(finalText, 'VOICE')
    },
    onTurnStart: () => {
      setPhase('recording')
    },
  })

  // Tab key: press-and-hold to record, release to submit
  useEffect(() => {
    if (!voiceEnabled) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && !tabHeldRef.current && phase === 'waiting_input') {
        e.preventDefault()
        tabHeldRef.current = true
        start()
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Tab' && tabHeldRef.current) {
        e.preventDefault()
        tabHeldRef.current = false
        stop()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [phase, voiceEnabled, start, stop])

  // Press-and-hold mic button handlers
  function handleMicPointerDown() {
    if (!voiceEnabled || phase !== 'waiting_input') return
    start()
  }

  function handleMicPointerUp() {
    if (!voiceEnabled) return
    if (isRecording) {
      stop()
    }
  }

  function handleTextSubmit() {
    if (!textInputContent.trim()) return
    setPhase('processing')
    const content = textInputContent
    setTextInputContent('')
    onSubmitTurn(content, 'TEXT')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  function toggleVoice() {
    if (voiceEnabled && isRecording) {
      stop()
    }
    setVoiceEnabled((v) => !v)
  }

  const isInputDisabled = !isInputActive

  return (
    <div className="w-full bg-background border-t p-4 flex flex-col gap-3 relative z-30">
      {/* Recording bar */}
      {isRecording && (
        <div className="absolute top-0 left-0 w-full h-1">
          <div className="h-full bg-red-500 animate-pulse" />
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {phase === 'ai_typing'
            ? 'AI is typing...'
            : phase === 'processing'
              ? 'Processing...'
              : isRecording
                ? 'Listening — release to send'
                : 'Your Turn'}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVoice}
          className={voiceEnabled ? 'text-primary' : 'text-muted-foreground'}
          title={voiceEnabled ? 'Voice on — hold mic or Tab to record' : 'Voice disabled'}
        >
          {voiceEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
          {voiceEnabled ? 'Voice On' : 'Voice Off'}
        </Button>
      </div>

      <div className="flex gap-3 relative">
        <Textarea
          placeholder={
            voiceEnabled
              ? 'Hold mic button or Tab to speak, or type here...'
              : 'Type your answer here...'
          }
          className="min-h-[60px] max-h-[200px] resize-y rounded-xl pr-14 bg-muted/50 focus-visible:bg-background transition-colors"
          value={textInputContent}
          onChange={(e) => setTextInputContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 rounded-full w-8 h-8 transition-transform active:scale-95"
          onClick={handleTextSubmit}
          disabled={isInputDisabled || !textInputContent.trim()}
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {voiceEnabled && (
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          className="w-full rounded-xl h-12 text-sm font-medium select-none"
          onPointerDown={handleMicPointerDown}
          onPointerUp={handleMicPointerUp}
          onPointerLeave={handleMicPointerUp}
          disabled={isInputDisabled}
        >
          <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? 'Recording... Release to send' : 'Hold to speak'}
        </Button>
      )}
    </div>
  )
}
