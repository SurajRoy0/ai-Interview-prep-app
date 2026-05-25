'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'

export async function getDashboardProfile() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      freeInterviewUsed: true,
      _count: {
        select: {
          interviews: true,
        },
      },
    },
  })

  const resumeCount = await prisma.resume.count({
    where: {
      jobProfile: {
        userId: session.user.id
      }
    }
  })

  return {
    ...user,
    _count: {
      ...user._count,
      resumes: resumeCount
    }
  }
}
