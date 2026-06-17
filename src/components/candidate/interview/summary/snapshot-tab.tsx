import { useState } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { InterviewSummaryData } from './types'
import type { TopicTurn } from '@repo/db'

type SnapshotTabProps = {
  topics: InterviewSummaryData['topics']
}

function TranscriptMessage({ turn }: { turn: TopicTurn }) {
  return (
    <div className={cn(
      'flex flex-col gap-1.5 max-w-[82%]',
      turn.role === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
    )}>
      <span className="text-[10px] text-muted-foreground font-medium px-1">
        {turn.role === 'AI' ? 'Interviewer' : 'You'}
      </span>
      <div className={cn(
        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
        turn.role === 'USER'
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-surface-2 text-foreground border border-border/50 rounded-tl-sm'
      )}>
        {turn.content}
      </div>
    </div>
  )
}

function EmptyTranscript() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
      <div className="h-10 w-10 rounded-full bg-surface-2 border border-border/50 flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-sm">No transcript available for this topic.</p>
    </div>
  )
}

export function SnapshotTab({ topics }: SnapshotTabProps) {
  const [topicIndex, setTopicIndex] = useState(0)
  const activeTopic = topics[topicIndex]
  const visibleTurns = activeTopic?.turns?.filter((t) => t.turnType !== 'CODE_SUBMISSION') ?? []

  return (
    <TabsContent value="snapshot" className="mt-8">
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-surface-1 space-y-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-8"
            disabled={topicIndex === 0}
            onClick={() => setTopicIndex((prev) => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
              Topic {topicIndex + 1} of {topics.length}
            </p>
            <CardTitle className="text-sm font-semibold mt-0.5">
              {activeTopic?.plannedCategory}
            </CardTitle>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-8"
            disabled={topicIndex === topics.length - 1}
            onClick={() => setTopicIndex((prev) => prev + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>

        <ScrollArea className="h-[560px]">
          <CardContent className="p-6 space-y-5">
            {visibleTurns.length === 0 ? (
              <EmptyTranscript />
            ) : (
              visibleTurns.map((turn, i) => (
                <TranscriptMessage key={i} turn={turn} />
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </TabsContent>
  )
}
