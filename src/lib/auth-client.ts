'use client'

import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'
import { env } from '@repo/shared'

export const authClient = createAuthClient({
  baseURL: env.appUrl,
  plugins: [emailOTPClient()],
})

export const { signIn, signOut, signUp, useSession } = authClient
