import { NextResponse } from 'next/server'
import { ErrorCodes } from '@repo/shared'

export function notImplementedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCodes.NOT_IMPLEMENTED,
        message: 'This endpoint is not implemented yet.',
      },
    },
    { status: 501 },
  )
}
