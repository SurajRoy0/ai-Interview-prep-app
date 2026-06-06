'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface SessionTimerProps {
  timeLimitSeconds: number
  elapsedSeconds: number
  isActive: boolean
  onExpire: () => void
}

export function SessionTimer({ timeLimitSeconds, elapsedSeconds, isActive, onExpire }: SessionTimerProps) {
  const [remaining, setRemaining] = React.useState(timeLimitSeconds - elapsedSeconds)
  
  // To avoid firing onExpire multiple times
  const hasExpired = React.useRef(false)

  React.useEffect(() => {
    // Reset expiration tracking if new topic or active state changes
    hasExpired.current = false
    setRemaining(timeLimitSeconds - elapsedSeconds)
  }, [timeLimitSeconds, elapsedSeconds, isActive])

  React.useEffect(() => {
    if (!isActive || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1
        if (next <= 0 && !hasExpired.current) {
          hasExpired.current = true
          clearInterval(interval)
          setTimeout(onExpire, 0)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, remaining, onExpire])

  const progressValue = Math.max(0, Math.min(100, (remaining / timeLimitSeconds) * 100))
  
  const minutes = Math.floor(Math.max(0, remaining) / 60)
  const seconds = Math.max(0, remaining) % 60
  
  const isDanger = remaining <= 30

  return (
    <div className="flex flex-col space-y-2 w-full max-w-sm">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-muted-foreground">Topic Time Remaining</span>
        <span className={cn(
          "font-mono tabular-nums transition-colors duration-300", 
          isDanger ? "text-destructive animate-pulse" : "text-foreground"
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <Progress 
        value={progressValue} 
        className={cn("h-2 transition-all duration-1000", isDanger && "bg-destructive/20 [&>div]:bg-destructive")} 
      />
    </div>
  )
}
