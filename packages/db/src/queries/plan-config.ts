import { prisma } from '../client'
import type { PlanConfig } from '../generated/prisma/client'

/**
 * Returns the active PlanConfig for a given user.
 * If the user has an active subscription, returns that plan's config.
 * Otherwise, falls back to the default config.
 * Throws an error if absolutely no config can be found (should never happen if DB is seeded properly).
 */
export async function getUserActivePlanConfig(userId: string): Promise<PlanConfig> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: { include: { planConfig: true } } }
  })

  if (subscription?.plan?.planConfig) {
    return subscription.plan.planConfig
  }

  const defaultConfig = await prisma.planConfig.findFirst({ 
    where: { isDefault: true } 
  })

  if (!defaultConfig) {
    throw new Error("CRITICAL: No default plan configuration found in the database.")
  }

  return defaultConfig
}
