export function ATSScoreCard({ score }: { score?: number | null }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">ATS Score</p>
      <p className="text-3xl font-bold mt-1">{score ?? '—'}</p>
    </div>
  )
}
