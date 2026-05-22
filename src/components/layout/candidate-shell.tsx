"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Mic,
  CreditCard,
  Settings,
} from "lucide-react"
import type { Session } from "@/lib/auth"
import { UserAvatar } from "@/components/shared/user-avatar"
import { SignOutButton } from "@/components/shared/sign-out-button"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume/upload", label: "Resume", icon: FileText },
  { href: "/interview/setup", label: "Interview", icon: Mic },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface CandidateShellProps {
  session: Session
  children: React.ReactNode
}

export function CandidateShell({ session, children }: CandidateShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card hidden md:flex md:flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="font-semibold tracking-tight text-lg">
            Foxtel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 flex items-center px-4 md:px-6 justify-between gap-4">
          <div className="md:hidden font-semibold">Foxtel</div>
          <div className="flex-1 hidden md:block" />
          <div className="flex items-center gap-3">
            <UserAvatar
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
            <SignOutButton redirectTo="/login" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
