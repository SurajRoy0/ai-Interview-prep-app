import { Button } from "@/components/ui/button"
import { CheckCircle2, CreditCard, Sparkles, Receipt, AlertCircle } from "lucide-react"

const PLANS = [
  {
    name: "Free Trial",
    price: "₹0",
    period: "forever",
    description: "Perfect to test our AI interviewer engine.",
    features: ["1 full personalized interview", "Top 3 Weaknesses Report", "Ecosystem Detection"],
    current: true,
  },
  {
    name: "Pro Monthly",
    price: "₹699",
    period: "/ mo",
    description: "Unlimited access for serious candidates.",
    features: ["Unlimited AI Interviews", "Deep Skill Analytics", "Historical Progress Tracking", "Priority New Features"],
    current: false,
    highlight: true,
  }
]

export default function BillingPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription, credits, and billing history.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* ── Main Content Area ──────────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Available Plans
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                    plan.highlight
                      ? "border-2 border-primary bg-primary/5 shadow-primary-glow"
                      : "border border-border/50 bg-surface-1"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 fill-current" /> Recommended
                    </span>
                  )}
                  {plan.current && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Current Plan
                    </span>
                  )}
                  
                  <div>
                    <h3 className={`text-base font-semibold ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>
                  
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80 font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`mt-6 rounded-full w-full font-semibold text-xs ${plan.highlight ? "shadow-primary-glow" : ""}`}
                    variant={plan.current ? "outline" : (plan.highlight ? "default" : "secondary")}
                    disabled={plan.current || plan.highlight}
                  >
                    {plan.current ? "Active Plan" : (plan.highlight ? "Coming Soon" : "Downgrade")}
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Payment History
            </h2>
            <div className="bg-surface-1 border border-dashed border-border/60 rounded-2xl p-10 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No payments yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                Invoices for your subscription will appear here once you upgrade.
              </p>
            </div>
          </section>

        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          
          <div className="bg-surface-1 border border-border/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Credit Balance
            </h3>
            
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight">1</span>
                <span className="text-sm text-muted-foreground font-medium mb-1">/ 1</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Free interviews remaining</p>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '0%' }} />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                0% Used
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-500 mb-1 leading-tight">Pro Tier Launching Soon</p>
              <p className="text-[11px] text-blue-500/80 leading-relaxed">
                We are currently rolling out the Pro tier to a small group of beta testers. Paid subscriptions will open to everyone shortly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
