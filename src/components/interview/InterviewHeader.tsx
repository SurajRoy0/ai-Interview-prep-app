'use client'

import { useInterviewStore } from '@/store/interview-store'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'

export function InterviewHeader() {
  const { currentTurnIndex, totalTurns, elapsedSeconds, tickTimer, phase } = useInterviewStore()

  // Run timer when interview is active
  useInterviewTimer(phase !== 'idle' && phase !== 'completed' && phase !== 'failed', tickTimer, 1000)

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const progress = totalTurns > 0 ? (currentTurnIndex / totalTurns) * 100 : 0

  return (
    <header className="flex flex-col w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Technical Interview</h1>
          <p className="text-sm text-muted-foreground">
            Question {Math.max(1, currentTurnIndex)} of {totalTurns}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Elapsed Time</span>
            <span className="text-lg font-mono tabular-nums text-primary">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
