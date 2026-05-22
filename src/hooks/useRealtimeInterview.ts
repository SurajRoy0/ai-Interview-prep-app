'use client'

export function useRealtimeInterview(_interviewId: string) {
  return { connected: false, publish: () => {}, subscribe: () => () => {} }
}
