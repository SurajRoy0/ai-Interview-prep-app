export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export type ApiError = {
  success: false
  error: {
    code: string          // Machine-readable: 'RESUME_NOT_FOUND'
    message: string       // Human-readable: 'Resume not found'
    details?: unknown     // Zod validation errors, field-level issues
    requestId?: string    // For tracing in logs
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
