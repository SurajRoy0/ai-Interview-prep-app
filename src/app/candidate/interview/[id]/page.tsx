import { redirect } from 'next/navigation'
import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'

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
    select: { status: true },
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

  // 2. Post-Interview Dashboard (for COMPLETED or FAILED)
  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold">Interview Report</h1>
      <p className="text-muted-foreground font-mono bg-surface-1 p-4 rounded-xl border border-border/50">
        Status: {interview.status}
      </p>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p className="text-muted-foreground">
          Your interview is completed. The detailed report and transcript will be displayed here.
        </p>
      </div>
    </div>
  )
}
