import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

export const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'missing_key')
export const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'missing_key' })

export async function generateText(prompt: string, provider: 'gemini' | 'openai' = 'gemini'): Promise<string> {
  if (provider === 'gemini') {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } else {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    })
    return response.choices[0]?.message?.content || ''
  }
}
