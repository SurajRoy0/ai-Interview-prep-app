import type { InterviewSummaryData, InterviewStats } from './types'

export function getScoreClass(score: number) {
  if (score >= 70) return 'text-score-high'
  if (score >= 40) return 'text-score-mid'
  return 'text-score-low'
}

export function getScoreBgClass(score: number) {
  if (score >= 70) return 'bg-score-high'
  if (score >= 40) return 'bg-score-mid'
  return 'bg-score-low'
}

export function getScoreSolidBgClass(score: number) {
  if (score >= 70) return 'bg-[var(--score-high)]'
  if (score >= 40) return 'bg-[var(--score-mid)]'
  return 'bg-[var(--score-low)]'
}

export function formatDuration(seconds: number | null | undefined) {
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

export function computeInterviewStats(interview: InterviewSummaryData): InterviewStats {
  const topics = interview.topics || []
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

  return {
    overallPercentage,
    completedTopics,
    skippedTopics,
    bestScore,
    durationSeconds,
    totalStrengths,
    totalImprovements,
  }
}
