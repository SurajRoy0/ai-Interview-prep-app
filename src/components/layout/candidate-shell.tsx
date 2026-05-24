"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Plus
} from "lucide-react"
import type { Session } from "@/lib/auth"
import { UserAvatar } from "@/components/shared/user-avatar"
import { SignOutButton } from "@/components/shared/sign-out-button"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/resume/upload", label: "Resumes" },
  { href: "/settings", label: "Settings" },
]

export function CandidateShell({ session, children }: { session: Session, children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background text-foreground flex-col font-sans selection:bg-primary/20 relative">
      {/* Subtle background glow from primary theme color */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      {/* Premium Top Navbar scoped to theme */}
      <header className="h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center px-4 md:px-8 justify-between sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-8 h-full">
          <Link href="/dashboard" className="font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            Foxtel
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 h-full">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 text-sm transition-all rounded-full font-medium flex items-center",
                    active
                      ? "text-foreground bg-accent border border-border/50 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/interview/setup" className="hidden md:flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all shadow-md active:scale-95">
            <Plus className="h-4 w-4" />
            New Interview
          </Link>
          <div className="h-6 w-px bg-border mx-1 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <UserAvatar
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
            <SignOutButton redirectTo="/login" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pt-8 md:pt-12 z-10">
        {children}
      </main>
    </div>
  )
}
