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

    revalidatePath('/candidate/dashboard')
    revalidatePath('/candidate/job-profiles')

    return success({ id: profile.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure('Invalid data', 'VALIDATION_ERROR', error.flatten() as Record<string, unknown>)
    }
    console.error('[createJobProfileAction]', error)
    return failure('Failed to create job profile', 'INTERNAL_ERROR')
  }
}

export async function getJobProfilesAction(options?: {
  page?: number
  limit?: number
}): Promise<ActionResult<{ profiles: Awaited<ReturnType<typeof fetchProfiles>>; totalCount: number }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const page = options?.page
    const limit = options?.limit
    const where = { userId: session.user.id }

    const [profiles, totalCount] = await Promise.all([
      fetchProfiles(where, page, limit),
      prisma.jobProfile.count({ where }),
    ])

    return success({ profiles, totalCount })
  } catch (error) {
    console.error('[getJobProfilesAction]', error)
    return failure('Failed to load job profiles', 'INTERNAL_ERROR')
  }
}

async function fetchProfiles(
  where: { userId: string },
  page?: number,
  limit?: number
) {
  return prisma.jobProfile.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    ...(limit !== undefined ? { take: limit } : {}),
    ...(page !== undefined && limit !== undefined ? { skip: (page - 1) * limit } : {}),
    include: {
      activeResume: true,
      _count: {
        select: {
          interviews: true,
          resumes: true,
        },
      },
    },
  })
}

export async function getJobProfileByIdAction(
  id: string
): Promise<ActionResult<NonNullable<Awaited<ReturnType<typeof fetchProfileById>>>>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const profile = await fetchProfileById(id, session.user.id)
    if (!profile) return failure('Job profile not found', 'NOT_FOUND')

    return success(profile)
  } catch (error) {
    console.error('[getJobProfileByIdAction]', error)
    return failure('Failed to load job profile', 'INTERNAL_ERROR')
  }
}

async function fetchProfileById(id: string, userId: string) {
  return prisma.jobProfile.findUnique({
    where: { id, userId },
    include: {
      activeResume: true,
      interviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getJobProfileResumesAction(
  jobProfileId: string,
  page: number = 1,
  limit: number = 5
): Promise<ActionResult<{ resumes: Awaited<ReturnType<typeof fetchResumes>>; totalCount: number }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const where = {
      jobProfileId,
      jobProfile: { userId: session.user.id },
    }

    const skip = (page - 1) * limit
    const [resumes, totalCount] = await Promise.all([
      fetchResumes(where, skip, limit),
      prisma.resume.count({ where }),
    ])

    return success({ resumes, totalCount })
  } catch (error) {
    console.error('[getJobProfileResumesAction]', error)
    return failure('Failed to load resumes', 'INTERNAL_ERROR')
  }
}

async function fetchResumes(
  where: { jobProfileId: string; jobProfile: { userId: string } },
  skip: number,
  take: number
) {
  return prisma.resume.findMany({
    where,
    orderBy: { version: 'desc' },
    skip,
    take,
  })
}
