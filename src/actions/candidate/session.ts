'use server'

import { getSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { TurnRole, TurnType } from '@repo/db/enums'
import { success, failure, type ActionResult } from '@/lib/action-result'

export async function saveTurn(data: {
  interviewId: string
  questionId: string
  role: TurnRole
  turnType: TurnType
  content: string
  timeUsedSeconds?: number
}): Promise<ActionResult<{ turnId: string }>> {
  try {
    const session = await getSession()

    if (!session?.user) {
      return failure('Unauthorized', 'UNAUTHORIZED')
    }

    // Verify ownership
    const interview = await prisma.interview.findUnique({
      where: { id: data.interviewId, userId: session.user.id }
    })

    if (!interview) {
      return failure('Interview not found', 'NOT_FOUND')
    }

    // Get current max turnIndex for this question
    const lastTurn = await prisma.interviewTurn.findFirst({
      where: { interviewQuestionId: data.questionId },
      orderBy: { turnIndex: 'desc' }
    })

    const nextIndex = lastTurn ? lastTurn.turnIndex + 1 : 0

    const turn = await prisma.interviewTurn.create({
      data: {
        interviewId: data.interviewId,
        interviewQuestionId: data.questionId,
        role: data.role,
        turnType: data.turnType,
        content: data.content,
        turnIndex: nextIndex,
        timeUsedSeconds: data.timeUsedSeconds
      }
    })

    return success({ turnId: turn.id })
  } catch (error) {
    console.error('[saveTurn]', error)
    return failure('Failed to save turn', 'INTERNAL_ERROR')
  }
}

export async function closeTopicAndStartNext(interviewId: string, currentQuestionId: string): Promise<ActionResult<{ isComplete: boolean; nextQuestionId?: string }>> {
  try {
    const session = await getSession()

    if (!session?.user) {
      return failure('Unauthorized', 'UNAUTHORIZED')
    }

    // Transaction to safely advance
    const result = await prisma.$transaction(async (tx) => {
      // 1. Close current question
      await tx.interviewQuestion.update({
        where: { id: currentQuestionId, interviewId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closeReason: 'USER_ADVANCED' // Or AI_ADVANCED depending on trigger
        }
      })

      // 2. Find next question
      const currentQ = await tx.interviewQuestion.findUniqueOrThrow({ where: { id: currentQuestionId } })
      
      const nextQ = await tx.interviewQuestion.findFirst({
        where: { 
          interviewId, 
          questionIndex: { gt: currentQ.questionIndex },
          status: 'PENDING'
        },
        orderBy: { questionIndex: 'asc' }
      })

      if (!nextQ) {
        // Interview is over!
        await tx.interview.update({
          where: { id: interviewId },
          data: { status: 'COMPLETED', completedAt: new Date() }
        })
        return { isComplete: true }
      }

      // 3. Mark next question as ACTIVE
      await tx.interviewQuestion.update({
        where: { id: nextQ.id },
        data: { status: 'ACTIVE', startedAt: new Date() }
      })

      await tx.interview.update({
        where: { id: interviewId },
        data: { currentQuestionIndex: nextQ.questionIndex }
      })

      return { isComplete: false, nextQuestionId: nextQ.id }
    })

    // Here we could potentially fire off a BullMQ job to judge the closed topic async!
    
    return success(result)
  } catch (error) {
    console.error('[closeTopicAndStartNext]', error)
    return failure('Failed to advance topic', 'INTERNAL_ERROR')
  }
}

export async function syncTimer(questionId: string, elapsedSeconds: number): Promise<ActionResult<boolean>> {
  try {
    const session = await getSession()
    if (!session?.user) return failure('Unauthorized', 'UNAUTHORIZED')

    await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { elapsedSeconds }
    })

    return success(true)
  } catch (error) {
    console.error('[syncTimer]', error)
    return failure('Failed to sync timer', 'INTERNAL_ERROR')
  }
}

export async function pauseInterview(interviewId: string): Promise<ActionResult<boolean>> {
  try {
    const session = await getSession()
    if (!session?.user) return failure('Unauthorized', 'UNAUTHORIZED')

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id }
    })

    if (!interview) return failure('Interview not found', 'NOT_FOUND')
    
    // Check if max pauses reached
    const config = interview.planConfigSnapshot as any
    const maxPauses = config.maxPauseCount || 2

    if (interview.pauseCount! >= maxPauses) {
      return failure('Maximum pause limit reached', 'FORBIDDEN')
    }

    // Increment pause count
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        pauseCount: (interview.pauseCount || 0) + 1,
        pausedAt: new Date()
      }
    })

    return success(true)
  } catch (error) {
    console.error('[pauseInterview]', error)
    return failure('Failed to pause interview', 'INTERNAL_ERROR')
  }
}

export async function endInterviewEarly(interviewId: string, currentQuestionId: string): Promise<ActionResult<boolean>> {
  try {
    const session = await getSession()
    if (!session?.user) return failure('Unauthorized', 'UNAUTHORIZED')

    await prisma.$transaction(async (tx) => {
      await tx.interviewQuestion.update({
        where: { id: currentQuestionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closeReason: 'USER_ADVANCED'
        }
      })
      await tx.interview.update({
        where: { id: interviewId },
        data: { status: 'COMPLETED', completedAt: new Date() }
      })
    })

    return success(true)
  } catch (error) {
    console.error('[endInterviewEarly]', error)
    return failure('Failed to end interview', 'INTERNAL_ERROR')
  }
}
