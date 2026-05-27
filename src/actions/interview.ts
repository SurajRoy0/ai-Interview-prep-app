'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { ActionResult, success, failure } from '@/lib/action-result'
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

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch User
      const user = await tx.user.findUnique({
        where: { id: userId }
      })
      if (!user) return failure('User not found', 'NOT_FOUND')

      // 2. Fetch Job Profile and Active Resume
      const jobProfile = await tx.jobProfile.findUnique({
        where: { id: jobProfileId, userId },
        include: { activeResume: true }
      })

      if (!jobProfile) return failure('Job profile not found', 'NOT_FOUND')
      if (!jobProfile.activeResume) return failure('You must activate a resume before starting an interview.', 'BAD_REQUEST')

      // 3. Compute Credits
      const freeCredit = !user.freeInterviewUsed ? 1 : 0

      const grantsResult = await tx.interviewCredit.aggregate({
        where: {
          userId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
        },
        _sum: { credits: true }
      })
      const grantedCredits = grantsResult._sum.credits || 0

      const usedCredits = await tx.interview.count({
        where: {
          userId,
          status: { notIn: ['PENDING'] }
        }
      })

      const balance = freeCredit + grantedCredits - usedCredits

      if (balance <= 0) {
        return failure('You have no interview credits remaining. Please upgrade your plan or purchase more credits.', 'INSUFFICIENT_CREDITS')
      }

      // 4. Update free interview state if they used it
      if (!user.freeInterviewUsed) {
        await tx.user.update({
          where: { id: userId },
          data: { freeInterviewUsed: true }
        })
      }

      // 5. Fetch PlanConfig securely
      const planConfig = await getUserActivePlanConfig(userId)

      // 6. Validate Difficulty Progression
      let difficulty: DifficultyProgression = planConfig.allowedDifficultyModes[0] || 'ADAPTIVE'
      if (requestedDifficulty && planConfig.allowedDifficultyModes.includes(requestedDifficulty as DifficultyProgression)) {
        difficulty = requestedDifficulty as DifficultyProgression
      }

      // 7. Determine Interview Type
      const type = (requestedType as InterviewType) || 'FULL'

      // 8. Create Interview in PENDING state
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
          totalQuestions: planConfig.targetTurns,
          maxPauseCount: planConfig.maxPauseCount
        }
      })

      return success({ interviewId: interview.id })
    })

  } catch (error) {
    console.error('[createInterviewAction]', error)
    return failure('Failed to create interview', 'INTERNAL_ERROR')
  }
}
