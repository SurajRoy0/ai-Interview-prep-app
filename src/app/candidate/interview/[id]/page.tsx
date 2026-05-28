export default async function InterviewRouterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold">Smart Router & Post-Interview Dashboard</h1>
      <p className="text-muted-foreground font-mono bg-surface-1 p-4 rounded-xl border border-border/50">
        Target Route: /candidate/interview/{id}
      </p>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold border-b border-border/40 pb-2">What this component will do:</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li><strong>Check Status:</strong> Read the status of this interview from the database.</li>
          <li><strong>If PENDING:</strong> Automatically redirect the candidate to <code>/setup</code> to generate the plan and check equipment.</li>
          <li><strong>If ACTIVE or PAUSED:</strong> Automatically redirect the candidate to <code>/session</code> to resume their live interview.</li>
          <li><strong>If COMPLETED:</strong> Render the Post-Interview Dashboard. This means showing the generated Report, Scores, and Tabs for the raw Transcript and Code Activity.</li>
        </ul>
      </div>
    </div>
  )
}
