import { requireSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { CandidateShell } from '@/components/candidate/candidate-shell'
import { getTotalCreditsAction } from '@/actions/candidate/user'
import { getUserActivePlanConfig } from '@repo/db'
import { AppStoreProvider } from '@/components/providers/app-store-provider'

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession().catch(() => null)
  if (!session) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin/dashboard')

  const [totalCredits, planConfig] = await Promise.all([
    getTotalCreditsAction(),
    getUserActivePlanConfig(session.user.id)
  ])

  return (
    <AppStoreProvider initialState={{ planConfig }}>
      <CandidateShell session={session} totalCredits={totalCredits}>
        {children}
      </CandidateShell>
    </AppStoreProvider>
  )
}
