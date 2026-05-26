'use server'

import { prisma, QuestionCategory, QuestionDifficulty, PsychologicalIntent, InputMode } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { createInterviewSchema } from '@repo/validators'
import { ActionResult, success, failure } from '@/lib/action-result'
import { z } from 'zod'
import { generateInterviewPlan, getGeminiModel, AI_MODELS, buildInterviewSystemPrompt, buildConversationHistory, parseAITurnResponse } from '@repo/ai'
import type { ResumeParsedData, InterviewPlan } from '@repo/shared'
import { streamText } from 'ai'
import { createStreamableValue } from '@ai-sdk/rsc'
import { reportQueue } from '@/lib/queues'

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

    // Generate Interview Plan (async but blocking creation for simplicity, or could be worker)
    const plan = await generateInterviewPlan({
      jobProfile: resume.jobProfile,
      resumeData: resume.parsedData as unknown as ResumeParsedData,
    })

    // Create interview record (NO CREDIT CONSUMED YET)
    const newInterview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        jobProfileId: resume.jobProfileId,
        resumeId: validatedData.resumeId,
        type: validatedData.type,
        status: 'PENDING',
        interviewPlan: plan,
        planGenerated: true,
      },
    })

    return success({ interviewId: newInterview.id })
  } catch (error) {
    console.error('[createInterviewAction]', error)
    return failure('Failed to create interview', 'INTERNAL_ERROR')
  }
}

export async function startInterviewAction(interviewId: string) {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { resume: true },
  })

  if (!interview) return failure('Interview not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')
  if (interview.status !== 'PENDING') return failure('Already started', 'INVALID_STATE')

  const stream = createStreamableValue('')

    ; (async () => {
      try {
        const plan = interview.interviewPlan as InterviewPlan | null
        const { textStream } = await streamText({
          model: getGeminiModel(AI_MODELS.GEMINI.FLASH),
          system: buildInterviewSystemPrompt({
            plan: plan!,
            parsedData: interview.resume.parsedData as unknown as ResumeParsedData,
            currentTurnIndex: 1,
            totalTurns: interview.totalQuestions,
          }),
          messages: [{ role: 'user', content: 'Hello, I am ready to start the interview.' }],
        })

        let fullText = ''
        for await (const delta of textStream) {
          fullText += delta
          stream.update(delta)
        }

        stream.done()

        const parsed = parseAITurnResponse(fullText)

        // Consume credit and set ACTIVE
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUniqueOrThrow({
            where: { id: session.user.id },
            include: { credits: { where: { credits: { gt: 0 } }, take: 1 } },
          })

          if (!user.freeInterviewUsed) {
            await tx.user.update({ where: { id: user.id }, data: { freeInterviewUsed: true } })
          } else if (user.credits.length > 0) {
            await tx.interviewCredit.update({
              where: { id: user.credits[0].id },
              data: { credits: { decrement: 1 } },
            })
          } else {
            throw new Error('No credits left')
          }

          await tx.interview.update({
            where: { id: interviewId },
            data: { status: 'ACTIVE', currentTurnIndex: 1, startedAt: new Date() },
          })

          await tx.interviewTurn.create({
            data: {
              interviewId,
              turnIndex: 1,
              role: 'AI',
              question: parsed.question,
              questionCategory: parsed.category as QuestionCategory,
              questionDifficulty: parsed.difficulty as QuestionDifficulty,
              psychologicalIntent: parsed.psychologicalIntent as PsychologicalIntent,
              targetSkills: parsed.targetSkills,
              inputMode: parsed.suggestedInputMode as InputMode,
              isFollowUp: parsed.isFollowUp,
              followUpReason: parsed.followUpReason,
            },
          })
        })

      } catch (err) {
        console.error(err)
        stream.error(err)
        await prisma.interview.update({
          where: { id: interviewId },
          data: { status: 'FAILED' },
        })
      }
    })()

  return success({ stream: stream.value })
}

const submitTurnSchema = z.object({
  interviewId: z.string(),
  answer: z.string(),
  inputMode: z.string(),
})

export type SubmitTurnInput = z.infer<typeof submitTurnSchema>

