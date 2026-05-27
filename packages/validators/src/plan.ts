import { z } from "zod"

export const planSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z0-9_-]+$/, "Name can only contain alphanumeric characters, underscores, and dashes"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional().nullable(),
  
  priceMonthlyPaise: z.coerce.number().min(0).optional().nullable(),
  priceYearlyPaise: z.coerce.number().min(0).optional().nullable(),
  billingInterval: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  
  interviewCredits: z.coerce.number().min(0).default(1),
  
  planConfigId: z.string().min(1, "Plan Config ID is required"),
  
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
})

export type PlanInput = z.infer<typeof planSchema>
export type PlanFormInput = z.input<typeof planSchema>
