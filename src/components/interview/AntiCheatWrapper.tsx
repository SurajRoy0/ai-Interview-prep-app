'use client'

import { useEffect, useState, useRef } from 'react'
import { AlertCircle, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AntiCheatWrapperProps {
  children: React.ReactNode
}

export function AntiCheatWrapper({ children }: AntiCheatWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tabSwitches, setTabSwitches] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fullscreen Management
  const requestFullscreen = async () => {
    try {
      if (wrapperRef.current) {
        await wrapperRef.current.requestFullscreen()
      }
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Tab Switch Detection (Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen) {
        setTabSwitches((prev) => {
          const newCount = prev + 1
          // TODO: Send metric to InterviewAnalytics via server action
          console.warn(`Tab switch detected! Total infractions: ${newCount}`)
          return newCount
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isFullscreen])

  // Block Copy/Paste
  const handleCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Optionally trigger a toast here
  }

  if (!isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-card border rounded-xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sandbox Mode Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            To ensure the integrity of the interview, you must remain in full-screen mode. Switching tabs or exiting full-screen will be logged.
          </p>
          <Button onClick={requestFullscreen} className="w-full">
            <Maximize className="w-4 h-4 mr-2" />
            Enter Sandbox & Begin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={wrapperRef} 
      className="w-full h-screen bg-background text-foreground overflow-hidden"
      onCopy={handleCopyPaste}
      onPaste={handleCopyPaste}
    >
      {/* Optional: Show a subtle warning if they have switched tabs */}
      {tabSwitches > 0 && (
        <div className="absolute top-0 w-full bg-destructive/10 text-destructive text-xs py-1 text-center font-medium z-50">
          Warning: Tab switch detected. This will be noted in your final report.
        </div>
      )}
      
      {children}
    </div>
  )
}
