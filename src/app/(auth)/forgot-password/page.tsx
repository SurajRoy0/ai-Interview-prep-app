"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@repo/shared"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true)
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setIsLoading(false)

    if (error) {
      toast.error(error.message || "Could not send reset link. Please try again.")
    } else {
      setIsSent(true)
    }
  }

  if (isSent) {
    return (
      <div className="w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for that address, we&apos;ve sent a password reset link.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Return to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium hover:text-foreground hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
