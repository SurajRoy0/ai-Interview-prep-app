"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import type { Session } from "@/lib/auth"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "../shared/theme-toggle"

interface HomeNavProps {
  session: Session | null
}

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

export function HomeNav({ session }: HomeNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "glass border-b border-border/40 shadow-sm"
          : "bg-transparent"
          }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Left — Logo */}
          <Logo size="md" showName />

          {/* Center — Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right — CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Button asChild size="sm" className="rounded-full px-5 shadow-primary-glow">
                <Link href={session.user.role === "ADMIN" ? "/admin/dashboard" : "/candidate/dashboard"}>Dashboard →</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Button asChild size="sm" className="rounded-full px-5 shadow-primary-glow">
                  <Link href="/register">Start free →</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-heavy border-b border-border/40 px-4 py-4 flex flex-col gap-2 md:hidden"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2.5 px-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-3 border-t border-border/40 flex flex-col gap-2">
              {session ? (
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/candidate/dashboard">Dashboard →</Link>
                </Button>
              ) : (
                <>
                  <Link href="/login" className="py-2.5 px-3 text-sm font-medium text-center text-muted-foreground">
                    Log in
                  </Link>
                  <Button asChild size="sm" className="rounded-full">
                    <Link href="/register">Start free →</Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
