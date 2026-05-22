import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins'
import { prisma } from './prisma'
import { sendEmail, sendOtpEmail } from './mail'

const createAuth = () => betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        'Reset your Foxtel password',
        `Click the link below to set a new password. This link expires in 1 hour.\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
      )
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'CANDIDATE',
      },
      ecosystem: {
        type: 'string',
        required: false,
      },
      experienceLevel: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail(email, otp, type)
      },
    }),
  ],
})

const globalForAuth = globalThis as unknown as {
  auth: ReturnType<typeof createAuth> | undefined
}

export const auth = globalForAuth.auth ?? createAuth()

if (process.env.NODE_ENV !== 'production') {
  globalForAuth.auth = auth
}

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user