'use client'

import { useInterviewStore } from '@/store/interview-store'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function ConversationView() {
  const { turns, streamingText, phase } = useInterviewStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns, streamingText])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth"
    >
      {turns.map((turn, idx) => (
        <div 
          key={idx} 
          className={cn(
            "max-w-[80%] rounded-2xl px-5 py-4 whitespace-pre-wrap text-base",
            turn.role === 'user' 
              ? "bg-primary text-primary-foreground self-end rounded-br-none" 
              : "bg-muted text-foreground self-start rounded-bl-none shadow-sm"
          )}
        >
          {turn.content}
        </div>
      ))}

      {phase === 'ai_typing' && (
        <div className="bg-muted text-foreground self-start rounded-2xl rounded-bl-none px-5 py-4 max-w-[80%] whitespace-pre-wrap shadow-sm">
          {streamingText}
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
        </div>
      )}

      {/* Show an indicator when user is processing/recording but no streaming text is flowing yet */}
      {phase === 'processing' && (
        <div className="self-end text-sm text-muted-foreground animate-pulse italic mt-2">
          Submitting...
        </div>
      )}
    </div>
  )
}
