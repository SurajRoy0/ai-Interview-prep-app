export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Platform metrics and system status.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card shadow-sm p-6">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-4"></div>
            <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
