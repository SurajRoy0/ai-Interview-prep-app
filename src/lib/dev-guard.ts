import { NextResponse } from 'next/server'
import { ErrorCodes, isDevelopment } from '@repo/shared'

export { isDevelopment }

export function devOnlyGuard(): NextResponse | null {
  if (!isDevelopment()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: ErrorCodes.FORBIDDEN, message: 'Only available in development' },
      },
      { status: 403 },
    )
  }
  return null
}
