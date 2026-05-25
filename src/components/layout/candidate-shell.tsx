"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  LayoutDashboard, CreditCard, Settings2,
  Plus, ChevronDown, User, Menu, Briefcase
} from "lucide-react"
import type { Session } from "@/lib/auth"
import { UserAvatar } from "@/components/shared/user-avatar"
import { signOut } from "@/lib/auth-client"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Logo } from "@/components/shared/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../shared/theme-toggle"

// ─── Navigation ───────────────────────────────────────────────────────────────
// User journey: Dashboard → pick a Job Profile → /profile/[id] → upload resume → start interview
// History of all interviews lives at /interview/history
// Billing and settings are standalone pages

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-profiles", label: "Job profiles", icon: Briefcase },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings2 },
]

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  session: Session
  children: React.ReactNode
}

export function CandidateShell({ session, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)

  async function handleSignOut() {
    setSignOutLoading(true)
    await signOut()
    setSignOutLoading(false)
    setShowSignOutDialog(false)
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Ambient top glow */}
      <div className="fixed top-0 inset-x-0 h-72 bg-gradient-to-b from-primary/6 to-transparent pointer-events-none z-0" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 border-b border-border/50 glass flex items-center justify-between px-4 md:px-6">

        {/* Left — Logo */}
        <Logo size="sm" showName href="/dashboard" />

        {/* Center — Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                  active
                    ? "text-foreground bg-surface-2 border border-border/60 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {active && (
                  <motion.span
                    layoutId="shell-nav-active"
                    className="absolute inset-0 rounded-full ring-1 ring-primary/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block h-5 w-px bg-border mx-1" />

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full px-1 py-0.5 hover:bg-surface-1 transition-colors focus:outline-none group">
                <UserAvatar
                  name={session.user.name}
                  email={session.user.email}
                  image={session.user.image}
                />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block group-hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-2">
              <div className="px-3 py-2.5 border-b border-border/40">
                <p className="text-sm font-semibold truncate">{session.user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer mt-1">
                  <User className="h-3.5 w-3.5" /> Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-3.5 w-3.5" /> Billing & Plans
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setShowSignOutDialog(true)
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 flex flex-col">
              <div className="pt-4 mb-6">
                <Logo size="sm" showName href="/dashboard" />
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-surface-2 text-foreground border border-border/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  )
                })}
                <Button asChild size="sm" className="rounded-full mt-3 gap-2 shadow-primary-glow">
                  <Link href="/interview/setup">
                    <Plus className="h-4 w-4" /> New Interview
                  </Link>
                </Button>
              </nav>
              <div className="border-t border-border/40 pt-4 pb-2">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <UserAvatar name={session.user.name} email={session.user.email} image={session.user.image} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignOutDialog(true)}
                  className="px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {children}
      </main>

      <ConfirmationDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        variant="confirm"
        title="Sign out?"
        description="You will need to sign in again to access your dashboard and interviews."
        confirmLabel="Sign out"
        onConfirm={handleSignOut}
        loading={signOutLoading}
        destructive
      />
    </div>
  )
}
