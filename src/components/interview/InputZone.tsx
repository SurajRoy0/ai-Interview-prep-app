'use client'

import { useInterviewStore } from '@/store/interview-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, MicOff, SendHorizontal } from 'lucide-react'
import { useDeepgramSTT } from '@/hooks/useDeepgramSTT'
import { useEffect, useState } from 'react'

export function InputZone({ onSubmitTurn }: { onSubmitTurn: (answer: string, mode: string) => void }) {
  const { phase, setPhase, setLiveTranscript, textInputContent, setTextInputContent } = useInterviewStore()
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const { start, stop, isRecording } = useDeepgramSTT({
    enabled: voiceEnabled && (phase === 'waiting_input' || phase === 'recording'),
    onTranscript: (text) => setLiveTranscript(text),
    onTurnEnd: (finalText) => {
      setPhase('processing')
      onSubmitTurn(finalText, 'VOICE')
    },
    onTurnStart: () => {
      setPhase('recording')
    }
  })

  useEffect(() => {
    if ((phase === 'waiting_input' || phase === 'recording') && voiceEnabled) {
      if (phase === 'waiting_input') {
        start()
      }
    } else {
      stop()
    }
  }, [phase, voiceEnabled, start, stop])

  const handleTextSubmit = () => {
    if (!textInputContent.trim()) return
    setPhase('processing')
    const content = textInputContent
    setTextInputContent('')
    onSubmitTurn(content, 'TEXT')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (!voiceEnabled && phase === 'waiting_input') {
      start()
    } else {
      stop()
      if (phase === 'recording') {
        setPhase('waiting_input')
      }
    }
  }

  const isInputDisabled = phase !== 'waiting_input' && phase !== 'recording'

  return (
    <div className="w-full bg-background border-t p-4 flex flex-col gap-3 relative z-30">
      <div className="flex justify-between items-center px-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {phase === 'ai_typing' ? 'AI is typing...' : phase === 'processing' ? 'Processing...' : 'Your Turn'}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleVoice}
          className={voiceEnabled ? 'text-primary' : 'text-muted-foreground'}
          title={voiceEnabled ? "Voice input active" : "Voice input disabled"}
        >
          {voiceEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
          {voiceEnabled ? 'Listening' : 'Muted'}
        </Button>
      </div>
      
      <div className="flex gap-3 relative">
        <Textarea 
          placeholder={voiceEnabled ? "Speak, or type your answer here..." : "Type your answer here..."}
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

      {isRecording && (
        <div className="absolute top-0 left-0 w-full h-1">
          <div className="h-full bg-red-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}
