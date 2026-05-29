import { notFound, redirect } from 'next/navigation'
import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { UIMessage } from 'ai'
import { LiveSessionClient } from './_components/live-session-client'

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getSession()
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Fetch Interview
  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!interview) {
    notFound()
  }

  if (interview.status === 'COMPLETED') {
    redirect(`/candidate/interview/${id}`)
  }

  // Fetch the ACTIVE question, or the first PENDING question if none are active
  let activeQuestion = await prisma.interviewQuestion.findFirst({
    where: { interviewId: id, status: 'ACTIVE' },
  })

  if (!activeQuestion) {
    // If no active question, try to find the next pending one (e.g. index 0)
    activeQuestion = await prisma.interviewQuestion.findFirst({
      where: { interviewId: id, status: 'PENDING' },
      orderBy: { questionIndex: 'asc' },
    })

    // If there's a pending question, mark it ACTIVE immediately to start the session
    if (activeQuestion) {
      activeQuestion = await prisma.interviewQuestion.update({
        where: { id: activeQuestion.id },
        data: { status: 'ACTIVE', startedAt: new Date() },
      })

      // Also update interview currentQuestionIndex
      await prisma.interview.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentQuestionIndex: activeQuestion.questionIndex
        }
      })
    }
  }

  if (!activeQuestion) {
    // If there are no ACTIVE and no PENDING questions, the interview must be finished.
    await prisma.interview.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
    redirect(`/candidate/interview/${id}`)
  }
  // Fetch existing turns to populate chat on refresh
  const existingTurns = await prisma.interviewTurn.findMany({
    where: { interviewQuestionId: activeQuestion.id },
    orderBy: { createdAt: 'asc' },
  })

  // Format turns for AI SDK v5 UIMessage format
  const initialMessages: UIMessage[] = existingTurns.map((turn) => ({
    id: turn.id,
    role: turn.role.toLowerCase() as 'user' | 'assistant',
    parts: [{ type: 'text', text: turn.content || '' }],
  }))

  const config = interview.planConfigSnapshot as any
  const maxPauseCount = config.maxPauseCount || 2
  const currentPauseCount = interview.pauseCount || 0

  return (
    <LiveSessionClient
      interviewId={interview.id}
      initialQuestionId={activeQuestion.id}
      questionIndex={activeQuestion.questionIndex}
      totalQuestions={interview.totalQuestions}
      timeAllocated={Math.max(0, activeQuestion.timeLimitSeconds - (activeQuestion.elapsedSeconds || 0))}
      initialMessages={initialMessages}
      maxPauseCount={maxPauseCount}
      currentPauseCount={currentPauseCount}
    />
  )
}
