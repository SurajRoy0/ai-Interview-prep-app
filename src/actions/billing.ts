'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { success, failure } from '@/lib/action-result'

export type BillingLedgerEntry = {
  id: string
  date: Date
  type: 'GRANT' | 'PAYMENT' | 'USAGE'
  title: string
  description: string
  amount: number | string // Credits or Currency
  status?: string
}

export async function getBillingHistoryAction() {
  const session = await getSession()
  if (!session?.user?.id) return failure('Unauthorized', 'UNAUTHORIZED')

  try {
    // 1. Fetch Payments
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Fetch Credit Grants
    const credits = await prisma.interviewCredit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // 3. Fetch Interviews (Usage)
    // Only count interviews that have progressed past PENDING (meaning credit was consumed)
    const interviews = await prisma.interview.findMany({
      where: { 
        userId: session.user.id,
        status: { notIn: ['PENDING'] }
      },
      include: { jobProfile: true },
      orderBy: { createdAt: 'desc' },
    })

    const ledger: BillingLedgerEntry[] = []

    // Map free interview if they have used it or if they have an account
    // Actually, we can just represent the free credit as a virtual grant at account creation time
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true, freeInterviewUsed: true }
    })

    if (user) {
      ledger.push({
        id: 'free-grant',
        date: user.createdAt,
        type: 'GRANT',
        title: 'Free Session Granted',
        description: 'Welcome bonus',
        amount: '+1 Credit',
        status: 'SUCCESS'
      })
    }

    for (const p of payments) {
      ledger.push({
        id: p.id,
        date: p.createdAt,
        type: 'PAYMENT',
        title: p.plan ? `Purchased: ${p.plan.displayName}` : 'Payment',
        description: 'Razorpay transaction',
        amount: `₹${(p.amountPaise / 100).toFixed(2)}`,
        status: p.status
      })
    }

    for (const c of credits) {
      ledger.push({
        id: c.id,
        date: c.createdAt,
        type: 'GRANT',
        title: 'Credits Added',
        description: c.reason === 'dev_grant' ? 'Developer Grant' : (c.reason ?? 'Granted'),
        amount: `+${c.credits} Credits`,
        status: 'SUCCESS'
      })
    }

    for (const i of interviews) {
      ledger.push({
        id: i.id,
        date: i.startedAt ?? i.createdAt,
        type: 'USAGE',
        title: 'Interview Session',
        description: i.jobProfile.title,
        amount: '-1 Credit',
        status: i.status === 'COMPLETED' ? 'COMPLETED' : (i.status === 'FAILED' ? 'FAILED' : 'ACTIVE')
      })
    }

    // Sort descending by date
    ledger.sort((a, b) => b.date.getTime() - a.date.getTime())

    return success(ledger)
  } catch (error) {
    console.error('[getBillingHistoryAction]', error)
    return failure('Failed to fetch billing history', 'INTERNAL_ERROR')
  }
}
