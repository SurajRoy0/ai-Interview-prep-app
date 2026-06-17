import type { Interview, InterviewTopic, TopicTurn } from '@repo/db'

export type InterviewSummaryData = Interview & {
  topics: (InterviewTopic & { turns: TopicTurn[] })[]
}

export type InterviewStats = {
  overallPercentage: number
  completedTopics: number
  skippedTopics: number
  bestScore: number
  durationSeconds: number | null
  totalStrengths: number
  totalImprovements: number
}
