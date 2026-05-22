import { z } from 'zod'

export const resumeUploadSchema = z.object({
  targetRole: z.string().min(2, "Target role is required"),
})

// Ensures the AI's JSON output matches our ParsedResumeData interface exactly
export const parsedResumeSchema = z.object({
  skills: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    database: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    highlights: z.array(z.string()),
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })),
})
