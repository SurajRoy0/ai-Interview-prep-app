'use client'

import { useInterviewStore } from '@/store/interview-store'

export function LiveTranscript() {
  const { liveTranscript, phase } = useInterviewStore()

  if (phase !== 'recording') return null
  if (!liveTranscript) return null

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none z-20">
      <div className="bg-background/90 backdrop-blur border border-primary/20 p-4 rounded-xl shadow-lg text-center mx-auto transition-all animate-in slide-in-from-bottom-2 fade-in duration-300">
        <p className="text-lg text-foreground font-medium italic">
          &quot;{liveTranscript}&quot;
        </p>
      </div>
    </div>
  )
}
