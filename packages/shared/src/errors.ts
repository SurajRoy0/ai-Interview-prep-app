import type { ErrorCode } from './constants/error-codes'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    message?: string,
    public readonly details?: unknown,
  ) {
    super(message ?? code)
    this.name = 'AppError'
  }

  static notFound(resource: string): AppError {
    return new AppError('NOT_FOUND', 404, `${resource} not found`)
  }

  static unauthorized(): AppError {
    return new AppError('UNAUTHORIZED', 401)
  }

  static forbidden(): AppError {
    return new AppError('FORBIDDEN', 403)
  }

  static validation(details: unknown): AppError {
    return new AppError('VALIDATION_ERROR', 422, 'Validation failed', details)
  }

  static aiError(message: string, details?: unknown): AppError {
    return new AppError('AI_PROVIDER_ERROR', 502, message, details)
  }
}
