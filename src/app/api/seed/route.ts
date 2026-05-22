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
