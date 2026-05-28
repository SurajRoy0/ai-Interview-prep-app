'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createInterviewAction } from '@/actions/candidate/interview'
import { toast } from 'sonner'
import { Loader2, Briefcase, Terminal, Users, Network, MessageCircle, Zap, Shield, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AllowedDifficultyMode = 'GRADUAL' | 'ADAPTIVE' | 'INTENSIVE'

interface StartInterviewModalProps {
  jobProfileId: string
  allowedDifficultyModes: string[]
  hasActiveResume: boolean
}

export function StartInterviewModal({ jobProfileId, allowedDifficultyModes, hasActiveResume }: StartInterviewModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<string>('ADAPTIVE')
  const [interviewType, setInterviewType] = useState<string>('FULL')

  // Make sure default selected difficulty is actually allowed, else fallback to first allowed
  React.useEffect(() => {
    if (open && allowedDifficultyModes.length > 0 && !allowedDifficultyModes.includes(difficulty)) {
      setDifficulty(allowedDifficultyModes[0])
    }
  }, [open, allowedDifficultyModes, difficulty])

  const handleStart = async () => {
    if (!hasActiveResume) return

    setIsLoading(true)
    const result = await createInterviewAction(jobProfileId, difficulty, interviewType)
    setIsLoading(false)

    if (result.success) {
      toast.success('Interview created successfully')
      router.push(`/candidate/interview/${result.data.interviewId}/setup`)
    } else {
      if (result.error?.code === 'INSUFFICIENT_CREDITS') {
        toast.error('Insufficient Credits', {
          description: 'You have no interview credits remaining. Please upgrade your plan.'
        })
        setOpen(false)
        // Optionally redirect to billing or show an upgrade modal here
      } else {
        toast.error(result.error?.message || 'Failed to start interview')
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await handleStart()
  }

  const difficultyOptions = [
    {
      id: 'GRADUAL',
      title: 'Warm Up',
      description: 'Starts easy, gradually increases difficulty.',
      icon: <span className="text-xl">🟢</span>
    },
    {
      id: 'ADAPTIVE',
      title: 'Adaptive',
      description: 'Dynamically adjusts based on your performance.',
      icon: <span className="text-xl">🟡</span>
    },
    {
      id: 'INTENSIVE',
      title: 'Intensive',
      description: 'Hard questions from the very start.',
      icon: <span className="text-xl">🔴</span>
    }
  ]

  const typeOptions = [
    {
      id: 'FULL',
      title: 'Full Interview',
      description: 'A realistic mix of HR, Technical, and Behavioral questions.',
      icon: <Briefcase className="w-4 h-4 text-primary" />
    },
    {
      id: 'TECHNICAL',
      title: 'Deep Technical',
      description: 'Strictly coding, algorithms, and deep technical concepts.',
      icon: <Terminal className="w-4 h-4 text-blue-500" />
    },
    {
      id: 'SYSTEM_DESIGN',
      title: 'System Design',
      description: 'Architecture, scaling, and database design focus.',
      icon: <Network className="w-4 h-4 text-purple-500" />
    },
    {
      id: 'HR',
      title: 'HR Screen',
      description: 'General background, cultural fit, and standard HR questions.',
      icon: <Users className="w-4 h-4 text-green-500" />
    },
    {
      id: 'BEHAVIORAL',
      title: 'Behavioral',
      description: 'STAR method questions focusing on past experiences.',
      icon: <MessageCircle className="w-4 h-4 text-orange-500" />
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!hasActiveResume}
          size="lg"
          className="w-full bg-background text-foreground hover:bg-background/90 rounded-xl font-bold text-sm h-12 shadow-sm"
        >
          {hasActiveResume ? 'Start Interview' : 'Upload Resume to Start'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="text-xl">Configure Session</DialogTitle>
            <DialogDescription>
              Tailor your upcoming mock interview to your specific needs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-1 pr-1 overflow-y-auto max-h-[calc(85vh-12rem)]">

          {/* Interview Focus */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              Interview Focus
            </h4>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="w-full h-auto min-h-14 py-3 px-4 bg-surface-1 border-border/60 rounded-xl hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30">
                {(() => {
                  const selectedOpt = typeOptions.find(o => o.id === interviewType)
                  if (!selectedOpt) return <span className="text-muted-foreground">Select interview type...</span>

                  return (
                    <div className="flex items-center gap-3 text-left pr-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {selectedOpt.icon}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-semibold text-sm text-foreground">{selectedOpt.title}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{selectedOpt.description}</span>
                      </div>
                    </div>
                  )
                })()}
                {/* Hidden SelectValue for accessibility/form requirements */}
                <span className="sr-only">
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="rounded-xl border-border/50 shadow-xl max-h-[280px]">
                {typeOptions.map(opt => (
                  <SelectItem key={opt.id} value={opt.id} className="py-3 px-3 focus:bg-surface-2 rounded-lg cursor-pointer group">
                    <div className="flex items-center gap-3 text-left w-full">
                      <div className="w-8 h-8 rounded-full bg-surface-3 group-focus:bg-primary/10 group-focus:text-primary flex items-center justify-center shrink-0 transition-colors">
                        {opt.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{opt.title}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Progression */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              Difficulty Level
            </h4>
            <div className="grid gap-3">
              {difficultyOptions.map(opt => {
                const isAllowed = allowedDifficultyModes.includes(opt.id)
                const isSelected = difficulty === opt.id

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!isAllowed}
                    onClick={() => setDifficulty(opt.id)}
                    className={cn(
                      "flex items-start text-left gap-3 p-3 rounded-xl border transition-all duration-200 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/60 hover:bg-surface-2",
                      !isAllowed && "opacity-60 grayscale-[0.5] cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{opt.icon}</div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                        {opt.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {/* Checkmark for selected */}
                    {isSelected && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-background rounded-full" />
                      </div>
                    )}

                    {/* PRO Badge for disabled options */}
                    {!isAllowed && (
                      <div className="absolute top-0 right-0 z-10 bg-linear-to-r from-orange-400 to-amber-500 text-white text-[9px] font-bold uppercase tracking-widest py-0.5 px-2 rounded-bl-lg shadow-sm flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" /> PRO
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          </div>

          <DialogFooter className="border-t border-border/40 pt-4 mx-0 mb-0 p-0 bg-transparent sm:justify-stretch">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold shadow-primary-glow"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Creating Session...' : 'Begin Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
