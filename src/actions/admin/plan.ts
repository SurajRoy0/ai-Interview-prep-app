"use server"

import { prisma } from "@repo/db"
import { getSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { planSchema, type PlanInput } from "@repo/shared"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/candidate/dashboard")
  return session
}

export async function createAdminPlanAction(data: PlanInput) {
  await requireAdmin()

  const parsed = planSchema.parse(data)

  const plan = await prisma.plan.create({
    data: parsed,
  })

  revalidatePath("/admin/plans")
  return { success: true, data: plan }
}

export async function updateAdminPlanAction(id: string, data: PlanInput) {
  await requireAdmin()

  const parsed = planSchema.parse(data)

  const plan = await prisma.plan.update({
    where: { id },
    data: parsed,
  })

  revalidatePath("/admin/plans")
  revalidatePath(`/admin/plans/${id}`)
  return { success: true, data: plan }
}

export async function deleteAdminPlanAction(id: string) {
  await requireAdmin()

  await prisma.plan.delete({
    where: { id },
  })

  revalidatePath("/admin/plans")
  return { success: true }
}

export async function getAdminPlansAction() {
  await requireAdmin()
  return await prisma.plan.findMany({
    include: {
      planConfig: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAdminPlanByIdAction(id: string) {
  await requireAdmin()
  return await prisma.plan.findUnique({
    where: { id },
    include: {
      planConfig: true,
    },
  })
}
