import { logger } from '@repo/shared'
import { isDevelopment } from '@repo/shared'

export async function sendEmail(to: string, title: string, content: string) {
  if (isDevelopment()) {
    // console.log is the only reliable way to surface output in `next dev`
    console.log(`\n📧 [Foxtel Email] To: ${to}\n   Subject: ${title}\n   ${content}\n`)
  }
  logger.info({ to, title }, 'Email sent')
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  type: 'email-verification' | 'sign-in' | 'forget-password' | 'change-email',
) {
  const subject =
    type === 'forget-password'
      ? 'Reset your Foxtel password'
      : 'Your Foxtel verification code'

  const body =
    type === 'forget-password'
      ? `Your password reset code is: ${otp}\n\nThis code expires in 5 minutes.`
      : `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`

  if (isDevelopment()) {
    console.log(`\n🔐 [Foxtel OTP] ${to}\n   Code: ${otp}\n   Type: ${type}\n   Expires in 5 minutes\n`)
  }

  logger.info({ to, otp, type }, `[OTP] ${otp}`)
  await sendEmail(to, subject, body)
}
