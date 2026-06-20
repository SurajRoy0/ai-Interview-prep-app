import { SessionEngine } from '@/components/candidate/interview/session-engine'

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex-1 flex flex-col p-6 w-full h-[calc(100vh-64px)] overflow-hidden">
      <SessionEngine interviewId={id} />
    </div>
  )
}

