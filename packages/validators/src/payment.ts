import { z } from 'zod'

export const createOrderSchema = z.object({
  planName: z.string().min(1),
})
