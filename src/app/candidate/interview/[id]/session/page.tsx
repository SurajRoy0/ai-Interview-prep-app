import { SessionEngine } from '@/components/candidate/interview/session-engine'
import { requireSession } from '@/lib/auth-server'

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, session] = await Promise.all([params, requireSession()])

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden">
      <SessionEngine interviewId={id} session={session} />
    </div>
  )
}

