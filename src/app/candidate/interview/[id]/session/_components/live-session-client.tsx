'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useInterviewSessionStore } from '@/store/interview-session.store'
import { saveTurn, closeTopicAndStartNext, syncTimer, pauseInterview, endInterviewEarly } from '@/actions/candidate/session'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Send, AlertTriangle, Pause, Play, CheckCircle2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LiveSessionClientProps {
  interviewId: string
  initialQuestionId: string
  questionIndex: number
  totalQuestions: number
  timeAllocated: number
  initialMessages?: UIMessage[]
  maxPauseCount: number
  currentPauseCount: number
}

// Helper to extract text from AI SDK v5 UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

export function LiveSessionClient({
  interviewId,
  initialQuestionId,
  questionIndex,
  totalQuestions,
  timeAllocated,
  initialMessages = [],
  maxPauseCount,
  currentPauseCount,
}: LiveSessionClientProps) {
  // Initialize Zustand store and Router
  const store = useInterviewSessionStore()
  const router = useRouter()

  // Track if we've initialized so we don't re-run the effect
  const [hasInitialized, setHasInitialized] = useState(false)
  const [input, setInput] = useState('')
  const [localPauseCount, setLocalPauseCount] = useState(currentPauseCount)
  const [isEnding, setIsEnding] = useState(false)

  useEffect(() => {
    if (!hasInitialized) {
      store.initializeSession({
        interviewId,
        currentQuestionId: initialQuestionId,
        questionIndex,
        totalQuestions,
        timeAllocated,
      })
      setHasInitialized(true)
    }
  }, [hasInitialized, interviewId, initialQuestionId, questionIndex, totalQuestions, timeAllocated, store])

  // Timer interval & Heartbeat Sync
  useEffect(() => {
    let syncCounter = 0
    const timer = setInterval(() => {
      store.tickTimer()
      
      // Sync with server every 5 seconds if not paused
      if (!store.isPaused && store.currentQuestionId) {
        syncCounter++
        if (syncCounter % 5 === 0) {
          const elapsed = store.totalTimeAllocated - store.timeRemainingSeconds
          void syncTimer(store.currentQuestionId, elapsed)
        }
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [store])

  // Vercel AI SDK v5 useChat Hook
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    transport: new DefaultChatTransport({
      api: '/api/interview/chat',
      body: {
        interviewId: store.interviewId || interviewId,
        questionId: store.currentQuestionId || initialQuestionId,
      },
    }),
    onFinish: async ({ message }: { message: UIMessage }) => {
      // Save AI's response to the database
      if (store.interviewId && store.currentQuestionId) {
        await saveTurn({
          interviewId: store.interviewId,
          questionId: store.currentQuestionId,
          role: 'AI',
          turnType: 'FOLLOWUP', // Defaulting to FOLLOWUP for stream chunks
          content: getMessageText(message),
        })
      }
    },
  })

  // Trigger initial AI message exactly once per topic
  const initializedTopics = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (hasInitialized && messages.length === 0 && status !== 'streaming' && status !== 'submitted') {
      const currentQid = store.currentQuestionId || initialQuestionId
      if (currentQid && !initializedTopics.current.has(currentQid)) {
        initializedTopics.current.add(currentQid)
        sendMessage()
      }
    }
  }, [hasInitialized, messages.length, status, sendMessage, store.currentQuestionId, initialQuestionId])

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Handle auto-advancing when timer hits 0
  useEffect(() => {
    if (store.timeRemainingSeconds <= 0 && !store.isFinished && store.currentQuestionId) {
      handleAdvanceTopic()
    }
  }, [store.timeRemainingSeconds, store.isFinished, store.currentQuestionId])

  const handleAdvanceTopic = async () => {
    if (!store.interviewId || !store.currentQuestionId) return

    store.setPaused(true) // Pause timer while fetching next

    const result = await closeTopicAndStartNext(store.interviewId, store.currentQuestionId)

    if (!result.success || !result.data) {
      console.error('Failed to advance topic')
      store.setPaused(false)
      return
    }

    if (result.data.isComplete) {
      store.finishInterview()
      router.push(`/candidate/interview/${store.interviewId}`)
    } else if (result.data.nextQuestionId) {
      // We need to fetch the next question's time limit here, but for now we'll assume 120s
      // A robust implementation would return the next question's timeLimitSeconds from the Server Action.
      store.advanceToNextQuestion(result.data.nextQuestionId, 120)
      setMessages([]) // Clear chat for new topic
      store.setPaused(false)
    }
  }

  const submitMessage = async () => {
    if (!input.trim() || !store.interviewId || !store.currentQuestionId) return

    const userContent = input
    setInput('') // Clear input

    // Save User's turn to database
    await saveTurn({
      interviewId: store.interviewId,
      questionId: store.currentQuestionId,
      role: 'USER',
      turnType: 'ANSWER',
      content: userContent,
    })

    // This triggers the AI stream
    sendMessage({ role: 'user', parts: [{ type: 'text', text: userContent }] })
  }

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await submitMessage()
  }

  const handlePauseToggle = async () => {
    if (store.isPaused) {
      // Resume
      store.setPaused(false)
    } else {
      // Pause
      if (localPauseCount >= maxPauseCount) return
      
      store.setPaused(true)
      const res = await pauseInterview(store.interviewId!)
      if (res.success) {
        setLocalPauseCount(prev => prev + 1)
      } else {
        // Revert pause if failed
        store.setPaused(false)
      }
    }
  }

  const handleEndInterview = async () => {
    if (!confirm('Are you sure you want to end the interview early?')) return
    if (!store.interviewId || !store.currentQuestionId) return

    setIsEnding(true)
    store.setPaused(true)
    
    const res = await endInterviewEarly(store.interviewId, store.currentQuestionId)
    if (res.success) {
      store.finishInterview()
      router.push(`/candidate/interview/${store.interviewId}`)
    } else {
      setIsEnding(false)
      store.setPaused(false)
    }
  }

  if (store.isFinished || isEnding) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Interview Complete!</h2>
          <p className="text-muted-foreground">Generating your final report...</p>
        </div>
      </div>
    )
  }

  const isLowTime = store.timeRemainingSeconds <= 30
  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-1">
      {/* Top Navigation / Status Bar */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-lg">Live Session</div>
          <div className="text-sm text-muted-foreground bg-surface-2 px-3 py-1 rounded-full border border-border/50 flex items-center gap-2">
            <span>Topic {store.questionIndex + 1} of {store.totalQuestions}</span>
          </div>
          {localPauseCount > 0 && (
            <div className="text-xs text-muted-foreground bg-surface-2 px-2 py-1 rounded-full border border-border/50">
              Pauses Used: {localPauseCount}/{maxPauseCount}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePauseToggle}
            disabled={!store.isPaused && localPauseCount >= maxPauseCount}
            className={store.isPaused ? 'text-primary bg-primary/10' : ''}
          >
            {store.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {store.isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndInterview}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border/50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            End Interview
          </Button>

          <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${isLowTime ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-surface-2 border-border/50'} ${store.isPaused ? 'opacity-50' : ''}`}>
            <span className="font-mono text-xl font-medium tracking-tight">
              {formatTime(store.timeRemainingSeconds)}
            </span>
            {isLowTime && <AlertTriangle className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <p>Waiting for the interviewer to begin...</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-xs text-muted-foreground mb-1 ml-1">
                {m.role === 'user' ? 'You' : 'Interviewer'}
              </span>
              <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-surface-2 border border-border/50 rounded-tl-sm'
                  }`}
              >
                {getMessageText(m)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground mb-1 ml-1">Interviewer</span>
              <div className="px-4 py-3 rounded-2xl bg-surface-2 border border-border/50 rounded-tl-sm animate-pulse">
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border/50 bg-background p-4">
        <form onSubmit={onSubmitForm} className="max-w-3xl mx-auto relative flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[60px] max-h-[200px] resize-none pb-4 pt-3 px-4 rounded-xl border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50 bg-surface-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim()) void submitMessage()
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={store.isPaused}
              className="h-[60px] w-[60px] rounded-xl border-border/50 hover:bg-surface-2"
              onClick={() => console.log('Push to Talk Triggered (Deepgram coming soon)')}
              title="Push to Talk"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || store.isPaused}
              className="h-[60px] w-[60px] rounded-xl shadow-sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
