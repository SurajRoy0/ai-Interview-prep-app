import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getGeminiClient } from '../client'
import { ResumeParsedData } from '@repo/shared'

const resumeParseSchema = z.object({
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

export async function parseResumeWithAI(rawText: string, jobTargetRole: string): Promise<ResumeParsedData> {
  const model = getGeminiClient()
  if (!model) {
    throw new Error('AI client not configured')
  }

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: resumeParseSchema,
    }),
    system: `You are an expert technical recruiter and resume parser.
You are given the raw, unformatted text extracted from a candidate's resume, and their target role: "${jobTargetRole}".
Extract all available details into the structured JSON schema.

RULES:
1. Do not invent information. If something is missing, leave it as null or an empty array.
2. Group technologies into languages, frameworks, and tools accurately.
3. For "suggestedEcosystem", guess the primary backend/frontend ecosystem based on the resume skills (JAVASCRIPT, PYTHON, JAVA, GO). If it doesn't fit, use OTHER. If you aren't sure, return null.
4. Keep experience descriptions concise but include the main accomplishments.`,
    prompt: `Parse the following resume text:\n\n${rawText}`,
    temperature: 0,
  })

  return output as ResumeParsedData
}
