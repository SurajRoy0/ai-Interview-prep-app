'use server'

import { ablyServer } from '@/lib/ably-server'
import { getSession } from '@/lib/auth-server'
import { fail, ok } from '@/lib/action-result'

export async function getAblyTokenAction() {
  const session = await getSession()
  if (!session?.user?.id) {
    return fail('UNAUTHORIZED')
  }

  try {
    const tokenRequest = await ablyServer.auth.createTokenRequest({
      clientId: session.user.id,
    })
    return ok(tokenRequest)
  } catch (error) {
    console.error('Ably token generation failed:', error)
    return fail('INTERNAL_SERVER_ERROR')
  }
}
