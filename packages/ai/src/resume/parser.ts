import { generateObject } from 'ai'
import { AI_MODELS, getOpenAiModel } from '../client'
import { buildResumeParseSystemPrompt, type ResumeParserOptions } from '../prompts/resume'

import { resumeParseSchema, type ParsedResume } from '@repo/shared'

export async function parseResumeWithAI(rawText: string, jobTargetRole: string, options: ResumeParserOptions): Promise<ParsedResume> {
  const model = getOpenAiModel(AI_MODELS.OPENAI.MINI)
  const { object } = await generateObject({
    model,
    schema: resumeParseSchema,
    system: buildResumeParseSystemPrompt(jobTargetRole, options),
    prompt: `Parse the following resume text:\n\n${rawText}`,
    temperature: 0,
  })

  return object satisfies ParsedResume
}
