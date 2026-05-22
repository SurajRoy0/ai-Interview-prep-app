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
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
