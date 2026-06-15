'use client'

import React, { useEffect, useState } from 'react'
import { getInterviewSummaryAction } from '@/actions/candidate/report'
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Award, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Interview, InterviewTopic, TopicTurn } from '@repo/db'

type InterviewSummaryData = Interview & {
  topics: (InterviewTopic & { turns: TopicTurn[] })[]
}

export function SummaryTabs({ interviewId, initialInterview }: { interviewId: string, initialInterview: InterviewSummaryData }) {
  const [interview, setInterview] = useState<InterviewSummaryData>(initialInterview)

  // Snapshot View State
  const [snapshotTopicIndex, setSnapshotTopicIndex] = useState(0)

  // Check if any topic is still judging
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

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isFinalizing, interviewId])

  if (!interview) return null

  const topics = interview.topics || []
  const activeSnapshotTopic = topics[snapshotTopicIndex]

  // Calculate overall percentage
  // Any unattempted or skipped topic implicitly contributes 0 to the sum, 
  // but totalTopics remains the denominator.
  const totalScoreSum = topics.reduce((acc, t) => acc + (t.judgeScore || 0), 0)
  const overallPercentage = interview.totalTopics > 0 
    ? Math.round(totalScoreSum / interview.totalTopics)
    : 0

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Interview Summary</h1>
        <p className="text-muted-foreground">Review your performance report and interview transcript.</p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="report"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Performance Report
          </TabsTrigger>
          <TabsTrigger
            value="snapshot"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Interview Snapshot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-8 space-y-8">
          {isFinalizing && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative bg-primary/10 p-4 rounded-full">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Finalizing your results...</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Our AI is currently evaluating your final answers. This will only take a moment.
                </p>
              </div>
            </div>
          )}

          {!isFinalizing && (
            <div className="space-y-8">
              {/* Overall Score Card */}
              <div className="bg-surface-1 rounded-2xl border p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  <Award className="w-12 h-12" />
                </div>
                <div>
                  <div className="text-5xl font-bold tracking-tighter text-primary">
                    {overallPercentage}
                    <span className="text-2xl text-muted-foreground font-normal">%</span>
                  </div>
                  <p className="font-medium mt-2">Overall Score</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Topic Breakdown</h3>
                {topics.map((topic, idx) => {
                  const isSkipped = topic.status === 'SKIPPED' || topic.status === 'PENDING';
                  const score = isSkipped ? 0 : (topic.judgeScore || 0);

                  return (
                    <Card key={topic.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-muted/50 p-6 flex flex-col items-center justify-center md:w-48 border-b md:border-b-0 md:border-r border-border/50">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Topic {topic.topicIndex + 1}
                          </span>
                          <div className={cn("text-3xl font-bold", isSkipped ? "text-muted-foreground" : "text-primary")}>
                            {score}<span className="text-lg font-normal text-muted-foreground">/100</span>
                          </div>
                          {isSkipped && <Badge variant="secondary" className="mt-2">Skipped</Badge>}
                        </div>
                        <div className="p-6 flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{topic.plannedCategory}</h4>
                              <p className="text-sm text-muted-foreground">{topic.plannedIntent}</p>
                            </div>
                          </div>
                          
                          {topic.judgeSummary && (
                            <p className="text-[15px] leading-relaxed text-foreground/90">
                              {topic.judgeSummary}
                            </p>
                          )}

                          {(!isSkipped && (topic.judgeStrengths?.length > 0 || topic.judgeWeaknesses?.length > 0)) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {topic.judgeStrengths?.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Strengths
                                  </div>
                                  <ul className="space-y-1">
                                    {topic.judgeStrengths.map((s, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="mt-1 text-green-500">•</span>
                                        <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {topic.judgeWeaknesses?.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" /> Areas to Improve
                                  </div>
                                  <ul className="space-y-1">
                                    {topic.judgeWeaknesses.map((w, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="mt-1 text-amber-500">•</span>
                                        <span>{w}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="snapshot" className="mt-8">
          <div className="flex flex-col border rounded-xl bg-surface-1 min-h-[600px]">
            {/* Topic Navigation */}
            <div className="flex items-center justify-between border-b p-4 bg-background/50 rounded-t-xl">
              <Button
                variant="outline"
                size="sm"
                disabled={snapshotTopicIndex === 0}
                onClick={() => setSnapshotTopicIndex(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous Topic
              </Button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Topic {snapshotTopicIndex + 1} of {topics.length}
                </p>
                <p className="font-medium">{activeSnapshotTopic?.plannedCategory}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={snapshotTopicIndex === topics.length - 1}
                onClick={() => setSnapshotTopicIndex(prev => prev + 1)}
              >
                Next Topic <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Transcript */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-6">
              {!activeSnapshotTopic?.turns || activeSnapshotTopic.turns.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">No transcript available for this topic.</div>
              ) : (
                activeSnapshotTopic.turns.filter((t: TopicTurn) => t.turnType !== 'CODE_SUBMISSION').map((turn: TopicTurn, i: number) => (
                  <div key={i} className={cn("flex flex-col gap-1.5 max-w-[85%]", turn.role === 'USER' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <div className="text-xs text-muted-foreground font-medium px-2">
                      {turn.role === 'AI' ? 'Interviewer' : 'You'}
                    </div>
                    <div className={cn(
                      "px-5 py-3 rounded-2xl text-[15px] leading-relaxed",
                      turn.role === 'USER'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground border rounded-tl-sm"
                    )}>
                      {turn.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
