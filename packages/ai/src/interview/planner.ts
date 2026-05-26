import { generateObject } from 'ai'
import { z } from 'zod'
import { getOpenAiModel, AI_MODELS } from '../client'
import { buildInterviewPlannerPrompt } from '../prompts/interview'
import {
  QUESTION_CATEGORIES,
  PSYCHOLOGICAL_INTENTS,
  ACTIVITY_TYPES,
} from '@repo/shared'
import type { ResumeParsedData, InterviewPlan } from '@repo/shared'

export const InterviewPlanSchema = z.object({
  targetRole: z.string().describe('Target job role title'),
  ecosystem: z.string().describe('Primary tech stack ecosystem'),
  claimsToValidate: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe('Specific resume claims to challenge during the interview'),
  activities: z
    .array(
      z.object({
        insertAfterTurn: z
          .number()
          .int()
          .min(1)
          .max(7)
          .describe('Turn index after which this activity runs (1-based)'),
        type: z
          .enum(ACTIVITY_TYPES)
          .describe('Activity type — must be one of the allowed activity enum values'),
      })
    )
    .length(1),
  turns: z
    .array(
      z.object({
        category: z
          .enum(QUESTION_CATEGORIES)
          .describe(
            'Question category — MUST be exactly one enum value. Never use TECHNICAL, CODING, or other invented labels.'
          ),
        psychologicalIntent: z
          .enum(PSYCHOLOGICAL_INTENTS)
          .describe('Interviewer intent for this turn — MUST be one enum value'),
        notes: z
          .string()
          .optional()
          .describe('Brief interviewer note: topic or resume project to reference'),
      })
    )
    .length(8),
})

export type GeneratedInterviewPlan = z.infer<typeof InterviewPlanSchema>

export async function generateInterviewPlan(ctx: {
  jobProfile: { title: string; targetRole: string; ecosystem?: string | null; experienceLevel: string }
  resumeData: ResumeParsedData
}): Promise<InterviewPlan> {
  const { jobProfile, resumeData } = ctx

  const skills = [
    ...(resumeData.skills?.languages ?? []),
    ...(resumeData.skills?.frameworks ?? []),
    ...(resumeData.skills?.tools ?? []),
  ].slice(0, 12)

  const { object } = await generateObject({
    model: getOpenAiModel(AI_MODELS.OPENAI.MINI),
    schema: InterviewPlanSchema,
    prompt: buildInterviewPlannerPrompt({
      targetRole: jobProfile.targetRole,
      experienceLevel: jobProfile.experienceLevel,
      ecosystem: jobProfile.ecosystem ?? 'Unknown',
      projectNames: (resumeData.projects || []).map((p) => p.name),
      skills,
    }),
  })

  return object as InterviewPlan
}
