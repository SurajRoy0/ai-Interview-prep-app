import { NextResponse } from 'next/server'
import { devOnlyGuard } from '@/lib/dev-guard'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const guard = devOnlyGuard()
  if (guard) return guard

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "InterviewTurn",
      "SkillScore",
      "InterviewAnalytics",
      "Interview",
      "Resume",
      "InterviewCredit",
      "Payment",
      "Subscription",
      "AuditLog",
      "RecruiterProfile",
      "AuthSession",
      "Account",
      "Verification",
      "FeatureFlag",
      "User"
    RESTART IDENTITY CASCADE
  `)

  return NextResponse.json({
    success: true,
    data: {
      message: 'Database reset complete. Run POST /api/seed to create the admin user.',
    },
  })
}
