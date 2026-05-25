"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Brand Constants ──────────────────────────────────────────────────────────
// Change these when you finalise the brand identity.
// The Logo component will automatically update everywhere.

export const APP_NAME = "Foxtel"
export const APP_TAGLINE = "AI-powered interview preparation"
export const APP_DESCRIPTION = "Practice with an AI that actually listens."

// ─── Logo Component ───────────────────────────────────────────────────────────

interface LogoProps {
  showName?: boolean
  size?: "sm" | "md" | "lg"
  href?: string
  className?: string
}

const SIZE_MAP = {
  sm: { mark: "h-6 w-6", text: "text-sm", inner: "text-xs" },
  md: { mark: "h-7 w-7", text: "text-base", inner: "text-sm" },
  lg: { mark: "h-9 w-9", text: "text-xl",  inner: "text-base" },
}

export function Logo({ showName = true, size = "md", href = "/", className }: LogoProps) {
  const s = SIZE_MAP[size]

  const content = (
    <span className={cn("flex items-center gap-2 select-none", className)}>
      {/* Mark — replace the SVG inside when you finalise the icon */}
      <span
        className={cn(
          s.mark,
          "rounded-lg flex items-center justify-center flex-shrink-0",
          "bg-primary text-primary-foreground font-bold",
          "shadow-primary-glow"
        )}
      >
        {/* Placeholder: single lettermark. Swap for your SVG icon here. */}
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Stylised mic wave — placeholder shape */}
          <rect x="8" y="2" width="4" height="10" rx="2" fill="currentColor" />
          <path
            d="M5 10a5 5 0 0 0 10 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="10" y1="15" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="18" x2="13" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      {showName && (
        <span className={cn(s.text, "font-semibold tracking-tight text-foreground")}>
          {APP_NAME}
        </span>
      )}
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      {content}
    </Link>
  )
}
