"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import type { Session } from "@/lib/auth"
import { SignOutButton } from "@/components/shared/sign-out-button"

interface HomeNavProps {
  session: Session | null
}

export function HomeNav({ session }: HomeNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-xs leading-none">F</span>
          </div>
          <span className="font-semibold tracking-tight">Foxtel</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <SignOutButton variant="link" className="hidden sm:inline-block" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
