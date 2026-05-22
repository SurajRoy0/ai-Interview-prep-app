/**
 * Safely parses JSON that might be wrapped in markdown code blocks.
 * Example: removes ```json\n{...}\n```
 */
export function safeParseJSON<T>(text: string): T | null {
  try {
    const cleanText = text
      .replace(/^```(?:json)?\n?/g, '')
      .replace(/\n?```$/g, '')
      .trim()
      
    return JSON.parse(cleanText) as T
  } catch (error) {
    console.error('Failed to parse AI JSON:', error, 'Raw text:', text)
    return null
  }
}

/**
 * Ensures an AI generated score strictly falls between min and max.
 */
export function clampScore(score: number, min = 0, max = 100): number {
  if (isNaN(score)) return min
  return Math.max(min, Math.min(max, score))
}
