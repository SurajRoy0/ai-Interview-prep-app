import { Logo } from "@/components/shared/logo"
import { CheckCircle2 } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
      
      {/* ── Left Panel (Brand/Marketing) ───────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border/40 bg-surface-1 p-12 text-foreground relative overflow-hidden">
        
        {/* Subtle mesh background and primary glow */}
        <div className="absolute inset-0 mesh-grid opacity-30" />
        <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Logo size="lg" showName href="/" />
        </div>

        {/* Center: Value props */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12">
          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Master your next tech interview with an AI that listens.
            </h2>
            
            <ul className="space-y-4 pt-2">
              {[
                "Resume-aware questions tailored to you",
                "Voice-first interface — speak naturally",
                "Detailed feedback and honest scoring in 15 mins"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 mt-auto pt-12 border-t border-border/40">
          <blockquote className="space-y-4 max-w-md">
            <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
              &quot;The personalized AI interviews helped me identify my weak spots in React. The structured feedback was exactly what I needed to land my role at Swiggy.&quot;
            </p>
            <footer className="text-sm">
              <span className="font-bold text-foreground">Rohan Mehta</span>
              <span className="text-muted-foreground"> — SDE II</span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right Panel (Auth Forms) ───────────────────────────────────────── */}
      <div className="flex flex-col p-6 sm:p-10 lg:p-12 justify-center relative overflow-hidden">
        {/* Subtle mesh background and primary glow */}
        <div className="absolute inset-0 mesh-grid opacity-20 pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        {/* Mobile Logo Header */}
        <div className="flex justify-center lg:hidden absolute top-8 left-0 right-0 z-10">
          <Logo size="md" showName href="/" />
        </div>
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
