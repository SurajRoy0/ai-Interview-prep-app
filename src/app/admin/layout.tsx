import { requireSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession().catch(() => null)

  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/candidate/dashboard')

  return <AdminShell session={session}>{children}</AdminShell>
}
