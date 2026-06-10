'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import { readStreamableValue } from '@ai-sdk/rsc'
import { toast } from 'sonner'
import { SessionTimer } from './session-timer'
import { initializeSessionAction, streamAiTurnAction } from '@/actions/candidate/session'
import { cn } from '@/lib/utils'
import type { InterviewTopic, TopicTurn } from '@repo/db'

interface SessionEngineProps {
  interviewId: string
}

type InterviewState = {
  totalTopics: number
  topics: (InterviewTopic & { turns: TopicTurn[] })[]
}

export function SessionEngine({ interviewId }: SessionEngineProps) {
  const router = useRouter()
  
  const [loading, setLoading] = React.useState(true)
  const [interview, setInterview] = React.useState<InterviewState | null>(null)
  
  const [inputText, setInputText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [isStreaming, setIsStreaming] = React.useState(false)
  
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [interview, streamingText])

  const initialize = React.useCallback(async () => {
    try {
      const res = await initializeSessionAction(interviewId)
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to initialize session')
        router.push('/candidate/dashboard')
        return
      }

      const fetchedInterview = res.data.interview as InterviewState
      setInterview(fetchedInterview)
      
      // Auto-start stream if the active topic has no turns (it's brand new)
      const activeTopic = fetchedInterview.topics.find((t: InterviewTopic) => t.status === 'ACTIVE')



      if (activeTopic && activeTopic.turns.length === 0) {
        await triggerAiTurn()
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred loading the session.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, router])


  React.useEffect(() => {
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerAiTurn = async (userText?: string) => {
    setIsStreaming(true)
    setStreamingText('')
    setIsSubmitting(true)
    
    try {
      // Optimistically update UI with user turn if they typed something (or timer submitted empty string)
      if (userText !== undefined && interview) {
        const activeTopicIndex = interview.topics.findIndex((t: InterviewTopic) => t.status === 'ACTIVE')
        if (activeTopicIndex !== -1) {
          const newInterview = { ...interview }
          const isFollowUp = newInterview.topics[activeTopicIndex].turns.length > 1
          newInterview.topics[activeTopicIndex].turns.push({
            role: 'USER',
            turnType: isFollowUp ? 'FOLLOWUP_ANSWER' : 'ANSWER',
            content: userText,
            turnIndex: newInterview.topics[activeTopicIndex].turns.length
          } as TopicTurn)
          setInterview(newInterview)
        }
      }

      const { stream } = await streamAiTurnAction(interviewId, userText)
      
      for await (const chunk of readStreamableValue(stream)) {
        if (chunk) setStreamingText(chunk)
      }

      // When stream finishes, we need to re-fetch the true state from DB 
      // to get the final AI turn metadata (like if moveToNext was true)
      await initialize()
      
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        toast.error(err.message || 'Error communicating with AI interviewer')
      } else {
        toast.error('Error communicating with AI interviewer')
      }
    } finally {
      setIsSubmitting(false)
      setIsStreaming(false)
      setStreamingText('')
      setInputText('')
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || isSubmitting || isStreaming) return
    triggerAiTurn(inputText)
  }

  const handleTimerExpire = React.useCallback(() => {
    toast('Time is up!', { description: 'Submitting your current answer...' })
    // Use whatever text is currently in state
    triggerAiTurn(inputText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground animate-pulse">Connecting to session...</p>
      </div>
    )
  }

  if (!interview) return null

  const activeTopic = interview.topics.find((t: InterviewTopic) => t.status === 'ACTIVE')

  // If no active topic, maybe interview completed or errored
  if (!activeTopic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-1 rounded-2xl border">
        <h2 className="text-xl font-bold mb-2">Session Ended</h2>
        <p className="text-muted-foreground mb-6">There are no active questions. The interview has concluded.</p>
        <Button onClick={() => router.push(`/candidate/interview/${interviewId}`)}>View Report</Button>
      </div>
    )
  }

// Calculate elapsed seconds for timer
    const elapsedSeconds = activeTopic?.startedAt  ? Math.floor( (Date.now() - new Date(activeTopic.startedAt).getTime()) / 1000 ) : 0



  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto bg-surface-1 border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-surface-2/50 backdrop-blur-sm z-10">
        <div>
          <h2 className="font-semibold text-lg">Question {activeTopic.topicIndex + 1} of {interview.totalTopics}</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{activeTopic.plannedCategory}</p>
        </div>
        <SessionTimer 
          timeLimitSeconds={activeTopic.timeLimitSeconds || 120} 
          elapsedSeconds={elapsedSeconds || 0} 
          isActive={!isStreaming && !isSubmitting} 
          onExpire={handleTimerExpire} 
        />
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
        {activeTopic.turns.map((turn: TopicTurn, i: number) => (
          <div key={i} className={cn("flex flex-col max-w-[85%]", turn.role === 'USER' ? "ml-auto items-end" : "mr-auto items-start")}>
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1 tracking-wider">
              {turn.role === 'AI' ? 'Interviewer' : 'You'}
            </span>
            <div className={cn(
              "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed", 
              turn.role === 'USER' ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-surface-2 border border-border/50 rounded-bl-sm text-foreground shadow-sm"
            )}>
              {turn.content}
            </div>
          </div>
        ))}
        
        {/* Streaming Text Placeholder */}
        {isStreaming && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1 tracking-wider">
              Interviewer
            </span>
            <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed bg-surface-2 border border-border/50 rounded-bl-sm text-foreground shadow-sm min-w-[60px] min-h-[50px] flex items-center">
              {streamingText || <span className="flex gap-1 items-center h-full"><span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-75" /><span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-150" /></span>}
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-2 border-t mt-auto">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-3xl mx-auto">
          <Textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[60px] max-h-[200px] resize-none pr-14 py-3 rounded-xl bg-background border-border/50 focus-visible:ring-1"
            disabled={isSubmitting || isStreaming}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputText.trim() || isSubmitting || isStreaming}
            className="absolute right-2 bottom-2 h-9 w-9 rounded-lg"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </Button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
          Press <kbd className="font-sans px-1.5 py-0.5 bg-background border rounded text-[10px]">Enter</kbd> to submit, <kbd className="font-sans px-1.5 py-0.5 bg-background border rounded text-[10px]">Shift + Enter</kbd> for new line.
        </p>
      </div>
    </div>
  )
}
