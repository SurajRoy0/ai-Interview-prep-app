/**
 * Dummy fallback that returns an empty audio buffer.
 * Used when TTS_ENABLED=false to save costs during testing.
 */
export async function generateNoopTTS(_text: string): Promise<Buffer> {
  // Return a 1-byte dummy buffer
  return Buffer.from([0])
}
