'use client'

import { useInterviewStore } from '@/store/interview-store'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'
import { useState } from 'react'
import { endInterviewAction } from '@/actions/interview'
import { XCircle, Loader2 } from 'lucide-react'

export function InterviewHeader() {
  const { currentTurnIndex, totalTurns, elapsedSeconds, tickTimer, phase, interviewId } = useInterviewStore()

  // Run timer when interview is active
  useInterviewTimer(phase !== 'idle' && phase !== 'completed' && phase !== 'failed', tickTimer, 1000)

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const progress = totalTurns > 0 ? (currentTurnIndex / totalTurns) * 100 : 0

  const [showEndDialog, setShowEndDialog] = useState(false)
  const [ending, setEnding] = useState(false)

  const handleEndInterview = async () => {
    if (!interviewId) return
    setEnding(true)
    const res = await endInterviewAction(interviewId)
    setEnding(false)
    if (res.success) {
      window.location.href = `/interview/${interviewId}`
    } else {
      setShowEndDialog(false)
    }
  }

  return (
    <header className="flex flex-col w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Technical Interview</h1>
          <p className="text-sm text-muted-foreground">
            Question {Math.max(1, currentTurnIndex)} of {totalTurns}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Elapsed Time</span>
            <span className="text-lg font-mono tabular-nums text-primary">{formatTime(elapsedSeconds)}</span>
          </div>

          {phase !== 'idle' && phase !== 'completed' && phase !== 'failed' && (
            <Button 
              variant="outline" 
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowEndDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          )}
        </div>
      </div>

      <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ConfirmationDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        title="End interview?"
        description="Are you sure you want to end the interview early? Your report will be generated based on the questions you have answered so far."
        confirmLabel="End Interview"
        variant="confirm"
        destructive
        loading={ending}
        onConfirm={handleEndInterview}
      />
    </header>
  )
}
