import { NextResponse } from 'next/server'
import { devOnlyGuard } from '@/lib/dev-guard'
import { prisma } from '@repo/db'

/**
 * POST /api/developer/credits
 *
 * Grants interview credits to any user. Development only.
 *
 * Body:
 *   { "email": "user@example.com", "credits": 10, "reason": "dev_grant" }
 *   OR
 *   { "userId": "clxxx...", "credits": 10 }
 *
 * Optionally resets freeInterviewUsed so the user can take another free interview:
 *   { ..., "resetFreeInterview": true }
 */
export async function POST(req: Request) {
  const guard = devOnlyGuard()
  if (guard) return guard

  let body: {
    email?: string
    userId?: string
    credits?: number
    reason?: string
    resetFreeInterview?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, userId, credits = 5, reason = 'dev_grant', resetFreeInterview = false } = body

  if (!email && !userId) {
    return NextResponse.json(
      { success: false, error: 'Provide either "email" or "userId"' },
      { status: 400 },
    )
  }

  if (credits < 1 || credits > 1000) {
    return NextResponse.json(
      { success: false, error: '"credits" must be between 1 and 1000' },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({
    where: email ? { email } : { id: userId! },
    select: { id: true, email: true, name: true, freeInterviewUsed: true, credits: true },
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 },
    )
  }

  const [creditRecord] = await prisma.$transaction([
    prisma.interviewCredit.create({
      data: {
        userId: user.id,
        credits,
        reason,
      },
    }),
    ...(resetFreeInterview
      ? [prisma.user.update({ where: { id: user.id }, data: { freeInterviewUsed: false } })]
      : []),
  ])

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      freeInterviewUsed: true,
      credits: {
        select: { id: true, credits: true, reason: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      granted: {
        creditRecordId: creditRecord.id,
        credits,
        reason,
      },
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        freeInterviewUsed: updatedUser!.freeInterviewUsed,
        totalCreditBalance: updatedUser!.credits.reduce((sum, c) => sum + c.credits, 0),
        creditRecords: updatedUser!.credits,
      },
    },
  })
}
