'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { createJobProfileSchema } from '@repo/validators'
import { ActionResult, success, failure } from '@/lib/action-result'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function createJobProfileAction(
  data: z.infer<typeof createJobProfileSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const parsed = createJobProfileSchema.parse(data)

    const profile = await prisma.jobProfile.create({
      data: {
        userId: session.user.id,
        title: parsed.title,
        targetRole: parsed.targetRole,
        description: parsed.description,
        experienceLevel: parsed.experienceLevel,
        ecosystem: parsed.ecosystem,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/profile')

    return success({ id: profile.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure('Invalid data', 'VALIDATION_ERROR', error.flatten())
    }
    console.error('[createJobProfileAction]', error)
    return failure('Failed to create job profile', 'INTERNAL_ERROR')
  }
}

export async function getJobProfilesAction() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const profiles = await prisma.jobProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      activeResume: true,
      _count: {
        select: {
          interviews: true,
          resumes: true,
        }
      }
    }
  })

  return profiles
}

export async function getJobProfileByIdAction(id: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const profile = await prisma.jobProfile.findUnique({
    where: { id, userId: session.user.id },
    include: {
      activeResume: true,
      resumes: {
        orderBy: { createdAt: 'desc' }
      },
      interviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!profile) throw new Error('Job profile not found')
  return profile
}
