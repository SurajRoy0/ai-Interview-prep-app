import { generateText } from 'ai'
import { getOpenAiModel, AI_MODELS } from '../client'
import { getCodeSimulatorSystemPrompt } from '../prompts/interview'

export async function simulateCodeExecution(code: string, language: string): Promise<string> {
  const { text } = await generateText({
    model: getOpenAiModel(AI_MODELS.OPENAI.MINI),
    system: getCodeSimulatorSystemPrompt(),
    prompt: `Language: ${language}\n\nCode:\n${code}`,
  })

  return text
}