export async function submitTurnAction(input: SubmitTurnInput) {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const validated = submitTurnSchema.safeParse(input)
  if (!validated.success) return failure('Invalid input', 'INVALID_INPUT')

  const { interviewId, answer, inputMode } = validated.data

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { turns: { orderBy: { turnIndex: 'asc' } }, resume: true },
  })

  if (!interview) return failure('Interview not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')
  if (interview.status !== 'ACTIVE') return failure('Interview not active', 'INVALID_STATE')

  // Save candidate turn
  await prisma.interviewTurn.create({
    data: {
      interviewId,
      turnIndex: interview.currentTurnIndex + 1,
      role: 'USER',
      answer,
      inputMode: inputMode as InputMode,
    },
  })

  const isLastTurn = interview.currentTurnIndex + 1 >= interview.totalQuestions
  if (isLastTurn) {
    // Update completedAt but keep status ACTIVE so the worker will process it.
    await prisma.interview.update({
      where: { id: interviewId },
      data: { completedAt: new Date() }
    })
    // Kick off report worker
    await reportQueue.add('generate-report', { interviewId })
    return success({ isCompleted: true, stream: null, activityNext: false })
  }

  const plan = interview.interviewPlan as InterviewPlan | null
  const nextActivity = plan?.activities?.find(
    (a) => a.insertAfterTurn === interview.currentTurnIndex + 1
  )
  if (nextActivity) {
    return success({ isCompleted: false, stream: null, activityNext: true })
  }

  const stream = createStreamableValue('')

    ; (async () => {
      try {
        const conversationHistory = buildConversationHistory(
          interview.turns.map(t => ({
            role: t.role as 'AI' | 'USER',
            question: t.question,
            answer: t.answer
          })),
          answer
        )

        const { textStream } = await streamText({
          model: getGeminiModel(AI_MODELS.GEMINI.FLASH),
          system: buildInterviewSystemPrompt({
            plan: plan!,
            parsedData: interview.resume.parsedData as unknown as ResumeParsedData,
            currentTurnIndex: interview.currentTurnIndex + 1,
            totalTurns: interview.totalQuestions,
          }),
          messages: conversationHistory,
        })

        let fullText = ''
        for await (const delta of textStream) {
          fullText += delta
          stream.update(delta)
        }

        stream.done()

        const parsed = parseAITurnResponse(fullText)

        await prisma.interviewTurn.create({
          data: {
            interviewId,
            turnIndex: interview.currentTurnIndex + 2,
            role: 'AI',
            question: parsed.question,
            questionCategory: parsed.category as QuestionCategory,
            questionDifficulty: parsed.difficulty as QuestionDifficulty,
            psychologicalIntent: parsed.psychologicalIntent as PsychologicalIntent,
            targetSkills: parsed.targetSkills,
            inputMode: parsed.suggestedInputMode as InputMode,
            isFollowUp: parsed.isFollowUp,
            followUpReason: parsed.followUpReason,
            turnScore: parsed.previousAnswerScore,
            topicScored: parsed.topicScored,
          },
        })

        await prisma.interview.update({
          where: { id: interviewId },
          data: { currentTurnIndex: interview.currentTurnIndex + 2 },
        })

      } catch (err) {
        console.error(err)
        stream.error(err)
        await prisma.interview.update({
          where: { id: interviewId },
          data: { status: 'FAILED' },
        })
      }
    })()

  return success({ isCompleted: false, stream: stream.value, activityNext: false })
}

export async function recoverInterviewAction(interviewId: string) {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { turns: { orderBy: { turnIndex: 'asc' } } },
  })

  if (!interview) return failure('Interview not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')

  return success({
    status: interview.status,
    currentTurnIndex: interview.currentTurnIndex,
    turns: interview.turns.map(t => ({
      turnIndex: t.turnIndex,
      role: t.role.toLowerCase() as 'user' | 'ai',
      content: (t.role === 'AI' ? t.question : t.answer) ?? '',
      inputMode: t.inputMode ?? undefined,
    })),
  })
}

export async function getDeepgramTokenAction() {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  if (!process.env.DEEPGRAM_API_KEY) {
    return failure('Deepgram not configured', 'INTERNAL_ERROR')
  }

  const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'limited',
      time_to_live_in_seconds: 3600,
    }),
  })

  if (!response.ok) {
    return failure('Failed to get token', 'INTERNAL_ERROR')
  }

  const { key } = await response.json()
  return success({ token: key })
}

export async function retryReportAction(interviewId: string) {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId }
  })

  if (!interview) return failure('Interview not found', 'NOT_FOUND')
  if (interview.userId !== session.user.id) return failure('Forbidden', 'FORBIDDEN')

  // Set status back to ACTIVE so it shows loading spinner instead of FAILED
  await prisma.interview.update({
    where: { id: interviewId },
    data: { status: 'ACTIVE' }
  })

  await reportQueue.add('generate-report', { interviewId })

  return success(undefined)
}
