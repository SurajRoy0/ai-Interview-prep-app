import { z } from 'zod'

export const createJobProfileSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  targetRole: z.string().min(2, "Target role is required").max(100),
  description: z.string().optional(),
  experienceLevel: z.enum(['FRESHER', 'JUNIOR', 'MID', 'SENIOR']),
  ecosystem: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER']).optional(),
})
