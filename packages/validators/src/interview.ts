import { z } from 'zod'

export const onboardingSchema = z.object({
  experienceLevel: z.enum(['FRESHER', 'JUNIOR', 'MID', 'SENIOR']),
  targetRole: z.string().min(2, "Role is required"),
  ecosystem: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER']),
})

export const turnEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  confidence: z.enum(['WEAK', 'IMPROVING', 'STRONG']),
  topic: z.string(),
})
