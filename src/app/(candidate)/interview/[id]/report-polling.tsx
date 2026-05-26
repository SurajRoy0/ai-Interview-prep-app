'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ReportPollingProps {
  interviewId: string
  pollIntervalMs?: number
}

export function ReportPolling({ pollIntervalMs = 5000 }: ReportPollingProps) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, pollIntervalMs)

    return () => clearInterval(interval)
  }, [router, pollIntervalMs])

  return null
}
