'use client'

import React, { useEffect, useState } from 'react'
import { getInterviewSummaryAction } from '@/actions/candidate/report'
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Award, AlertCircle, Clock, Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Interview, InterviewTopic, TopicTurn } from '@repo/db'

type InterviewSummaryData = Interview & {
  topics: (InterviewTopic & { turns: TopicTurn[] })[]
}

function getScoreClass(score: number) {
  if (score >= 70) return 'text-score-high'
  if (score >= 40) return 'text-score-mid'
  return 'text-score-low'
}

function getScoreBgClass(score: number) {
  if (score >= 70) return 'bg-score-high'
  if (score >= 40) return 'bg-score-mid'
  return 'bg-score-low'
}

function getScoreSolidBgClass(score: number) {
  if (score >= 70) return 'bg-[var(--score-high)]'
  if (score >= 40) return 'bg-[var(--score-mid)]'
  return 'bg-[var(--score-low)]'
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hrs}h ${remMins}m`
  }
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  subtitle: string
  icon: React.ElementType
  iconClassName?: string
  iconContainerClassName?: string
  valueClassName?: string
}) {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', iconContainerClassName)}>
            <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
          </div>
        </div>
        <p className={cn('text-2xl font-extrabold tracking-tight', valueClassName)}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

export function SummaryTabs({ interviewId, initialInterview }: { interviewId: string, initialInterview: InterviewSummaryData }) {
  const [interview, setInterview] = useState<InterviewSummaryData>(initialInterview)
  const [snapshotTopicIndex, setSnapshotTopicIndex] = useState(0)

  const isFinalizing = interview?.topics.some(t => t.judgePending === true)

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
    return () => { if (interval) clearInterval(interval) }
  }, [isFinalizing, interviewId])

  if (!interview) return null

  const topics = interview.topics || []
  const activeSnapshotTopic = topics[snapshotTopicIndex]

  const totalScoreSum = topics.reduce((acc, t) => acc + (t.judgeScore || 0), 0)
  const overallPercentage = interview.totalTopics > 0
    ? Math.round(totalScoreSum / interview.totalTopics)
    : 0

  const completedTopics = topics.filter(t => t.status === 'CLOSED').length
  const skippedTopics = topics.filter(t => t.status === 'SKIPPED' || t.status === 'PENDING').length
  const attemptedScores = topics
    .filter(t => t.status !== 'SKIPPED' && t.status !== 'PENDING')
    .map(t => t.judgeScore ?? 0)
  const bestScore = attemptedScores.length > 0 ? Math.max(...attemptedScores) : 0
  const durationSeconds = interview.durationSeconds ?? (
    interview.startedAt && interview.completedAt
      ? Math.floor((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000)
      : null
  )
  const totalStrengths = topics.reduce((acc, t) => acc + (t.judgeStrengths?.length ?? 0), 0)
  const totalImprovements = topics.reduce((acc, t) => acc + (t.judgeWeaknesses?.length ?? 0), 0)

  return (
    <div className="w-full space-y-8 p-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Interview Summary</h1>
        <p className="text-sm text-muted-foreground">Review your performance report and interview transcript.</p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="w-full justify-start bg-surface-1 border border-border/50 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger
            value="report"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-active:bg-primary data-active:text-white! data-active:shadow-sm data-[state=active]:bg-primary data-[state=active]:text-white!"
          >
            Performance Report
          </TabsTrigger>
          <TabsTrigger
            value="snapshot"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-active:bg-primary data-active:text-white! data-active:shadow-sm data-[state=active]:bg-primary data-[state=active]:text-white!"
          >
            Interview Snapshot
          </TabsTrigger>
        </TabsList>

        {/* ── Performance Report ─────────────────────────────────────────────── */}
        <TabsContent value="report" className="mt-8 space-y-8">
          {isFinalizing ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative bg-primary/10 p-5 rounded-full">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Finalizing your results...</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Our AI is evaluating your final answers. This will only take a moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
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
                  value={<>{completedTopics}<span className="text-base font-normal text-muted-foreground">/{interview.totalTopics}</span></>}
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

              {/* Topic Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Topic Breakdown</h3>
                  <Badge variant="secondary" className="text-xs">{topics.length}</Badge>
                </div>

                <div className="space-y-3">
                  {topics.map((topic) => {
                    const isSkipped = topic.status === 'SKIPPED' || topic.status === 'PENDING'
                    const score = isSkipped ? 0 : (topic.judgeScore || 0)

                    return (
                      <Card key={topic.id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-colors duration-200 p-0 gap-0">
                        <div className="flex flex-col md:flex-row md:items-stretch">
                          {/* Score sidebar */}
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

                          {/* Details */}
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
                  })}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Interview Snapshot ─────────────────────────────────────────────── */}
        <TabsContent value="snapshot" className="mt-8">
          <Card className="overflow-hidden border-border/50">
            {/* Topic navigation header */}
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-surface-1 space-y-0">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8"
                disabled={snapshotTopicIndex === 0}
                onClick={() => setSnapshotTopicIndex(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                  Topic {snapshotTopicIndex + 1} of {topics.length}
                </p>
                <CardTitle className="text-sm font-semibold mt-0.5">
                  {activeSnapshotTopic?.plannedCategory}
                </CardTitle>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8"
                disabled={snapshotTopicIndex === topics.length - 1}
                onClick={() => setSnapshotTopicIndex(prev => prev + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>

            {/* Transcript */}
            <ScrollArea className="h-[560px]">
              <CardContent className="p-6 space-y-5">
                {!activeSnapshotTopic?.turns || activeSnapshotTopic.turns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
                    <MessageBubbleEmpty />
                    <p className="text-sm">No transcript available for this topic.</p>
                  </div>
                ) : (
                  activeSnapshotTopic.turns
                    .filter((t: TopicTurn) => t.turnType !== 'CODE_SUBMISSION')
                    .map((turn: TopicTurn, i: number) => (
                      <div
                        key={i}
                        className={cn(
                          'flex flex-col gap-1.5 max-w-[82%]',
                          turn.role === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
                        )}
                      >
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
                    ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MessageBubbleEmpty() {
  return (
    <div className="h-10 w-10 rounded-full bg-surface-2 border border-border/50 flex items-center justify-center">
      <AlertCircle className="w-4 h-4 text-muted-foreground" />
    </div>
  )
}
