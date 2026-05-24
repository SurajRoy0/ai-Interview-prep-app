export async function synthesizeSpeech(text: string): Promise<Buffer | null> {
  // Return null when TTS is disabled to save costs and avoid external API calls.
  // The system will seamlessly fall back to text-only mode.
  return null;
}
