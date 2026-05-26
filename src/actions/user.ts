'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { cache } from 'react'

export const getTotalCreditsAction = cache(async () => {
  const session = await getSession()
  if (!session) return 0

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      freeInterviewUsed: true,
      credits: {
        select: {
          credits: true
        }
      }
    },
  })

  if (!user) return 0

  return (
    (user.freeInterviewUsed ? 0 : 1) + 
    user.credits.reduce((acc, c) => acc + c.credits, 0)
  )
})

export const getDashboardStatsAction = async () => {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  const [interviewsCount, resumeCount] = await Promise.all([
    prisma.interview.count({
      where: { userId: session.user.id }
    }),
    prisma.resume.count({
      where: {
        jobProfile: { userId: session.user.id }
      }
    })
  ])

  return {
    interviewsCount,
    resumeCount
  }
}
