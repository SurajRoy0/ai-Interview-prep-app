'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Brain,
  Briefcase,
  Loader2,
  MessageCircle,
  Mic,
  Network,
  Pause,
  Play,
  Send,
  Shield,
  SkipForward,
  Terminal,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { readStreamableValue } from '@ai-sdk/rsc'
import { toast } from 'sonner'
import { SessionTimer } from './session-timer'
import { SessionCodeEditor } from './session-code-editor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { initializeSessionAction, streamAiTurnAction, startNextTopicAction } from '@/actions/candidate/session'
import { cn } from '@/lib/utils'
import type { InterviewTopic, TopicTurn } from '@repo/db'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { Session } from '@/lib/auth'

interface SessionEngineProps {
  interviewId: string
  session: Session
}

function InterviewerAvatar({ className, pulsing }: { className?: string; pulsing?: boolean }) {
  return (
    <div className={cn('relative size-8 shrink-0', className)}>
      {pulsing && (
        <>
          <span
            className="absolute -inset-1 rounded-full bg-primary/30 animate-primary-aura"
            aria-hidden
          />
          <span
            className="absolute -inset-2 rounded-full bg-primary/15 animate-primary-aura"
            aria-hidden
          />
        </>
      )}
      <div
        className={cn(
          'relative flex size-8 items-center justify-center rounded-full border bg-muted',
          pulsing ? 'border-primary/50 bg-primary/10 shadow-primary-glow animate-pulse duration-1000 delay-1000' : 'border-border'
        )}
      >
        <Brain className={cn('size-3.5', pulsing ? 'text-primary' : 'text-muted-foreground')} />
      </div>
    </div>
  )
}

type InterviewState = {
  totalTopics: number
  status: string
  pauseCount?: number
  maxPauseCount?: number
  topics: (InterviewTopic & { turns: TopicTurn[] })[]
}

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  HR: { icon: Users, className: 'text-green-500' },
  RESUME_BASED: { icon: Briefcase, className: 'text-primary' },
  CONCEPTUAL: { icon: Zap, className: 'text-blue-500' },
  SCENARIO: { icon: Shield, className: 'text-amber-500' },
  BEHAVIORAL: { icon: MessageCircle, className: 'text-orange-500' },
  SYSTEM_DESIGN: { icon: Network, className: 'text-purple-500' },
  ACTIVITY: { icon: Terminal, className: 'text-blue-500' },
}

