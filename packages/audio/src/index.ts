import { generateGoogleTTS } from './tts/google.js'
import { generateNoopTTS } from './tts/noop.js'

export async function generateSpeech(text: string): Promise<Buffer> {
  const isEnabled = process.env.TTS_ENABLED === 'true'
  
  if (!isEnabled) {
    return generateNoopTTS(text)
  }

  try {
    return await generateGoogleTTS(text)
  } catch (error) {
    console.error('TTS Generation failed, falling back to Noop:', error)
    return generateNoopTTS(text)
  }
}
