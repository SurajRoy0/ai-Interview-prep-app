"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignOutButtonProps {
  /** When set, navigates after sign out. Omit to only refresh the current page. */
  redirectTo?: string
  className?: string
  variant?: "button" | "link"
}

export function SignOutButton({
  redirectTo,
  className,
  variant = "button",
}: SignOutButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    setLoading(false)
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  return (
    <>
      {variant === "button" ? (
        <Button
          variant="ghost"
          size="sm"
          className={cn("hidden sm:flex", className)}
          onClick={() => setOpen(true)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
            className,
          )}
        >
          Sign out
        </button>
      )}

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        variant="confirm"
        title="Sign out?"
        description="You will need to sign in again to access your dashboard and interviews."
        confirmLabel="Sign out"
        onConfirm={handleSignOut}
        loading={loading}
        destructive
      />
    </>
  )
}
