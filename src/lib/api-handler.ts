import type { ZodSchema } from '@repo/shared'
import { AppError, type ApiResponse } from '@repo/shared'
import { logger } from '@repo/shared'
import { nanoid } from 'nanoid'
import { auth } from './auth'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface HandlerOptions<TBody, TResult> {
  method: HttpMethod
  schema?: ZodSchema<TBody>
  requireAuth?: boolean
  handler: (params: {
    body: TBody
    req: Request
    userId?: string
    requestId: string
  }) => Promise<TResult>
}

export function apiHandler<TBody = unknown, TResult = unknown>(
  options: HandlerOptions<TBody, TResult>
) {
  return async (req: Request): Promise<Response> => {
    const requestId = nanoid(10)

    try {
      // Method check
      if (req.method !== options.method) {
        return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Method not allowed', requestId } }, 405)
      }

      // Auth check
      let userId: string | undefined
      if (options.requireAuth) {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session?.user?.id) {
          return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required', requestId } }, 401)
        }
        userId = session.user.id
      }

      // Body parsing + validation
      let body = {} as TBody
      if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
        const rawBody = await req.json().catch(() => ({}))
        if (options.schema) {
          const result = options.schema.safeParse(rawBody)
          if (!result.success) {
            return jsonResponse({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: result.error.flatten(),
                requestId,
              },
            }, 422)
          }
          body = result.data
        } else {
          body = rawBody as TBody
        }
      }

      // Execute handler
      const data = await options.handler({ body, req, userId, requestId })

      return jsonResponse({ success: true, data }, 200)

    } catch (error) {
      if (error instanceof AppError) {
        logger.warn({ code: error.code, message: error.message, requestId }, 'AppError')
        return jsonResponse({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            requestId,
          },
        }, error.statusCode)
      }

      logger.error({ error, requestId }, 'Unhandled error in API handler')
      return jsonResponse({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          requestId,
        },
      }, 500)
    }
  }
}

function jsonResponse<T>(data: ApiResponse<T>, status: number): Response {
  return Response.json(data, { status })
}
