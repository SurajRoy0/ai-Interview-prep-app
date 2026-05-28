export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Live Session Environment</h1>
          <p className="text-sm font-mono mt-1">Route: /candidate/interview/{id}/session</p>
        </div>
        <div className="animate-pulse bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Credit Deducted Here
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 bg-surface-1 border border-border/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border/40 pb-2">Main Interview Engine</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li><strong>Topic Management:</strong> Opens the next <code>PENDING</code> question and marks it <code>ACTIVE</code>.</li>
            <li><strong>AI Streaming:</strong> Receives token-by-token streaming from the AI interviewer.</li>
            <li><strong>Voice Capture:</strong> Connects to Deepgram WebSocket, captures voice, and submits it as a Turn when silence is detected.</li>
            <li><strong>Timers:</strong> Runs the strict topic budget countdown (e.g., 2 minutes per question).</li>
          </ul>
        </div>

        <div className="bg-surface-2 border border-border/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold border-b border-border/40 pb-2">Controls & Edges</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li><strong>Pause Button:</strong> Saves remaining time to DB and routes back to Dashboard.</li>
            <li><strong>Code Editor:</strong> Shown dynamically if the current topic is an Activity requiring code input.</li>
            <li><strong>End Interview:</strong> Gracefully terminates early, skips remaining questions, and routes to the Report view.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
