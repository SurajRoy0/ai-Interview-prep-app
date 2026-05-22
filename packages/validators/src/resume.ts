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
