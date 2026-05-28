import { NextResponse } from 'next/server'
import { devOnlyGuard } from '@/lib/dev-guard'
import { prisma } from '@repo/db'

export const runtime = 'nodejs'

function isDatabaseUnreachable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code) : ''
  return code === 'ECONNREFUSED' || code === 'P1001'
}

export async function POST() {
  const guard = devOnlyGuard()
  if (guard) return guard

  try {
    // Child tables first; CASCADE handles any remaining FK dependencies.
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "ImprovementSuggestion",
        "InterviewReport",
        "InterviewQuestion",
        "InterviewTurn",
        "InterviewAnalytics",
        "Interview",
        "JobProfile",
        "Resume",
        "InterviewCredit",
        "Payment",
        "Subscription",
        "AuditLog",
        "AuthSession",
        "Account",
        "Verification",
        "FeatureFlag",
        "PlanConfig",
        "Plan",
        "User"
      RESTART IDENTITY CASCADE
    `)
  } catch (error) {
    if (isDatabaseUnreachable(error)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message:
              'Cannot connect to PostgreSQL. Start the database with `pnpm db:up`, ensure DATABASE_URL uses port 5433 (see .env.example), then restart `pnpm dev`.',
          },
        },
        { status: 503 },
      )
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    data: {
      message: 'Database reset complete. Run POST /api/seed to create the admin user.',
    },
  })
}
