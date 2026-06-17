import { z } from 'zod'
import { PsychologicalIntent, QuestionCategory, QuestionDifficulty, ActivityType } from '@repo/db/enums'

export const interviewPlanTopicSchema = z.object({
  intent: z.nativeEnum(PsychologicalIntent),
  category: z.nativeEnum(QuestionCategory),
  activityType: z.nativeEnum(ActivityType).nullish().describe('Required when category is ACTIVITY; omit for all other categories'),
  targetSkills: z.array(z.string()).describe('Specific skills to assess'),
  plannedDifficulty: z.nativeEnum(QuestionDifficulty),
  reasoning: z.string().describe('Why this topic was chosen based on the resume or job profile'),
}).superRefine((topic, ctx) => {
  if (topic.category === QuestionCategory.ACTIVITY && topic.activityType == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'activityType is required when category is ACTIVITY',
      path: ['activityType'],
    })
  }
})

export const interviewPlanSchema = z.object({
  topics: z.array(interviewPlanTopicSchema),
})

export type InterviewPlanTopic = z.infer<typeof interviewPlanTopicSchema>
export type InterviewPlan = z.infer<typeof interviewPlanSchema>
