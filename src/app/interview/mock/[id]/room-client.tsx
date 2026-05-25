'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useDeepgramSTT } from '@/hooks/useDeepgramSTT'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, MicOff, Send, Loader2, LogOut, Code2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { ActivityPanel } from '@/components/interview/ActivityPanel'
import { endInterviewAction } from '@/actions/interview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function InterviewRoomClient({
  interviewId,
  interviewType,
  initialMessages,
}: {
  interviewId: string
  interviewType: string
  initialMessages: UIMessage[]
}) {
  const {
    isListening,
    transcript,
    error: sttError,
    startListening,
    stopListening,
    manuallySetTranscript,
    resetTranscript,
  } = useDeepgramSTT()

  const [input, setInput] = useState('')
  const router = useRouter()
  const [isEnding, setIsEnding] = useState(false)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(interviewType === 'TECHNICAL' || interviewType === 'FULL')

  const [code, setCode] = useState('// Write your solution here...\n')
  const [language, setLanguage] = useState('javascript')
  const [isCompiling, setIsCompiling] = useState(false)
  const [output, setOutput] = useState<string | undefined>()

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleRunCode = useCallback(async () => {
    setIsCompiling(true)
    setOutput(undefined)
    try {
      const res = await fetch('/api/interview/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      if (!res.ok) throw new Error('Failed to run code')
      const data = await res.json()
      setOutput(data.output)
    } catch (err) {
      setOutput('Error executing code: ' + (err as Error).message)
    } finally {
      setIsCompiling(false)
    }
  }, [code, language])

  const handleEndInterview = useCallback(async () => {
    setIsEnding(true)
    // Stop microphone if active
    if (isListening) stopListening()

    try {
      const res = await endInterviewAction(interviewId)
      if (res.success) {
        toast.success('Interview completed! Generating your report...')
        router.push(`/dashboard`)
      } else {
        toast.error(res.error.message || 'Failed to end interview')
        setIsEnding(false)
      }
    } catch {
      toast.error('Failed to end interview')
      setIsEnding(false)
    }
  }, [interviewId, isListening, router, stopListening])

  const { messages, sendMessage, status, error: chatError } = useChat({
    id: interviewId,
    transport: new DefaultChatTransport({
      api: '/api/interview/chat',
      body: { interviewId, code, language },
    }),
    messages: initialMessages,
    onError: (error) => {
      toast.error('AI failed to respond: ' + error.message)
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Sync voice transcript into the input field in real-time
  useEffect(() => {
    setInput(transcript)
  }, [transcript])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleToggleMic = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || isLoading) return

      if (isListening) stopListening()

      sendMessage({ text: trimmed })
      resetTranscript()
      setInput('')
    },
    [input, isLoading, isListening, sendMessage, stopListening, resetTranscript]
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">

      {/* Top Bar */}
      <header className="flex-none px-4 py-3 border-b bg-card flex justify-between items-center z-10 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="font-semibold text-sm truncate">Live Interview Session</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-full hidden sm:block">
            Principal Engineer
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWorkspaceOpen((prev) => !prev)}
            className={`font-semibold shadow-sm gap-1.5 ${isWorkspaceOpen ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isWorkspaceOpen ? 'Hide Editor' : 'Show Editor'}</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isEnding || isLoading}
                className="font-semibold shadow-sm gap-1.5"
              >
                {isEnding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                {isEnding ? 'Analyzing...' : 'End Interview'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will submit your session for AI analysis. Your report will be generated in 20–40 seconds.
                  You cannot continue the interview after ending it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndInterview}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Submit & Generate Report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Split Layout Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Column: Chat */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat History */}
          <ScrollArea className="flex-1 p-4 lg:p-6">
            <div className="max-w-3xl mx-auto space-y-5 pb-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground mt-24 space-y-2 opacity-60">
                  <div className="text-4xl">👋</div>
                  <p className="font-medium">The interviewer is ready.</p>
                  <p className="text-sm">Introduce yourself to get started.</p>
                </div>
              )}

              {messages.map((m) => {
                const text = ('content' in m ? (m as any).content : '') || m.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('') || ''
                const isUser = m.role === 'user'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`
                        max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                        ${isUser
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted border border-border/50 text-foreground rounded-bl-none'
                        }
                      `}
                    >
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 mt-1.5 px-1 font-semibold uppercase tracking-wider">
                      {isUser ? 'You' : 'Interviewer'}
                    </span>
                  </div>
                )
              })}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-muted border border-border/50 rounded-bl-none">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 mt-1.5 px-1 font-semibold uppercase tracking-wider">
                    Interviewer
                  </span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-none p-4 bg-background border-t shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-20">
            <div className="max-w-3xl mx-auto">
              {(sttError || chatError) && (
                <p className="text-destructive text-xs mb-2 font-medium">
                  {sttError || chatError?.message}
                </p>
              )}

              <div className="relative">
                {/* Listening waveform overlay */}
                {isListening && (
                  <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none z-10">
                    <div className="flex gap-0.5 items-end h-4">
                      {[0, 150, 300, 150, 0].map((delay, i) => (
                        <div
                          key={i}
                          className="w-1 bg-destructive rounded-full animate-bounce"
                          style={{
                            height: `${8 + i * 2}px`,
                            animationDelay: `${delay}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-destructive uppercase tracking-widest">
                      Listening...
                    </span>
                  </div>
                )}

                <Textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    manuallySetTranscript(e.target.value)
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder={isListening ? '' : 'Speak or type your answer... (Enter to submit)'}
                  className={`
                    min-h-[96px] resize-none pr-24 text-base leading-relaxed bg-muted/30
                    focus-visible:ring-primary/30 focus-visible:bg-background transition-all
                    ${isListening ? 'border-destructive/60 ring-1 ring-destructive/20 pt-10' : ''}
                  `}
                  disabled={isLoading}
                />

                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  <Button
                    size="icon"
                    variant={isListening ? 'destructive' : 'secondary'}
                    className={`rounded-full shadow-sm transition-all duration-200 ${isListening ? 'scale-110' : ''}`}
                    onClick={handleToggleMic}
                    disabled={isLoading}
                    type="button"
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  <Button
                    size="icon"
                    className="rounded-full shadow-sm bg-primary hover:bg-primary/90"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    type="button"
                    title="Submit answer"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-2.5 font-medium">
                Press <kbd className="font-sans px-1.5 py-0.5 bg-muted rounded border text-[10px]">Enter</kbd> to submit
                &nbsp;·&nbsp;
                <kbd className="font-sans px-1.5 py-0.5 bg-muted rounded border text-[10px]">Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor */}
        {isWorkspaceOpen && (
          <div className="w-[52%] hidden lg:block border-l border-border/40">
            <ActivityPanel
              code={code}
              onChange={(val) => setCode(val || '')}
              language={language}
              onLanguageChange={setLanguage}
              onRunCode={handleRunCode}
              isCompiling={isCompiling}
              output={output}
            />
          </div>
        )}

      </div>
    </div>
  )
}
