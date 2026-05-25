import { prisma } from '@repo/db'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { StartInterviewForm } from './start-form'

interface PageProps {
  params: Promise<{ resumeId: string }>
}

export default async function ReadyPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user) return notFound()

  const { resumeId } = await params

  const resume = await prisma.resume.findUnique({
    where: { 
      id: resumeId,
      jobProfile: { userId: session.user.id } // Security check
    },
    include: {
      jobProfile: true
    }
  })

  if (!resume) return notFound()

  return (
    <div className="container py-24 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Interview Sandbox</h1>
          <p className="text-muted-foreground mt-2">
            Your environment is ready. Prepare to be tested.
          </p>
        </div>
        
        <StartInterviewForm 
          resumeId={resume.id}
          jobProfileId={resume.jobProfileId}
          targetRole={resume.jobProfile.targetRole}
          experienceLevel={resume.jobProfile.experienceLevel}
        />
      </div>
    </div>
  )
}
