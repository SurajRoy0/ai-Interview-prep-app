import { requireSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { CandidateShell } from '@/components/layout/candidate-shell'

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession().catch(() => null)
  if (!session) redirect('/login')

  return <CandidateShell session={session}>{children}</CandidateShell>
}
