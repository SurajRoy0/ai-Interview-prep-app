'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'

import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/candidate/dashboard')
  return session
}

export const getAdminDashboardStatsAction = async () => {
  await requireAdmin()

  const [totalUsers, totalInterviews, completedInterviews, totalResumes] = await Promise.all([
    prisma.user.count(),
    prisma.interview.count(),
    prisma.interview.count({ where: { status: 'COMPLETED' } }),
    prisma.resume.count(),
  ])

  return { totalUsers, totalInterviews, completedInterviews, totalResumes }
}

export const getAdminUsersAction = async () => {
  await requireAdmin()
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export const getAdminConfigsAction = async () => {
  await requireAdmin()
  return await prisma.interviewConfig.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export const getAdminSubscriptionsAction = async () => {
  await requireAdmin()
  return await prisma.subscription.findMany({
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
