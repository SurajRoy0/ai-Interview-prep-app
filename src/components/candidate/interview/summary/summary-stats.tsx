import { Award, CheckCircle2, Clock, Trophy } from 'lucide-react'
import { StatCard } from './stat-card'
import { formatDuration, getScoreBgClass, getScoreClass } from './utils'
import type { InterviewStats } from './types'

type SummaryStatsProps = {
  stats: InterviewStats
  totalTopics: number
}

export function SummaryStats({ stats, totalTopics }: SummaryStatsProps) {
  const {
    overallPercentage,
    completedTopics,
    skippedTopics,
    bestScore,
    durationSeconds,
    totalStrengths,
    totalImprovements,
  } = stats

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Overall Score"
        value={<>{overallPercentage}<span className="text-base font-normal text-muted-foreground">%</span></>}
        subtitle="across all topics"
        icon={Award}
        iconClassName={getScoreClass(overallPercentage)}
        iconContainerClassName={getScoreBgClass(overallPercentage)}
        valueClassName={getScoreClass(overallPercentage)}
      />
      <StatCard
        label="Completed"
        value={<>{completedTopics}<span className="text-base font-normal text-muted-foreground">/{totalTopics}</span></>}
        subtitle={skippedTopics > 0 ? `${skippedTopics} skipped` : 'topics finished'}
        icon={CheckCircle2}
        iconClassName="text-primary"
        iconContainerClassName="bg-primary/10"
      />
      <StatCard
        label="Best Topic"
        value={<>{bestScore}<span className="text-base font-normal text-muted-foreground">/100</span></>}
        subtitle="highest single score"
        icon={Trophy}
        iconClassName={getScoreClass(bestScore)}
        iconContainerClassName={getScoreBgClass(bestScore)}
        valueClassName={getScoreClass(bestScore)}
      />
      <StatCard
        label="Duration"
        value={formatDuration(durationSeconds)}
        subtitle={`${totalStrengths} strengths · ${totalImprovements} improvements`}
        icon={Clock}
        iconClassName="text-primary"
        iconContainerClassName="bg-primary/10"
      />
    </div>
  )
}
