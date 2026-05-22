export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and interview credits.</p>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between p-4 border rounded-lg mb-6">
          <div>
            <p className="font-medium">Free Tier</p>
            <p className="text-sm text-muted-foreground">0 credits remaining</p>
          </div>
          <div className="px-3 py-1 bg-muted rounded-full text-sm">Active</div>
        </div>
        
        <div className="h-10 w-32 bg-primary/20 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
