export default async function InterviewSetupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-xl w-full bg-surface-1 border border-border/50 rounded-3xl p-8 space-y-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Pre-Interview Setup</h1>
        <p className="text-muted-foreground text-center font-mono text-sm">
          Target Route: /candidate/interview/{id}/setup
        </p>

        <div className="space-y-4 text-sm leading-relaxed bg-background p-5 rounded-2xl border border-border/40">
          <h2 className="text-base font-semibold border-b border-border/40 pb-2">What this component will do:</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>Background Generation:</strong> Trigger the BullMQ worker to generate the Interview Plan (if not already generated).</li>
            <li><strong>Polling:</strong> Poll the server every 2 seconds to check if <code>planGenerated === true</code>.</li>
            <li><strong>Retry Logic:</strong> If the plan generation fails 3 times, show a Manual Retry button.</li>
            <li><strong>Equipment Check:</strong> Verify microphone permissions and connection to Deepgram.</li>
            <li><strong>Action:</strong> Once the plan is ready and the mic is working, light up the &quot;Start Interview&quot; button which links to <code>/session</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
