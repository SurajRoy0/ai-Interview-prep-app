export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile settings.</p>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-8 max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted/50 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted/50 rounded"></div>
        </div>
        <div className="pt-4">
          <div className="h-10 w-24 bg-primary/20 rounded"></div>
        </div>
      </div>
    </div>
  )
}
