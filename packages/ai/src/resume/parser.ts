import { generateObject } from 'ai'
import { z } from 'zod'
import { getGeminiModel } from '../client'
import { buildResumeParseSystemPrompt } from '../prompts/resume'
import type { ResumeParsedData } from '@repo/shared'

export const resumeParseSchema = z.object({
  basics: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    summary: z.string().nullable(),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.string().nullable(),
  })),
  skills: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  suggestedEcosystem: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER']).nullable(),
})

export type ParsedResume = z.infer<typeof resumeParseSchema>

export async function parseResumeWithAI(rawText: string, jobTargetRole: string): Promise<ResumeParsedData> {
  const model = getGeminiModel()

  const { object } = await generateObject({
    model,
    schema: resumeParseSchema,
    system: buildResumeParseSystemPrompt(jobTargetRole),
    prompt: `Parse the following resume text:\n\n${rawText}`,
    temperature: 0,
  })

  return object satisfies ResumeParsedData
}
