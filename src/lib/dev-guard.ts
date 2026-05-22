import { NextResponse } from 'next/server'

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function devOnlyGuard(): NextResponse | null {
  if (!isDevelopment()) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only available in development' } },
      { status: 403 },
    )
  }
  return null
}
