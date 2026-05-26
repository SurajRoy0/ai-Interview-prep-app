'use client'

import { useInterviewStore } from '@/store/interview-store'
import { CodeEditor } from '@/components/interview/CodeEditor'
import { Button } from '@/components/ui/button'
import { submitActivityAction as submitAct, startActivityAction as startAct } from '@/actions/activity'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function ActivityPanel({ interviewId }: { interviewId: string }) {
  const { currentActivity, setActivity, codeEditorContent, setPhase, phase } = useInterviewStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (phase === 'activity_active' && !currentActivity && !loading) {
      setLoading(true)
      startAct(interviewId).then(res => {
        setLoading(false)
        if (res.success && res.data?.activity) {
          setActivity(res.data.activity)
        } else {
          setError(res.error?.message ?? 'Failed to load activity')
        }
      })
    }
  }, [phase, currentActivity, interviewId, loading, setActivity])

  if (phase !== 'activity_active') return null

  if (loading || !currentActivity) {
    return (
      <div className="flex-1 border-l bg-muted/20 p-6 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Generating your technical challenge...</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    const result = await submitAct(interviewId, currentActivity.requiresCodeEditor ? codeEditorContent : 'Completed conceptually')
    setLoading(false)
    if (result.success) {
      setActivity(null)
      // Advance to next turn / processing state
      // This is slightly simplified. We'd tell the AI that the activity is complete and fetch next question.
      // For now, let's just trigger a submission so the AI parses it.
      setPhase('processing')
      // Ideally we would trigger `submitTurnAction` here. Since ActiveInterview controls that, we might want to pass a callback.
      // In a real implementation we would lift the submit logic up or use the store to trigger a re-fetch.
    } else {
      setError(result.error?.message ?? 'Failed to submit')
    }
  }

  return (
    <div className="w-1/2 min-w-[400px] border-l bg-background flex flex-col z-20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b bg-secondary/30">
        <h2 className="text-lg font-bold">{currentActivity.title}</h2>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
          {currentActivity.prompt}
        </p>
      </div>
      
      <div className="flex-1 p-4 bg-[#1d1f21]">
        {currentActivity.requiresCodeEditor ? (
          <CodeEditor />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No code editor required for this activity.
          </div>
        )}
      </div>

      <div className="p-4 border-t flex justify-between items-center bg-background">
        <p className="text-sm text-destructive">{error}</p>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit Solution
        </Button>
      </div>
    </div>
  )
}
