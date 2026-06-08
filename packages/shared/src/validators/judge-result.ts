import { z } from 'zod'

export const judgeResultSchema = z.object({
  // Maximum 2 sentence summary used as future topic context
  judgeSummary: z
    .string()
    .min(1)
    .max(500),

  // Overall topic score
  judgeScore: z
    .number()
    .int()
    .min(0)
    .max(100),

  // Demonstrated strengths
  judgeStrengths: z
    .array(z.string().min(1))
    .max(5),

  // Knowledge gaps / weaknesses
  judgeWeaknesses: z
    .array(z.string().min(1))
    .max(5),
})

export type JudgeResult = z.infer<typeof judgeResultSchema>