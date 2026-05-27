import { NextResponse } from 'next/server'
import { prisma } from '@repo/db'

export type DeveloperSubscribePayload = {
  userEmail: string
  planName: string
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate the developer request using an API key
    const apiKey = req.headers.get('x-dev-api-key')
    if (apiKey !== process.env.DEV_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized. Invalid x-dev-api-key.' }, { status: 401 })
    }

    // 2. Parse the request body
    const body = await req.json()
    const { userEmail, planName } = body as DeveloperSubscribePayload

    if (!userEmail || !planName) {
      return NextResponse.json({ error: 'Missing userEmail or planName' }, { status: 400 })
    }

    // 3. Verify User and Plan exist
    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return NextResponse.json({ error: `User not found with email: ${userEmail}` }, { status: 404 })
    }

    const plan = await prisma.plan.findUnique({ where: { name: planName } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // 4. Calculate Billing Period
    const now = new Date()
    let currentPeriodEnd = new Date()

    if (plan.billingInterval === 'MONTHLY') {
      currentPeriodEnd.setMonth(now.getMonth() + 1)
    } else if (plan.billingInterval === 'QUARTERLY') {
      currentPeriodEnd.setMonth(now.getMonth() + 3)
    } else if (plan.billingInterval === 'YEARLY') {
      currentPeriodEnd.setFullYear(now.getFullYear() + 1)
    } else if (plan.billingInterval === 'ONE_TIME') {
      // For one-time purchases, we just set the end date far in the future
      // so their credits remain valid and their PlanConfig applies.
      currentPeriodEnd.setFullYear(now.getFullYear() + 10)
    }

    // 5. Create or Update the Subscription inside a Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate any existing subscriptions for this user
      await tx.subscription.updateMany({
        where: { userId: user.id, status: 'ACTIVE' },
        data: { status: 'CANCELLED' }
      })

      // Create the new active subscription
      const newSub = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: currentPeriodEnd,
          interviewsLeft: plan.interviewCredits,
          provider: 'dev_api',
          providerSubId: `dev_${Date.now()}`
        }
      })

      // Also create an InterviewCredit record for their billing ledger
      if (plan.interviewCredits > 0) {
        await tx.interviewCredit.create({
          data: {
            userId: user.id,
            credits: plan.interviewCredits,
            reason: 'dev_grant',
            expiresAt: currentPeriodEnd
          }
        })
      }

      // Add a payment record to the ledger just to show it was granted
      await tx.payment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amountPaise: plan.amountPaise ?? 0,
          currency: 'INR',
          status: 'SUCCESS',
          provider: 'dev_api',
          providerPaymentId: `dev_${Date.now()}`
        }
      })

      return newSub
    })

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed user to ${plan.displayName}`,
      subscription: result
    })

  } catch (error) {
    console.error('[DEV_API_SUBSCRIBE]', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
