'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { ActionResult, success, failure } from '@/lib/action-result'
import { JobStatus, InterviewStatus } from '@repo/db'

import { planGenerationQueue } from '@/lib/queues'

export type InterviewPlanStatusResponse = {
  planStatus: JobStatus
  planError: string | null
  status: InterviewStatus
  planGenerated: boolean
}

export async function getInterviewPlanStatusAction(interviewId: string): Promise<ActionResult<InterviewPlanStatusResponse>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
        userId: session.user.id, // Ensure ownership
      },
      select: {
        planStatus: true,
        planError: true,
        status: true,
        planGenerated: true,
      },
    })

    if (!interview) {
      return failure('Interview not found', 'NOT_FOUND')
    }

    return success({
      planStatus: interview.planStatus,
      planError: interview.planError,
      status: interview.status,
      planGenerated: interview.planGenerated,
    })
  } catch (error) {
    console.error('[getInterviewPlanStatusAction]', error)
    return failure('Internal server error', 'INTERNAL_ERROR')
  }
}

export async function retryInterviewPlanGenerationAction(interviewId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const transactionResult = await prisma.$transaction(async (tx) => {
      const interview = await tx.interview.findUnique({
        where: { id: interviewId, userId: session.user.id }
      })

      if (!interview) return failure('Interview not found', 'NOT_FOUND')
      if (interview.planGenerated) return failure('Plan is already generated', 'BAD_REQUEST')

      // Update status to pending
      await tx.interview.update({
        where: { id: interview.id },
        data: {
          planStatus: 'PENDING',
          planError: null
        }
      })

      return success({ success: true, interviewId: interview.id })
    })

    if (!transactionResult.success) {
      return transactionResult
    }

    await planGenerationQueue.add(
      'generate-plan',
      { interviewId: transactionResult.data.interviewId },
      { removeOnComplete: true, attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
    )

    return success({ success: true })
  } catch (error) {
    console.error('[retryInterviewPlanGenerationAction]', error)
    return failure('Failed to retry', 'INTERNAL_ERROR')
  }
}
