import { Badge } from '@/components/ui/badge'
import { TopicBreakdownCard } from './topic-breakdown-card'
import type { InterviewSummaryData } from './types'

type TopicBreakdownProps = {
  topics: InterviewSummaryData['topics']
}

export function TopicBreakdown({ topics }: TopicBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold">Topic Breakdown</h3>
        <Badge variant="secondary" className="text-xs">{topics.length}</Badge>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <TopicBreakdownCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  )
}
