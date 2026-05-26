import { NextResponse } from 'next/server'
import { devOnlyGuard } from '@/lib/dev-guard'
import { prisma } from '@repo/db'

/**
 * GET /api/developer/interviews/[id]
 *
 * Returns full interview detail for development inspection:
 * interview metadata, plan, all turns, activities, report, analytics,
 * improvement suggestions, the frozen resume snapshot, and job profile.
 *
 * Development only.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = devOnlyGuard()
  if (guard) return guard

  const { id } = await params

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          freeInterviewUsed: true,
        },
      },
      jobProfile: {
        select: {
          id: true,
          title: true,
          targetRole: true,
          experienceLevel: true,
          ecosystem: true,
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
          version: true,
          parseStatus: true,
          ecosystem: true,
          parsedData: true,
          rawTextLength: true,
          createdAt: true,
        },
      },
      turns: {
        orderBy: { turnIndex: 'asc' },
        select: {
          id: true,
          turnIndex: true,
          role: true,
          question: true,
          answer: true,
          questionCategory: true,
          questionDifficulty: true,
          psychologicalIntent: true,
          targetSkills: true,
          inputMode: true,
          isFollowUp: true,
          followUpReason: true,
          turnScore: true,
          topicScored: true,
          hesitationDetected: true,
          silenceDurationMs: true,
          speechDurationMs: true,
          tokenUsage: true,
          latencyMs: true,
          createdAt: true,
        },
      },
      activities: {
        orderBy: { activityIndex: 'asc' },
        select: {
          id: true,
          activityIndex: true,
          type: true,
          title: true,
          prompt: true,
          codeSnippet: true,
          candidateVoiceAnswer: true,
          candidateCodeAnswer: true,
          candidateTextAnswer: true,
          score: true,
          evaluation: true,
          skillsEvaluated: true,
          skipped: true,
          startedAt: true,
          completedAt: true,
        },
      },
      report: true,
      analytics: true,
      suggestions: {
        orderBy: { priority: 'asc' },
        select: {
          id: true,
          topic: true,
          priority: true,
          title: true,
          description: true,
          learningPrompt: true,
          externalUrl: true,
          relatedTurnIds: true,
          dismissed: true,
        },
      },
    },
  })

  if (!interview) {
    return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 })
  }

  // Build a human-readable transcript alongside the raw turns
  const transcript = interview.turns
    .map((t) => {
      const speaker = t.role === 'AI' ? 'Interviewer' : 'Candidate'
      const content = t.role === 'AI' ? t.question : t.answer
      return `[Turn ${t.turnIndex}] ${speaker}: ${content ?? '(empty)'}`
    })
    .join('\n\n')

  // Aggregate per-turn scores for a quick overview
  const scoredTurns = interview.turns.filter((t) => t.turnScore != null)
  const avgTurnScore =
    scoredTurns.length > 0
      ? Math.round(scoredTurns.reduce((sum, t) => sum + (t.turnScore ?? 0), 0) / scoredTurns.length)
      : null

  return NextResponse.json({
    success: true,
    data: {
      interview: {
        id: interview.id,
        status: interview.status,
        type: interview.type,
        mode: interview.mode,
        interviewFormat: interview.interviewFormat,
        planGenerated: interview.planGenerated,
        totalQuestions: interview.totalQuestions,
        currentTurnIndex: interview.currentTurnIndex,
        activitiesCompleted: interview.activitiesCompleted,
        activitiesPlanned: interview.activitiesPlanned,
        durationSeconds: interview.durationSeconds,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
        scores: {
          overall: interview.overallScore,
          technical: interview.technicalScore,
          communication: interview.communicationScore,
          confidence: interview.confidenceScore,
          authenticity: interview.authenticityScore,
        },
        feedback: interview.feedback,
        strongTopics: interview.strongTopics,
        weakTopics: interview.weakTopics,
      },
      user: interview.user,
      jobProfile: interview.jobProfile,
      resume: interview.resume,
      plan: interview.interviewPlan,
      turns: interview.turns,
      activities: interview.activities,
      report: interview.report,
      analytics: interview.analytics,
      suggestions: interview.suggestions,
      _derived: {
        transcript,
        totalTurns: interview.turns.length,
        aiTurns: interview.turns.filter((t) => t.role === 'AI').length,
        userTurns: interview.turns.filter((t) => t.role === 'USER').length,
        avgTurnScore,
        followUpCount: interview.turns.filter((t) => t.isFollowUp).length,
        hasReport: interview.report != null,
        hasAnalytics: interview.analytics != null,
        suggestionCount: interview.suggestions.length,
      },
    },
  })
}
