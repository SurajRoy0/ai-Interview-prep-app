'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { startInterviewAction } from '@/actions/interview'
import { readStreamableValue } from '@ai-sdk/rsc'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Mic, Settings } from 'lucide-react'

export function PreInterviewScreen({ interviewId }: { interviewId: string }) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setStarting(true)
    setError(null)

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access is required to start the interview.')
      setStarting(false)
      return
    }

    const result = await startInterviewAction(interviewId)

    if (!result.success) {
      setError(result.error?.message ?? 'Failed to start interview.')
      setStarting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to begin?</CardTitle>
          <CardDescription>
            Your interview plan has been generated based on your resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-secondary/50 rounded-lg">
            <Mic className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium">Voice Mode</h3>
              <p className="text-sm text-muted-foreground">
                Hold the mic button or press and hold <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Tab</kbd> to speak. Release to submit your answer.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-secondary/50 rounded-lg">
            <Settings className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium">Activities</h3>
              <p className="text-sm text-muted-foreground">
                You may be asked to solve problems or explain concepts. The code editor will appear automatically if needed.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {starting ? 'Starting Interview...' : 'Start Interview'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
