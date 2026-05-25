'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInterviewAction } from '@/actions/interview'
import { Button } from '@/components/ui/button'
import { AlertCircle, PlayCircle, Loader2, ShieldCheck, Mic } from 'lucide-react'
import { toast } from 'sonner'

interface StartFormProps {
  resumeId: string
  jobProfileId: string
  targetRole: string
  experienceLevel: string
}

export function StartInterviewForm({ resumeId, jobProfileId, targetRole, experienceLevel }: StartFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await createInterviewAction({
        resumeId,
        jobProfileId,
        type: 'FULL',
        mode: 'MIXED',
        interviewFormat: 'full',
      })

      if (!result.success) {
        if (result.error.code === 'INSUFFICIENT_CREDITS') {
          toast.error('Insufficient Credits', {
            description: 'You need an interview credit to start. Redirecting to billing...',
          })
          router.push('/billing')
          return
        }
        toast.error(result.error.message || 'Failed to start interview')
        setLoading(false)
        return
      }

      toast.success('Interview created! Entering sandbox...')
      router.push(`/interview/${result.data.interviewId}`)
    } catch (error) {
      console.error('Failed to create interview:', error)
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto mt-8">
      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Ready to begin?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You are about to start a technical mock interview for the{' '}
            <strong className="text-foreground">{targetRole}</strong> role at the{' '}
            <strong className="text-foreground">{experienceLevel}</strong> level.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex gap-2.5 text-sm text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
            <Mic className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Voice-in or type your answers</span>
          </div>
          <div className="flex gap-2.5 text-sm text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Fullscreen sandbox mode required</span>
          </div>
        </div>

        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
          <div className="flex gap-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              The AI will ask questions based on your resume and evaluate you honestly.
              Ensure a quiet environment before starting.
            </p>
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-12 text-base font-semibold rounded-xl shadow-primary-glow"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Preparing Sandbox...
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Interview — 1 Credit
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
