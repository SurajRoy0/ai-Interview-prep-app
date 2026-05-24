/**
 * Clamps a number between a minimum and maximum value.
 * Used heavily for ensuring AI-generated scores don't exceed boundaries.
 */
export function clamp(value: number, min: number = 0, max: number = 100): number {
  if (isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely parses a JSON string, avoiding unhandled exceptions from malformed LLM outputs.
 */
export function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    // Sometimes LLMs wrap JSON in markdown blocks like ```json ... ```
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    return JSON.parse(cleanText) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON output:', error);
    return fallback;
  }
}
