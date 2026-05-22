'use client'

// Voice activity detection — wire when interview voice UI is built.

export function useVAD() {
  return { isSpeaking: false, start: () => {}, stop: () => {} }
}
