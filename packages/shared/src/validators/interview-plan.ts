import { z } from 'zod'
import { PsychologicalIntent, QuestionCategory, QuestionDifficulty, ActivityType } from '@repo/db/enums'

export const interviewPlanTopicSchema = z.object({
  intent: z.nativeEnum(PsychologicalIntent),
  category: z.nativeEnum(QuestionCategory),
  activityType: z.nativeEnum(ActivityType).optional().describe('Must be provided if category is ACTIVITY'),
  targetSkills: z.array(z.string()).describe('Specific skills to assess'),
  plannedDifficulty: z.nativeEnum(QuestionDifficulty),
  reasoning: z.string().describe('Why this topic was chosen based on the resume or job profile'),
})

export const interviewPlanSchema = z.object({
  topics: z.array(interviewPlanTopicSchema),
})

export type InterviewPlanTopic = z.infer<typeof interviewPlanTopicSchema>
export type InterviewPlan = z.infer<typeof interviewPlanSchema>
