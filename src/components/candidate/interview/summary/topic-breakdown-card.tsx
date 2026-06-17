import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getScoreSolidBgClass } from './utils'
import type { InterviewSummaryData } from './types'

type Topic = InterviewSummaryData['topics'][number]

type TopicBreakdownCardProps = {
  topic: Topic
}

export function TopicBreakdownCard({ topic }: TopicBreakdownCardProps) {
  const isSkipped = topic.status === 'SKIPPED' || topic.status === 'PENDING'
  const score = isSkipped ? 0 : (topic.judgeScore || 0)

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-colors duration-200 p-0 gap-0">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className={cn(
          'p-5 flex flex-col items-center justify-center w-full md:w-44 shrink-0 self-stretch text-white',
          getScoreSolidBgClass(score)
        )}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-2">
            Topic {topic.topicIndex + 1}
          </span>
          <div className="text-3xl font-bold text-white">
            {score}
            <span className="text-base font-normal text-white/70">/100</span>
          </div>
          {isSkipped && (
            <Badge className="text-[10px] mt-2 bg-white/15 text-white border-white/20 hover:bg-white/15">
              Skipped
            </Badge>
          )}
        </div>

        <CardContent className="p-5 flex-1 space-y-3">
          <div>
            <h4 className="font-semibold">{topic.plannedCategory}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{topic.plannedIntent}</p>
          </div>

          {topic.judgeSummary && (
            <p className="text-sm leading-relaxed text-foreground/80">
              {topic.judgeSummary}
            </p>
          )}

          {!isSkipped && (topic.judgeStrengths?.length > 0 || topic.judgeWeaknesses?.length > 0) && (
            <>
              <Separator className="opacity-50" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.judgeStrengths?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-score-high flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                    </div>
                    <ul className="space-y-1">
                      {topic.judgeStrengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="mt-0.5 text-score-high">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {topic.judgeWeaknesses?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-score-mid flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
                    </div>
                    <ul className="space-y-1">
                      {topic.judgeWeaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="mt-0.5 text-score-mid">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