export function SessionEngine({ interviewId, session }: SessionEngineProps) {
  const router = useRouter()

  const [loading, setLoading] = React.useState(true)
  const [interview, setInterview] = React.useState<InterviewState | null>(null)

  const [inputText, setInputText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)

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


  const handlePause = () => {
    setIsPaused((prev) => !prev)
  }

  const handleEndInterview = () => {
    // TODO: Implement end interview logic
  }

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
  const displayTopic = activeTopic || [...interview.topics].reverse().find((t: InterviewTopic) => t.status === 'CLOSED')

  console.log('interview.topics', interview)

  // If no display topic, maybe interview completed or errored
  if (!displayTopic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-1 rounded-2xl border">
        <h2 className="text-xl font-bold mb-2">Session Ended</h2>
        <p className="text-muted-foreground mb-6">There are no questions. The interview has concluded.</p>
        <Button onClick={() => router.push(`/candidate/interview/${interviewId}`)}>View Report</Button>
      </div>
    )
  }

  // Calculate elapsed seconds for timer
  const elapsedSeconds = displayTopic?.startedAt ? Math.floor((Date.now() - new Date(displayTopic.startedAt).getTime()) / 1000) : 0

  const categoryKey = displayTopic.plannedCategory ?? ''
  const CategoryIcon = CATEGORY_ICONS[categoryKey]?.icon ?? Briefcase
  const categoryIconClass = CATEGORY_ICONS[categoryKey]?.className ?? 'text-primary'

  const maxPauseCount = interview.maxPauseCount ?? 2
  const pauseCount = interview.pauseCount ?? 0
  const pausesRemaining = Math.max(0, maxPauseCount - pauseCount)
  const sessionBusy = isSubmitting || isStreaming

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b broder-border/50 bg-background backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-1 border border-border/50">
            <CategoryIcon className={cn('h-5 w-5', categoryIconClass)} />
          </div>
          <div className="">
            <h2 className="font-semibold text-md">TOPIC {displayTopic.topicIndex + 1} OF {interview.totalTopics}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-light">{displayTopic.plannedCategory}</p>
          </div>
        </div>
        <SessionTimer
          timeLimitSeconds={displayTopic.timeLimitSeconds || 120}
          elapsedSeconds={elapsedSeconds || 0}
          isActive={!sessionBusy && !isPaused}
          onExpire={handleTimerExpire}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handlePause}
            disabled={sessionBusy || (!isPaused && pausesRemaining <= 0)}
          >
            {isPaused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleEndInterview}
            disabled={sessionBusy}
          >
            <SkipForward data-icon="inline-start" />
            End Interview
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col min-h-0 bg-surface-1">
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize="55%" minSize="30%" className="h-full">
            <div className="flex h-full min-h-0 flex-col max-w-4xl mx-auto">
              {/* Transcript Area */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-6 p-7">
                {displayTopic.turns.map((turn: TopicTurn, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      'flex flex-col gap-2 max-w-[85%]',
                      turn.role === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
                    )}
                  >
                    {turn.role === 'AI' ? (
                      <InterviewerAvatar />
                    ) : (
                      <UserAvatar
                        size="default"
                        compact
                        name={session.user.name}
                        email={session.user.email}
                        image={session.user.image}
                      />
                    )}
                    <div className={cn(
                      'rounded-2xl text-[15px] leading-relaxed',
                      turn.role === 'USER' ? 'text-primary' : 'text-foreground'
                    )}>
                      {turn.content}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex flex-col gap-2 max-w-[85%] mr-auto items-start">
                    <InterviewerAvatar pulsing={!streamingText} />
                    {streamingText ? (
                      <div className="rounded-2xl text-[15px] leading-relaxed text-foreground">
                        {streamingText}
                      </div>
                    ) : null}
                  </div>
                )}
                <div ref={chatEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="shrink-0 p-4">
                {!activeTopic ? (
                  interview.status === 'COMPLETED' ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-surface-1 rounded-2xl border border-border/50">
                      <h3 className="font-semibold mb-2">Interview Completed</h3>
                      <p className="text-sm text-muted-foreground mb-4">You have successfully completed all topics.</p>
                      <Button onClick={() => router.push(`/candidate/interview/${interviewId}`)}>View Report</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-surface-1 rounded-2xl border border-border/50">
                      <h3 className="font-semibold mb-2">Topic Completed</h3>
                      <p className="text-sm text-muted-foreground mb-4">Take a breath. Click below when you are ready to continue.</p>
                      <Button 
                        disabled={isSubmitting} 
                        onClick={async () => {
                          setIsSubmitting(true)
                          try {
                            const res = await startNextTopicAction(interviewId)
                            if (res.success) {
                              setInterview(res.data.interview as InterviewState)
                              await initialize()
                            } else {
                              toast.error(res.error?.message || "Failed to start next topic")
                            }
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Start Next Topic
                      </Button>
                    </div>
                  )
                ) : (
                <form
                  onSubmit={handleSubmit}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-surface-1 shadow-sm transition-all',
                    'focus-within:border-primary/35 focus-within:shadow-primary-glow focus-within:ring-1 focus-within:ring-primary/15',
                    (isSubmitting || isStreaming) && 'opacity-80'
                  )}
                >
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isStreaming ? 'Waiting for interviewer...' : 'Type your answer here...'}
                    className="min-h-[70px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 text-[15px] leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0 disabled:opacity-60"
                    disabled={isSubmitting || isStreaming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-border/40 px-2 py-2">
                    <p className="text-[11px] text-muted-foreground">
                      <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-sans text-[10px]">Enter</kbd>
                      {' '}to send ·{' '}
                      <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-sans text-[10px]">Shift + Enter</kbd>
                      {' '}new line
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        className="h-9 w-fit px-2 shrink-0 gap-1 rounded-lg shadow-primary-glow disabled:shadow-none"
                      >
                        <Mic className="size-4" />
                        <span>Press to speak</span>
                      </Button>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!inputText.trim() || isSubmitting || isStreaming}
                        className="h-9 w-fit px-2 shrink-0 gap-1 rounded-lg rounded-tr-none shadow-primary-glow disabled:shadow-none"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>Send</span>
                      </Button>
                    </div>
                  </div>
                </form>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize="45%" minSize="25%" className="h-full">
            <SessionCodeEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
