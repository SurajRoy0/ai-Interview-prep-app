import { redirect } from 'next/navigation'
import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { SummaryTabs } from '@/components/candidate/interview/summary-tabs'

export default async function InterviewRouterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
    include: {

      topics: {
        orderBy: { topicIndex: "asc" },
        include: { turns: { orderBy: { turnIndex: "asc" } } },
      },
    },
  })

  if (!interview) {
    redirect('/candidate/dashboard')
  }

  // 1. Smart Routing
  if (interview.status === 'PENDING') {
    redirect(`/candidate/interview/${id}/setup`)
  }

  if (interview.status === 'ACTIVE' || interview.status === 'PAUSED') {
    redirect(`/candidate/interview/${id}/session`)
  }

  // Post-Interview Dashboard (for COMPLETED or FAILED)
  return <SummaryTabs interviewId={id} initialInterview={interview} />
}
