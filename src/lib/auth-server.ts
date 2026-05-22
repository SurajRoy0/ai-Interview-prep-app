import { cache } from 'react'
import { auth } from './auth'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function getSessionFromRequest(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers })
}
