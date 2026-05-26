import { z } from 'zod'

export const createInterviewSchema = z.object({
  jobProfileId: z.string().min(1, 'Job profile ID is required'),
  resumeId: z.string().min(1, 'Resume ID is required'),
  type: z.enum(['MOCK', 'TECHNICAL', 'HR', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FULL']),
  mode: z.enum(['TEXT', 'VOICE', 'MIXED']),
  interviewFormat: z.string().min(1),
})

export const submitTurnSchema = z.object({
  interviewId: z.string().min(1),
  answer: z.string(),
  inputMode: z.string(),
})

export type SubmitTurnInput = z.infer<typeof submitTurnSchema>

export const activityResponseSchema = z.object({
  title: z.string(),
  prompt: z.string(),
  codeSnippet: z.string().optional(),
  requiresCodeEditor: z.boolean(),
  codeEditable: z.boolean(),
  requiresTextInput: z.boolean(),
})

export type ActivityResponseData = z.infer<typeof activityResponseSchema> & {
  activityId: string
  type: string
}
