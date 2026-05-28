'use client'

import { useEffect, useRef } from 'react'

export function useInterviewTimer(
  isActive: boolean,
  onTick: () => void,
  intervalMs: number = 1000
) {
  const savedCallback = useRef(onTick)

  useEffect(() => {
    savedCallback.current = onTick
  }, [onTick])

  useEffect(() => {
    if (!isActive) return

    const id = setInterval(() => savedCallback.current(), intervalMs)
    return () => clearInterval(id)
  }, [isActive, intervalMs])
}
