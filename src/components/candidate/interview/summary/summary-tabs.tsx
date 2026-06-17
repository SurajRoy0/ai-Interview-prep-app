'use client'

import { useEffect, useState } from 'react'
import { getInterviewSummaryAction } from '@/actions/candidate/report'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceReportTab } from './performance-report-tab'
import { SnapshotTab } from './snapshot-tab'
import type { InterviewSummaryData } from './types'

const TAB_TRIGGER_CLASS =
  'rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-active:bg-primary data-active:text-white! data-active:shadow-sm data-[state=active]:bg-primary data-[state=active]:text-white!'

type SummaryTabsProps = {
  interviewId: string
  initialInterview: InterviewSummaryData
}

export function SummaryTabs({ interviewId, initialInterview }: SummaryTabsProps) {
  const [interview, setInterview] = useState<InterviewSummaryData>(initialInterview)

  const isFinalizing = interview.topics.some(t => t.judgePending === true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const poll = async () => {
      const res = await getInterviewSummaryAction(interviewId)
      if (res.success) {
        setInterview(res.data.interview as InterviewSummaryData)
      }
    }

    if (isFinalizing) {
      interval = setInterval(poll, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isFinalizing, interviewId])

  if (!interview) return null

  const topics = interview.topics || []

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Interview Summary</h1>
        <p className="text-sm text-muted-foreground">Review your performance report and interview transcript.</p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="w-full justify-start bg-surface-1 border border-border/50 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger value="report" className={TAB_TRIGGER_CLASS}>
            Performance Report
          </TabsTrigger>
          <TabsTrigger value="snapshot" className={TAB_TRIGGER_CLASS}>
            Interview Snapshot
          </TabsTrigger>
        </TabsList>

        <PerformanceReportTab interview={interview} isFinalizing={isFinalizing} />
        <SnapshotTab topics={topics} />
      </Tabs>
    </div>
  )
}
