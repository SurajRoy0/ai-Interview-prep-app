import { generateText } from 'ai'
import { getGeminiModel, AI_MODELS } from '../client'

const CODE_SIMULATOR_SYSTEM = `You are a deterministic compiler and runtime engine.
The user will provide you with code. You must evaluate the code and output exactly what the stdout (terminal output) would be if the code was executed.
If there are syntax errors or runtime exceptions, output the raw error stack trace.
Do NOT use markdown code blocks. Output ONLY the raw terminal output.`

export async function simulateCodeExecution(code: string, language: string): Promise<string> {
  const model = getGeminiModel(AI_MODELS.GEMINI.FLASH)

  const { text } = await generateText({
    model,
    system: CODE_SIMULATOR_SYSTEM,
    prompt: `Language: ${language}\n\nCode:\n${code}`,
  })

  return text
}
