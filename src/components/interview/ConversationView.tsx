'use client'

import { useInterviewStore } from '@/store/interview-store'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Extracts the "question" string from a partial or complete JSON stream.
 * The AI streams raw JSON like: {"question":"Tell me about...","category":"..."}
 * We want to show only the question value as it builds up, for ChatGPT-style typing.
 */
function extractStreamingQuestion(raw: string): string {
  if (!raw) return ''

  // Try to match the question value from a partial or complete JSON
  // Matches: "question":"<captured>   (including incomplete strings mid-stream)
  const match = raw.match(/"question"\s*:\s*"((?:[^"\\]|\\.)*)/)
  if (match) {
    // Unescape basic JSON escape sequences
    return match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }

  // While the key hasn't appeared yet, show nothing (let the cursor pulse)
  return ''
}

export function ConversationView() {
  const { turns, streamingText, phase } = useInterviewStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns, streamingText])

  const displayQuestion = extractStreamingQuestion(streamingText)

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth"
    >
      {turns.map((turn, idx) => (
        <div
          key={idx}
          className={cn(
            'max-w-[80%] rounded-2xl px-5 py-4 whitespace-pre-wrap text-base',
            turn.role === 'user'
              ? 'bg-primary text-primary-foreground self-end rounded-br-none'
              : 'bg-muted text-foreground self-start rounded-bl-none shadow-sm'
          )}
        >
          {turn.content}
        </div>
      ))}

      {phase === 'ai_typing' && (
        <div className="bg-muted text-foreground self-start rounded-2xl rounded-bl-none px-5 py-4 max-w-[80%] whitespace-pre-wrap shadow-sm">
          {displayQuestion || <span className="text-muted-foreground text-sm italic">Thinking...</span>}
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
        </div>
      )}

      {phase === 'processing' && (
        <div className="self-end text-sm text-muted-foreground animate-pulse italic mt-2">
          Submitting...
        </div>
      )}
    </div>
  )
}
