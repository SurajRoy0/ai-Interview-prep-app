export default function NewInterviewPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-10 text-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Start New Interview</h1>
        <p className="text-muted-foreground mt-2">Select a resume and configure your interview settings.</p>
      </div>
      
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-8 mt-8">
        <div className="h-10 w-full bg-muted rounded animate-pulse mb-6"></div>
        <div className="h-10 w-full bg-muted rounded animate-pulse mb-6"></div>
        <div className="h-12 w-32 bg-primary/20 rounded mx-auto mt-8"></div>
      </div>
    </div>
  )
}
