import { TabsContent } from '@/components/ui/tabs'
import { FinalizingResults } from './finalizing-results'
import { SummaryStats } from './summary-stats'
import { TopicBreakdown } from './topic-breakdown'
import { computeInterviewStats } from './utils'
import type { InterviewSummaryData } from './types'

type PerformanceReportTabProps = {
  interview: InterviewSummaryData
  isFinalizing: boolean
}

export function PerformanceReportTab({ interview, isFinalizing }: PerformanceReportTabProps) {
  const topics = interview.topics || []
  const stats = computeInterviewStats(interview)

  return (
    <TabsContent value="report" className="mt-8 space-y-8">
      {isFinalizing ? (
        <FinalizingResults />
      ) : (
        <div className="space-y-6">
          <SummaryStats stats={stats} totalTopics={interview.totalTopics} />
          <TopicBreakdown topics={topics} />
        </div>
      )}
    </TabsContent>
  )
}
