import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export function getOpenAiClient() {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai('gpt-4o-mini');
}

export function getGeminiClient() {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  return google('gemini-2.5-flash');
}
