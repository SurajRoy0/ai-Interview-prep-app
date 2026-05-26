import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { PreInterviewScreen } from './_components/PreInterviewScreen'
import { ActiveInterview } from './_components/ActiveInterview'
import { CompletedScreen } from './_components/CompletedScreen'
import { FailedScreen } from './_components/FailedScreen'
import { CancelledScreen } from './_components/CancelledScreen'
import { AntiCheatWrapper } from '@/components/interview/AntiCheatWrapper'
import { ANTI_CHEAT } from '@/lib/constants'

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const interview = await prisma.interview.findUnique({
    where: { id },
  })

  if (!interview) {
    return <div className="p-8 text-center">Interview not found.</div>
  }

  if (interview.userId !== session.user.id) {
    return <div className="p-8 text-center text-red-500">Forbidden.</div>
  }

  switch (interview.status) {
    case 'PENDING':
      return <PreInterviewScreen interviewId={interview.id} />
    case 'ACTIVE':
      return ANTI_CHEAT ? (
        <AntiCheatWrapper>
          <ActiveInterview interviewId={interview.id} />
        </AntiCheatWrapper>
      ) : (
        <ActiveInterview interviewId={interview.id} />
      )
    case 'COMPLETED':
      return <CompletedScreen interviewId={interview.id} />
    case 'FAILED':
      return <FailedScreen interviewId={interview.id} />
    case 'CANCELLED':
      return <CancelledScreen interviewId={interview.id} />
    default:
      return <div>Unknown status: {interview.status}</div>
  }
}
