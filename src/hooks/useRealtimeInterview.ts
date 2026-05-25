'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useRealtimeInterview(_interviewId: string) {
  return { connected: false, publish: () => {}, subscribe: () => () => {} }
}
