export function ReportHero({ score }: { score: number }) {
  return (
    <section className="text-center py-8">
      <p className="text-sm text-muted-foreground">Overall score</p>
      <p className="text-5xl font-bold mt-2">{score}</p>
    </section>
  )
}
