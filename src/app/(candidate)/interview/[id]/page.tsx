import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { AntiCheatWrapper } from '@/components/interview/AntiCheatWrapper'
import { InterviewRoomClient } from './room-client'
import { UIMessage } from '@ai-sdk/react'

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) return notFound()

  const { id } = await params

  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
    include: {
      turns: {
        orderBy: { turnIndex: 'asc' }
      }
    }
  })

  if (!interview) return notFound()

  // Reconstruct AI SDK messages format from database
  const initialMessages = interview.turns.map((turn) => {
    const text = turn.role === 'USER' ? (turn.answer || '') : (turn.question || '')
    return {
      id: turn.id,
      role: turn.role === 'USER' ? 'user' : 'assistant',
      content: text,
      parts: [{ type: 'text', text }]
    }
  }) as UIMessage[]

  return (
    <AntiCheatWrapper>
      <InterviewRoomClient interviewId={interview.id} initialMessages={initialMessages} />
    </AntiCheatWrapper>
  )
}
