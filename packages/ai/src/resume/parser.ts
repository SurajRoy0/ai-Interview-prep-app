import { generateText, safeParseJSON } from '../index.js'
import type { ParsedResumeData } from '@repo/shared'

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) parser. Your job is to extract data from raw resume text and output a highly structured JSON object.
You MUST output raw JSON that strictly conforms to the following TypeScript interface:

interface ParsedResumeData {
  skills: {
    frontend: string[]
    backend: string[]
    database: string[]
    tools: string[]
  }
  experience: Array<{
    company: string
    role: string
    duration: string
    highlights: string[]
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
}

IMPORTANT RULES:
1. DO NOT wrap the JSON in Markdown formatting (do NOT use \`\`\`json). Return exactly the raw JSON object and nothing else.
2. If a field is missing in the resume, return an empty array for lists, or an empty string for text fields.
3. Be smart about classifying skills into frontend, backend, database, and tools.
`

export async function parseResumeData(rawText: string): Promise<ParsedResumeData> {
  const prompt = `${SYSTEM_PROMPT}\n\nHere is the raw resume text:\n\n${rawText}`
  
  const result = await generateText(prompt, 'gemini')
  
  const parsed = safeParseJSON<ParsedResumeData>(result)
  
  if (!parsed) {
    throw new Error('AI returned invalid JSON structure during resume parsing')
  }
  
  return parsed
}
