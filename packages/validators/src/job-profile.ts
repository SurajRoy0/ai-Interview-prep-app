import { z } from 'zod'

export const createProfileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  targetRole: z.string().min(1, 'Target role is required'),
  experienceLevel: z.enum(['FRESHER', 'JUNIOR', 'MID', 'SENIOR']),
  ecosystem: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER']).optional(),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>
