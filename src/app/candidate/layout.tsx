import { requireSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { CandidateShell } from '@/components/candidate/candidate-shell'
import { getTotalCreditsAction } from '@/actions/user'

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession().catch(() => null)
  if (!session) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin/dashboard')

  const totalCredits = await getTotalCreditsAction()

  return <CandidateShell session={session} totalCredits={totalCredits}>{children}</CandidateShell>
}
