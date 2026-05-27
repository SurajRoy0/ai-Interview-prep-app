"use server"

import { prisma } from "@repo/db"
import { getSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { configSchema, type ConfigInput } from "@repo/validators"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/candidate/dashboard")
  return session
}

export async function createAdminConfigAction(data: ConfigInput) {
  await requireAdmin()
  
  const parsed = configSchema.parse(data)
  
  // Parse activityConfig JSON string
  let activityConfigJson = {}
  try {
    activityConfigJson = JSON.parse(parsed.activityConfig)
  } catch {
    // Should be caught by zod, but fallback just in case
  }

  // If this config is set to default, we must unset others
  if (parsed.isDefault) {
    await prisma.interviewConfig.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })
  }

  const config = await prisma.interviewConfig.create({
    data: {
      ...parsed,
      activityConfig: activityConfigJson,
    },
  })

  revalidatePath("/admin/configs")
  return { success: true, data: config }
}

export async function updateAdminConfigAction(id: string, data: ConfigInput) {
  await requireAdmin()
  
  const parsed = configSchema.parse(data)

  let activityConfigJson = {}
  try {
    activityConfigJson = JSON.parse(parsed.activityConfig)
  } catch {
    // Fallback
  }

  if (parsed.isDefault) {
    await prisma.interviewConfig.updateMany({
      where: { id: { not: id }, isDefault: true },
      data: { isDefault: false },
    })
  }

  const config = await prisma.interviewConfig.update({
    where: { id },
    data: {
      ...parsed,
      activityConfig: activityConfigJson,
    },
  })

  revalidatePath("/admin/configs")
  revalidatePath(`/admin/configs/${id}`)
  return { success: true, data: config }
}

export async function deleteAdminConfigAction(id: string) {
  await requireAdmin()

  // Prevent deleting if it's the only default one, or we can just let Prisma handle
  // But generally good to ensure at least one config exists, though we'll keep it simple here.

  await prisma.interviewConfig.delete({
    where: { id },
  })

  revalidatePath("/admin/configs")
  return { success: true }
}

export async function getAdminConfigByIdAction(id: string) {
  await requireAdmin()
  return await prisma.interviewConfig.findUnique({
    where: { id },
  })
}
