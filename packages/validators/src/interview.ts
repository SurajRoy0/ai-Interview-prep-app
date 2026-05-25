import { z } from 'zod'

export const createInterviewSchema = z.object({
  jobProfileId: z.string().min(1, "Job profile ID is required"),
  resumeId: z.string().min(1, "Resume ID is required"),
  type: z.enum(['MOCK', 'TECHNICAL', 'HR', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FULL']),
  mode: z.enum(['TEXT', 'VOICE', 'MIXED']),
  interviewFormat: z.string().min(1),
})

export const submitTurnSchema = z.object({
  interviewId: z.string().min(1),
  turnIndex: z.number().int().min(0),
  
  answer: z.string().optional().nullable(),
  audioKey: z.string().optional().nullable(),
  
  latencyMs: z.number().int().optional(),
})

export const completeActivitySchema = z.object({
  interviewId: z.string().min(1),
  activityIndex: z.number().int().min(0),
  
  candidateCodeAnswer: z.string().optional().nullable(),
  candidateVoiceAnswer: z.string().optional().nullable(),
  candidateTextAnswer: z.string().optional().nullable(),
})
