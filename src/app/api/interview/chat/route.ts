import { streamInterviewTurn, type ResumeInterviewContext } from '@repo/ai'
import { type ModelMessage, convertToCoreMessages } from 'ai'
import { getSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { NextResponse } from 'next/server'
import type { ResumeParsedData } from '@repo/shared'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { messages: rawMessages, interviewId, code, language } = await req.json()

  if (!interviewId) {
    return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 })
  }

  // Verify interview ownership and load resume context in one query
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId, userId: session.user.id },
    include: {
      resume: {
        select: { parsedData: true },
      },
      jobProfile: {
        select: { targetRole: true, experienceLevel: true },
      },
    },
  })

  if (!interview) {
    return new NextResponse('Interview not found or access denied', { status: 403 })
  }

  // Build resume context for the AI system prompt
  let resumeContext: ResumeInterviewContext | undefined
  const parsedData = interview.resume?.parsedData as ResumeParsedData | null

  if (parsedData && interview.jobProfile) {
    resumeContext = {
      targetRole: interview.jobProfile.targetRole,
      experienceLevel: interview.jobProfile.experienceLevel,
      basics: parsedData.basics,
      skills: parsedData.skills,
      experience: parsedData.experience,
    }
  }

  const messages = convertToCoreMessages(rawMessages) as ModelMessage[]

  // Get the next sequential turnIndex from the DB to avoid collisions on retry
  const existingTurnCount = await prisma.interviewTurn.count({
    where: { interviewId },
  })

  const result = await streamInterviewTurn(
    messages,
    {
      codeContext: code && code.trim() !== '' ? { code, language } : undefined,
      resumeContext,
    },
    async ({ text }) => {
      const userMessage = messages[messages.length - 1]
      try {
        await prisma.$transaction([
          prisma.interviewTurn.create({
            data: {
              interviewId,
              turnIndex: existingTurnCount,
              role: 'USER',
              answer: String((userMessage as { content: string }).content ?? ''),
              inputMode: 'TEXT',
            },
          }),
          prisma.interviewTurn.create({
            data: {
              interviewId,
              turnIndex: existingTurnCount + 1,
              role: 'AI',
              question: text,
              inputMode: 'TEXT',
            },
          }),
        ])

        // Mark the interview as ACTIVE on first real turn
        if (interview.status === 'PENDING') {
          await prisma.interview.update({
            where: { id: interviewId },
            data: { status: 'ACTIVE' },
          })
        }
      } catch (err) {
        console.error('[chat/route] Failed to save turn to DB:', err)
      }
    }
  )

  return result.toTextStreamResponse()
}
