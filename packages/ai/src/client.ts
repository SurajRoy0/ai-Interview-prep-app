import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

const geminiProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const AI_MODELS = {
  GEMINI: {
    FLASH: 'gemini-2.5-flash',
    PRO: 'gemini-2.5-pro',
  },
  OPENAI: {
    MINI: 'gpt-4o-mini',
    STANDARD: 'gpt-4o',
    O3_MINI: 'o3-mini',
  },
  ANTHROPIC: {
    SONNET: 'claude-sonnet-4-5',
    OPUS: 'claude-opus-4-7',
    HAIKU: 'claude-haiku-4-5',
  },
} as const

export function getGeminiModel(modelName: string = AI_MODELS.GEMINI.FLASH) {
  return geminiProvider(modelName)
}

export function getOpenAiModel(modelName: string = AI_MODELS.OPENAI.MINI) {
  return openaiProvider(modelName)
}

export function getClaudeModel(modelName: string = AI_MODELS.ANTHROPIC.SONNET) {
  return anthropicProvider(modelName)
}
