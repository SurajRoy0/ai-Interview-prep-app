'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2, Mic, AlertTriangle } from 'lucide-react'
import { getInterviewPlanStatusAction, retryInterviewPlanGenerationAction } from '@/actions/candidate/interview-status'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SetupPollerProps {
  interviewId: string
  initialPlanStatus: string
  initialPlanGenerated: boolean
}

const GENERATING_MESSAGES = [
  "Analyzing your resume...",
  "Identifying key technical skills...",
  "Calibrating difficulty progression...",
  "Generating targeted interview questions...",
  "Finalizing your personalized plan...",
]

export function SetupPoller({ interviewId, initialPlanStatus, initialPlanGenerated }: SetupPollerProps) {
  const router = useRouter()
  const [status, setStatus] = React.useState(initialPlanStatus)
  const [isGenerated, setIsGenerated] = React.useState(initialPlanGenerated)
  const [retryLoading, setRetryLoading] = React.useState(false)
  const [messageIndex, setMessageIndex] = React.useState(0)
  
  // Basic mock mic check state
  const [micChecked, setMicChecked] = React.useState(false)

  React.useEffect(() => {
    // Cycle through messages every 2.5 seconds if still processing
    if (status === 'PROCESSING' || status === 'PENDING') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [status])

  React.useEffect(() => {
    if (isGenerated || status === 'FAILED') return

    const poll = async () => {
      const result = await getInterviewPlanStatusAction(interviewId)
      if (result.success) {
        setStatus(result.data.planStatus)
        setIsGenerated(result.data.planGenerated)
      }
    }

    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [interviewId, isGenerated, status])

  const handleRetry = async () => {
    setRetryLoading(true)
    const result = await retryInterviewPlanGenerationAction(interviewId)
    setRetryLoading(false)
    if (result.success) {
      toast.success("Retrying plan generation...")
      setStatus('PENDING')
      setIsGenerated(false)
      setMessageIndex(0)
    } else {
      toast.error(result.error?.message || "Failed to retry")
    }
  }

  const handleMicCheck = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Mic API blocked by browser (needs HTTPS). Bypassing for testing.")
        setMicChecked(true) // Allow them to proceed with text
        return
      }
      
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicChecked(true)
      toast.success("Microphone connected successfully!")
    } catch {
      toast.error("Please allow microphone access to proceed.")
    }
  }

  const handleStart = () => {
    if (!isGenerated || !micChecked) return
    router.push(`/candidate/interview/${interviewId}/session`)
  }

  return (
    <div className="space-y-8 mt-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Step 1: AI Planner */}
        <div className={cn(
          "bg-surface-2 border rounded-2xl p-6 transition-all duration-300",
          isGenerated ? "border-primary/50 bg-primary/5" : status === 'FAILED' ? "border-destructive/50" : "border-border/50 shadow-md"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isGenerated ? "bg-primary text-primary-foreground" : status === 'FAILED' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary animate-pulse"
            )}>
              {isGenerated ? <CheckCircle2 className="w-5 h-5" /> : status === 'FAILED' ? <AlertTriangle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">AI Interview Plan</h3>
              
              {!isGenerated && status !== 'FAILED' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    {GENERATING_MESSAGES[messageIndex]}
                  </p>
                  <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-indeterminate-bar" />
                  </div>
                </div>
              )}

              {isGenerated && (
                <p className="text-sm text-muted-foreground">
                  Your personalized interview blueprint is ready.
                </p>
              )}

              {status === 'FAILED' && (
                <div className="space-y-3">
                  <p className="text-sm text-destructive font-medium">Generation failed or timed out.</p>
                  <Button variant="outline" size="sm" onClick={handleRetry} disabled={retryLoading}>
                    {retryLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Retry Generation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Equipment */}
        <div className={cn(
          "bg-surface-2 border rounded-2xl p-6 transition-all duration-300",
          micChecked ? "border-primary/50 bg-primary/5" : "border-border/50"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              micChecked ? "bg-primary text-primary-foreground" : "bg-surface-3 text-muted-foreground"
            )}>
              {micChecked ? <CheckCircle2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Equipment Check</h3>
              <p className="text-sm text-muted-foreground">
                We need access to your microphone to capture your responses.
              </p>
              {!micChecked && (
                <Button variant="outline" size="sm" onClick={handleMicCheck} className="mt-2">
                  Test Microphone
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border/40">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl font-bold"
          disabled={!isGenerated || !micChecked}
          onClick={handleStart}
        >
          {(!isGenerated || !micChecked) ? 'Waiting for setup...' : 'Begin Interview Session'}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3 font-medium flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Note: 1 Interview Credit will be deducted when the session begins.
        </p>
      </div>
    </div>
  )
}
