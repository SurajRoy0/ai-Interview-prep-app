'use server'

import { requireSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { atsQueue } from '@/lib/queues'
import { ok, fail } from '@/lib/action-result'

export async function requestAtsScoreAction(jobProfileId: string) {
  const session = await requireSession()

  const profile = await prisma.jobProfile.findUnique({
    where: { id: jobProfileId },
    include: { resume: true }
  })

  if (!profile || profile.userId !== session.user.id) return fail('NOT_FOUND')
  if (!profile.resumeId || profile.resume?.parseStatus !== 'DONE') {
    return fail('RESUME_NOT_READY')
  }

  // Update ATS Report status to PENDING
  await prisma.aTSReport.upsert({
    where: { jobProfileId },
    update: { status: 'PENDING' },
    create: {
      jobProfileId,
      userId: session.user.id,
      resumeId: profile.resumeId,
      status: 'PENDING'
    }
  })

  // Enqueue ATS Worker
  await atsQueue.add(
    'generate',
    { jobProfileId },
    {
      jobId: `ats-generate-${jobProfileId}-${Date.now()}`, // Allow multiple runs
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    }
  )

  return ok({ jobProfileId })
}
