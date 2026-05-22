import { requireSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfileDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  const { id } = await params
  
  const profile = await prisma.jobProfile.findUnique({
    where: { id },
    include: {
      resume: true,
      atsReport: true,
      interviews: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!profile || profile.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Mesh Gradients Background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <ProfileClient profile={profile} />
      </div>
    </div>
  )
}
