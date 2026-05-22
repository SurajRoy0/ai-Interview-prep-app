'use server'

import { requireSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { ok, fail } from '@/lib/action-result'
import { createProfileSchema, type CreateProfileInput } from '@repo/validators'

export async function createJobProfileAction(input: CreateProfileInput) {
  const session = await requireSession()

  const validated = createProfileSchema.safeParse(input)
  if (!validated.success) return fail('INVALID_INPUT')

  const { title, targetRole, experienceLevel, ecosystem } = validated.data

  const profile = await prisma.jobProfile.create({
    data: {
      userId: session.user.id,
      title,
      targetRole,
      experienceLevel,
      ecosystem,
    },
  })

  return ok({ jobProfileId: profile.id })
}

export async function getJobProfilesAction() {
  const session = await requireSession()

  const profiles = await prisma.jobProfile.findMany({
    where: { userId: session.user.id },
    include: {
      resume: true,
      atsReport: true,
      _count: {
        select: { interviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return ok(profiles)
}

export async function getJobProfileStatusAction(jobProfileId: string) {
  const session = await requireSession()

  const profile = await prisma.jobProfile.findUnique({
    where: { id: jobProfileId },
    include: { atsReport: true, resume: true },
  })

  if (!profile || profile.userId !== session.user.id) return fail('NOT_FOUND')

  return ok({
    parseStatus: profile.resume?.parseStatus ?? 'PENDING',
    parsedData: profile.resume?.parseStatus === 'DONE' ? profile.resume.parsedData : null,
    atsStatus: profile.atsReport?.status ?? 'PENDING',
    atsScore: profile.atsReport?.overallScore ?? null,
  })
}
