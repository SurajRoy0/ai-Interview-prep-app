'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { createInterviewSchema } from '@repo/validators'
import { ActionResult, success, failure } from '@/lib/action-result'
import { reportQueue } from '@/lib/queues'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function createInterviewAction(
  formData: unknown
): Promise<ActionResult<{ interviewId: string }>> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

    let validatedData: z.infer<typeof createInterviewSchema>
    try {
      validatedData = createInterviewSchema.parse(formData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return failure('Invalid data', 'VALIDATION_ERROR', err.flatten() as Record<string, unknown>)
      }
      throw err
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        credits: {
          where: { credits: { gt: 0 } },
          take: 1,
        },
      },
    })

    if (!user) return failure('User not found', 'NOT_FOUND')

    const hasFreeInterview = !user.freeInterviewUsed
    const hasPaidCredits = user.credits.length > 0

    if (!hasFreeInterview && !hasPaidCredits) {
      return failure('Insufficient credits', 'INSUFFICIENT_CREDITS')
    }

    // Verify resume belongs to this user's job profile
    const resume = await prisma.resume.findUnique({
      where: { id: validatedData.resumeId },
      include: { jobProfile: true },
    })

    if (!resume) return failure('Resume not found', 'NOT_FOUND')
    if (resume.jobProfile.userId !== session.user.id) {
      return failure('Forbidden', 'FORBIDDEN')
    }

    const newInterview = await prisma.$transaction(async (tx) => {
      if (hasFreeInterview) {
        await tx.user.update({
          where: { id: user.id },
          data: { freeInterviewUsed: true },
        })
      } else {
        await tx.interviewCredit.update({
          where: { id: user.credits[0].id },
          data: { credits: { decrement: 1 } },
        })
      }

      return tx.interview.create({
        data: {
          userId: session.user.id,
          jobProfileId: resume.jobProfileId,
          resumeId: validatedData.resumeId,
          type: validatedData.type,
          status: 'PENDING',
        },
      })
    })

    revalidatePath('/dashboard')

    return success({ interviewId: newInterview.id })
  } catch (error) {
    console.error('[createInterviewAction]', error)
    return failure('Failed to create interview', 'INTERNAL_ERROR')
  }
}

export async function endInterviewAction(
  interviewId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
    })

    if (!interview) return failure('Interview not found', 'NOT_FOUND')

    if (interview.status === 'COMPLETED') return success(undefined)

    await prisma.interview.update({
      where: { id: interviewId },
      data: { completedAt: new Date() },
    })

    await reportQueue.add(
      'generate-report',
      { interviewId },
      { jobId: interviewId, removeOnComplete: true, removeOnFail: false }
    )

    return success(undefined)
  } catch (error) {
    console.error('[endInterviewAction]', error)
    return failure('Failed to end interview', 'INTERNAL_ERROR')
  }
}

export async function retryReportAction(
  interviewId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
    })

    if (!interview) return failure('Interview not found', 'NOT_FOUND')

    if (interview.status === 'COMPLETED') return success(undefined)

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED' }, // Ensure status allows worker to pick it up or at least clear FAILED
    })

    await reportQueue.add(
      'generate-report',
      { interviewId },
      { jobId: interviewId, removeOnComplete: true, removeOnFail: false }
    )

    revalidatePath(`/interview/${interviewId}`)

    return success(undefined)
  } catch (error) {
    console.error('[retryReportAction]', error)
    return failure('Failed to retry report', 'INTERNAL_ERROR')
  }
}
