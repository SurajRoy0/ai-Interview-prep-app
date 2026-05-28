'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { ActionResult, success, failure } from '@/lib/action-result'
import { planGenerationQueue } from '@/lib/queues'
import { getUserActivePlanConfig } from '@repo/db'
import type { DifficultyProgression, InterviewType } from '@repo/db'

export async function createInterviewAction(
  jobProfileId: string,
  requestedDifficulty?: string,
  requestedType?: string
): Promise<ActionResult<{ interviewId: string }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')
    const userId = session.user.id

    const transactionResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      })
      if (!user) return failure('User not found', 'NOT_FOUND')

      const jobProfile = await tx.jobProfile.findUnique({
        where: { id: jobProfileId, userId },
        include: { activeResume: true },
      })

      if (!jobProfile) return failure('Job profile not found', 'NOT_FOUND')
      if (!jobProfile.activeResume) return failure('You must activate a resume before starting an interview.', 'BAD_REQUEST')

      const freeCredit = !user.freeInterviewUsed ? 1 : 0

      const grantsResult = await tx.interviewCredit.aggregate({
        where: {
          userId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        _sum: { credits: true },
      })
      const grantedCredits = grantsResult._sum.credits || 0

      const usedCredits = await tx.interview.count({
        where: {
          userId,
          status: { notIn: ['PENDING'] },
        },
      })

      const balance = freeCredit + grantedCredits - usedCredits

      if (balance <= 0) {
        return failure('You have no interview credits remaining. Please upgrade your plan or purchase more credits.', 'INSUFFICIENT_CREDITS')
      }

      if (!user.freeInterviewUsed) {
        await tx.user.update({
          where: { id: userId },
          data: { freeInterviewUsed: true },
        })
      }

      const planConfig = await getUserActivePlanConfig(userId)

      let difficulty: DifficultyProgression = planConfig.allowedDifficultyModes[0] || 'ADAPTIVE'
      if (requestedDifficulty && planConfig.allowedDifficultyModes.includes(requestedDifficulty as DifficultyProgression)) {
        difficulty = requestedDifficulty as DifficultyProgression
      }

      const type = (requestedType as InterviewType) || 'FULL'

      const interview = await tx.interview.create({
        data: {
          userId,
          jobProfileId,
          resumeId: jobProfile.activeResume.id,
          resumeSnapshot: jobProfile.activeResume.parsedData || {},
          planConfigSnapshot: planConfig,
          planConfigId: planConfig.id,
          difficultyProgression: difficulty,
          type,
          status: 'PENDING',
          planStatus: 'PENDING',
          totalQuestions: planConfig.targetTurns,
          maxPauseCount: planConfig.maxPauseCount,
        },
      })

      // We cannot enqueue inside the Prisma transaction because if it fails,
      // the queue job might still be fired. So we return the interview first.
      return success({ interviewId: interview.id })
    })

    if (!transactionResult.success) {
      return transactionResult
    }

    // Transaction succeeded, enqueue the plan generation job
    await planGenerationQueue.add(
      'generate-plan',
      { interviewId: transactionResult.data.interviewId },
      { removeOnComplete: true, attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
    )

    return transactionResult
  } catch (error) {
    console.error('[createInterviewAction]', error)
    return failure('Failed to create interview', 'INTERNAL_ERROR')
  }
}
