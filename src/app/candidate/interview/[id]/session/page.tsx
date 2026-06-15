import { SessionEngine } from '@/components/candidate/interview/session-engine'
import { requireSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { redirect } from 'next/navigation'

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, session] = await Promise.all([params, requireSession()])

  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
    select: { status: true }
  })

  if (!interview) {
    redirect('/candidate/dashboard')
  }

  if (interview.status === 'COMPLETED' || interview.status === 'FAILED') {
    redirect(`/candidate/interview/${id}`)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden">
      <SessionEngine interviewId={id} session={session} />
    </div>
  )
}

