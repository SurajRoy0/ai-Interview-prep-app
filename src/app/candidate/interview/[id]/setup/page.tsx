import { getSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { prisma } from '@repo/db'
import { SetupPoller } from '@/components/candidate/interview/setup-poller'

export default async function InterviewSetupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
    select: {
      planStatus: true,
      planGenerated: true,
      status: true,
    }
  })

  if (!interview) {
    redirect('/candidate/dashboard')
  }

  if (interview.status !== 'PENDING') {
    redirect(`/candidate/interview/${id}`)
  }

  return (
    <div className="flex flex-col min-h-[60vh] max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Interview Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          We are preparing your personalized interview environment. Please complete the equipment check while you wait.
        </p>
      </div>

      <SetupPoller 
        interviewId={id} 
        initialPlanStatus={interview.planStatus} 
        initialPlanGenerated={interview.planGenerated} 
      />
    </div>
  )
}
