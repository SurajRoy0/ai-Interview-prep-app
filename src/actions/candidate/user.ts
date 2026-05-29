'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { cache } from 'react'
import { redirect } from 'next/navigation'

export const getTotalCreditsAction = cache(async () => {
  const session = await getSession()
  if (!session) return 0

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      joiningBonusGranted: true,
      credits: {
        select: {
          amount: true,
        },
      },
    },
  })

  if (!user) return 0

  return user.credits.reduce((acc, c) => acc + c.amount, 0)
})

export const getDashboardStatsAction = async () => {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const [interviewsCount, resumeCount] = await Promise.all([
    prisma.interview.count({
      where: { userId: session.user.id },
    }),
    prisma.resume.count({
      where: {
        jobProfile: { userId: session.user.id },
      },
    }),
  ])

  return {
    interviewsCount,
    resumeCount,
  }
}
