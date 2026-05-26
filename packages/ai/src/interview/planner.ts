import { generateObject } from 'ai'
import { z } from 'zod'
import { getGeminiModel, AI_MODELS } from '../client'
import type { ResumeParsedData, InterviewPlan } from '@repo/shared'

const InterviewPlanSchema = z.object({
  targetRole: z.string(),
  ecosystem: z.string(),
  claimsToValidate: z.array(z.string()),
  activities: z.array(
    z.object({
      insertAfterTurn: z.number(),
      type: z.string(),
    })
  ),
  turns: z.array(
    z.object({
      category: z.string(),
      psychologicalIntent: z.string(),
      notes: z.string().optional(),
    })
  ),
})

export async function generateInterviewPlan(ctx: {
  jobProfile: { title: string; targetRole: string; ecosystem?: string | null; experienceLevel: string }
  resumeData: ResumeParsedData
}): Promise<InterviewPlan> {
  const { jobProfile, resumeData } = ctx

  const { object } = await generateObject({
    model: getGeminiModel(AI_MODELS.GEMINI.FLASH),
    schema: InterviewPlanSchema,
    prompt: `
You are an expert technical interviewer planning an interview.
Based on the candidate's resume and the target role, create an interview plan.

TARGET ROLE: ${jobProfile.targetRole} (${jobProfile.experienceLevel})
ECOSYSTEM: ${jobProfile.ecosystem ?? 'Unknown'}
CANDIDATE PROJECTS: ${(resumeData.projects || []).map(p => p.name).join(', ')}

Plan 8 turns (1 question per turn).
Include 1 activity (e.g. DEBUGGING, CODE_CORRECTION, SYSTEM_DESIGN_MINI).
`
  })

  return object as InterviewPlan
}
