/**
 * Uses Google Cloud TTS via REST API
 */
export async function generateGoogleTTS(text: string): Promise<Buffer> {
  if (!process.env.GOOGLE_TTS_API_KEY) {
    throw new Error('GOOGLE_TTS_API_KEY is not set')
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`
  
  const payload = {
    input: { text },
    voice: { languageCode: 'en-US', name: 'en-US-Journey-F' },
    audioConfig: { audioEncoding: 'MP3' }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Google TTS failed: ${response.statusText}`)
  }

  const data = await response.json()
  return Buffer.from(data.audioContent, 'base64')
}
