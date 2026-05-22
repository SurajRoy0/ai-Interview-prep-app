import { z } from 'zod'

export const createInterviewSchema = z.object({
  resumeId: z.string().min(1),
  type: z.enum(['FREE', 'PAID', 'PREMIUM']),
})
