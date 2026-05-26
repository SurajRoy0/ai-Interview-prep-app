import { generateObject } from 'ai'
import { getOpenAiModel, AI_MODELS } from '../client'
import { buildReportPrompt } from '../prompts/report'
import { z } from 'zod'
import { InterviewPlan } from '@repo/shared'

const ReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  feedback: z.string(),
  strongTopics: z.array(z.string()),
  weakTopics: z.array(z.string())
})

export type GeneratedReport = z.infer<typeof ReportSchema>

export async function generateInterviewReport(ctx: {
  targetRole: string
  transcript: string
  interviewPlan: InterviewPlan
}): Promise<GeneratedReport> {
  const { object } = await generateObject({
    model: getOpenAiModel(AI_MODELS.GEMINI.PRO),
    schema: ReportSchema,
    prompt: buildReportPrompt(ctx),
    temperature: 0.2
  })

  return object
}
