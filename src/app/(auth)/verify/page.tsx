"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/auth/otp-input"
import Link from "next/link"
import { toast } from "sonner"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") ?? ""

  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isSendingInitial, setIsSendingInitial] = useState(true)
  const initialSendDone = useRef(false)

  useEffect(() => {
    if (!email || initialSendDone.current) return
    initialSendDone.current = true

    authClient.emailOtp
      .sendVerificationOtp({ email, type: "email-verification" })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message || "Failed to send verification code.")
        }
      })
      .finally(() => setIsSendingInitial(false))
  }, [email])

  async function handleVerify() {
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit code.")
      return
    }

    setIsVerifying(true)
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp })
    setIsVerifying(false)

    if (error) {
      const msg =
        error.code === "OTP_EXPIRED"
          ? "This code has expired. Request a new one."
          : error.code === "INVALID_OTP" || error.code === "TOO_MANY_ATTEMPTS"
            ? "Invalid code. Check your email or request a new code."
            : error.message || "Verification failed."
      toast.error(msg)
      return
    }

    toast.success("Email verified! Welcome to Foxtel.")
    router.push("/dashboard")
    router.refresh()
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return

    setIsResending(true)
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    })
    setIsResending(false)

    if (error) {
      toast.error(error.message || "Failed to resend code.")
      return
    }

    toast.success("A new code has been sent to your email.")
    setOtp("")
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  if (!email) {
    return (
      <div className="w-full text-center space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          No email address found. Please sign up or log in again.
        </p>
        <Button className="w-full" asChild>
          <Link href="/register">Create an account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Dev mode: OTP is printed in your terminal (not emailed).
          </p>
        )}
      </div>

      <div className="space-y-6">
        {isSendingInitial ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Sending verification code…
          </div>
        ) : (
          <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />
        )}

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isVerifying || isSendingInitial || otp.length !== 6}
        >
          {isVerifying ? "Verifying…" : "Verify email"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {isResending
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Wrong email?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
