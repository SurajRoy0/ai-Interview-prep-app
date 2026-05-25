import { generateObject } from 'ai'
import { z } from 'zod'
import { getGeminiModel, AI_MODELS } from '../client'
import { REPORT_SYSTEM_PROMPT } from '../prompts/report'
import { clamp } from '../utils'

export const interviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  feedback: z.string().describe("A 2-3 paragraph summary of the candidate's performance, what they did well, and what they completely failed at."),
  strongTopics: z.array(z.string()).describe("List of topics the candidate excelled at"),
  weakTopics: z.array(z.string()).describe("List of topics the candidate needs to study more"),
})

export type InterviewReportResult = z.infer<typeof interviewReportSchema>

export async function generateInterviewReport(transcript: string): Promise<InterviewReportResult> {
  const model = getGeminiModel(AI_MODELS.GEMINI.FLASH)

  const { object } = await generateObject({
    model,
    schema: interviewReportSchema,
    system: REPORT_SYSTEM_PROMPT,
    prompt: `Evaluate the following interview transcript:\n\n${transcript}`,
    temperature: 0,
  })

  return {
    ...object,
    overallScore: clamp(object.overallScore),
    technicalScore: clamp(object.technicalScore),
    communicationScore: clamp(object.communicationScore),
  }
}
