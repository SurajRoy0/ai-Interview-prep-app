'use server'

import type { InterviewPlan } from '@repo/shared'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { ActionResult, success, failure } from '@/lib/action-result'
import { generateObject } from 'ai'
import { getOpenAiModel, AI_MODELS, buildActivityPrompt } from '@repo/ai'
import { activityResponseSchema, type ActivityResponseData } from '@repo/validators'

export type { ActivityResponseData }

export async function startActivityAction(interviewId: string): Promise<ActionResult<{ activity: ActivityResponseData }>> {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { resume: { include: { jobProfile: true } }, turns: true }
  })

  if (!interview) return failure('Not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')

  const plan = interview.interviewPlan as InterviewPlan | null
  const nextActivityDef = plan?.activities?.find(
    (a) => a.insertAfterTurn === interview.currentTurnIndex
  )

  if (!nextActivityDef) {
    return failure('No activity planned for this turn', 'INVALID_STATE')
  }

  try {
    const candidateHistory = interview.turns.map(t => `${t.role}: ${t.role === 'AI' ? t.question : t.answer}`).join('\n')

    const { object } = await generateObject({
      model: getOpenAiModel(AI_MODELS.OPENAI.MINI),
      schema: activityResponseSchema,
      prompt: buildActivityPrompt({
        activityType: nextActivityDef.type,
        targetRole: interview.resume.jobProfile.targetRole,
        ecosystem: interview.resume.jobProfile.ecosystem ?? 'Unknown',
        candidateHistory,
      })
    })

    return success({
      activity: {
        ...object,
        activityId: nextActivityDef.type,
        type: nextActivityDef.type
      }
    })
  } catch (err) {
    console.error(err)
    return failure('Failed to generate activity', 'INTERNAL_ERROR')
  }
}

export async function submitActivityAction(interviewId: string, answer: string): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId }
  })

  if (!interview) return failure('Not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')

  try {
    await prisma.interviewTurn.create({
      data: {
        interviewId,
        turnIndex: interview.currentTurnIndex + 1,
        role: 'USER',
        answer,
        inputMode: 'CODE_EDITOR',
      }
    })

    await prisma.interview.update({
      where: { id: interviewId },
      data: { currentTurnIndex: interview.currentTurnIndex + 1 }
    })

    return success(undefined)
  } catch (err) {
    console.error('[submitActivityAction]', err)
    return failure('Failed to submit activity', 'INTERNAL_ERROR')
  }
}
