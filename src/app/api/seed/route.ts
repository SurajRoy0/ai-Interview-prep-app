import { NextResponse } from 'next/server'
import { devOnlyGuard } from '@/lib/dev-guard'
import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'

export async function POST() {
  const guard = devOnlyGuard()
  if (guard) return guard

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@foxtel.local'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin12345'
  const adminName = 'Admin'

  // Seed plans and configs
  await seedPlans()

  const adminDefaults = {
    role: 'ADMIN' as const,
    emailVerified: true,
    isActive: true,
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: adminDefaults,
    })

    return NextResponse.json({
      success: true,
      data: {
        email: adminEmail,
        password: adminPassword,
        created: false,
        message: 'Admin user already exists — role, verification, and active status updated.',
      },
    })
  }

  await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    },
  })

  await prisma.user.update({
    where: { email: adminEmail },
    data: adminDefaults,
  })

  return NextResponse.json({
    success: true,
    data: {
      email: adminEmail,
      password: adminPassword,
      created: true,
      message: 'Admin user created. Use these credentials to log in.',
    },
  })
}

async function seedPlans() {
  console.log('🌱 Starting plan configuration seed...')

  // 1. Create Default (Free) PlanConfig
  const freeConfig = await prisma.planConfig.upsert({
    where: { name: 'free_tier' },
    update: {},
    create: {
      name: 'free_tier',
      isDefault: true,
      targetTopics: 5,
      maxFollowUpsPerTopic: 1,
      maxClarificationsPerTopic: 1,
      defaultTopicTimeLimitSecs: 480,
      maxPauseCount: 1,
      allowedDifficultyModes: ['GRADUAL'],
      reportDepth: 'MINIMAL',
      reportUnlockable: true,
      maxJobProfiles: 1,
      maxResumeUploadsPerDay: 1,
    }
  })
  console.log(`✅ Upserted PlanConfig: ${freeConfig.name}`)

  // 2. Create Pro PlanConfig
  const proConfig = await prisma.planConfig.upsert({
    where: { name: 'pro_tier' },
    update: {},
    create: {
      name: 'pro_tier',
      isDefault: false,
      targetTopics: 10,
      maxFollowUpsPerTopic: 3,
      maxClarificationsPerTopic: 3,
      defaultTopicTimeLimitSecs: 600,
      maxPauseCount: 3,
      allowedDifficultyModes: ['GRADUAL', 'ADAPTIVE', 'INTENSIVE'],
      reportDepth: 'EXHAUSTIVE',
      reportUnlockable: false,
      maxJobProfiles: 10,
      maxResumeUploadsPerDay: 10,
      maxResumeUploadsPerJobProfile: 5,
      parseFullResume: true,
    }
  })
  console.log(`✅ Upserted PlanConfig: ${proConfig.name}`)

  // 3. Create Free Plan
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free Tier',
      description: 'Default plan for all users',
      amountPaise: 0,
      billingInterval: 'ONE_TIME',
      includedCredits: 0,
      planConfigId: freeConfig.id
    }
  })
  console.log(`✅ Upserted Plan: ${freePlan.name}`)

  // 4. Create Pro Monthly Plan
  const proMonthly = await prisma.plan.upsert({
    where: { name: 'pro_monthly' },
    update: {},
    create: {
      name: 'pro_monthly',
      displayName: 'Pro Monthly',
      description: 'Advanced features and 5 interviews per month',
      amountPaise: 99900,
      billingInterval: 'MONTHLY',
      includedCredits: 5,
      planConfigId: proConfig.id
    }
  })
  console.log(`✅ Upserted Plan: ${proMonthly.name}`)

  // 5. Create Pro Quarterly Plan
  const proQuarterly = await prisma.plan.upsert({
    where: { name: 'pro_quarterly' },
    update: {},
    create: {
      name: 'pro_quarterly',
      displayName: 'Pro Quarterly',
      description: 'Advanced features and 20 interviews per quarter',
      amountPaise: 249900,
      billingInterval: 'QUARTERLY',
      includedCredits: 20,
      planConfigId: proConfig.id
    }
  })
  console.log(`✅ Upserted Plan: ${proQuarterly.name}`)

  console.log('🎉 Plan seeding completed successfully!')
}
