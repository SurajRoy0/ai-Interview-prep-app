import { z } from 'zod'

export const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const MAX_RESUME_BYTES = 5 * 1024 * 1024

export const resumeUploadSchema = z.object({
  title: z.string().optional(),
})

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>

export function validateResumeFile(file: { type: string; size: number }) {
  if (!ALLOWED_RESUME_MIME_TYPES.includes(file.type as (typeof ALLOWED_RESUME_MIME_TYPES)[number])) {
    return { ok: false as const, error: 'INVALID_FILE_TYPE' as const }
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false as const, error: 'FILE_TOO_LARGE' as const }
  }
  return { ok: true as const }
}

export const resumeParseSchema = z.object({
  basics: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    summary: z.string().nullable(),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.string().nullable(),
  })),
  skills: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  suggestedEcosystem: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER']).nullable(),
})

export type ParsedResume = z.infer<typeof resumeParseSchema>
