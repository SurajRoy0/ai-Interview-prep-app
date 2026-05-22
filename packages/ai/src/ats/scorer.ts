import { generateText, safeParseJSON, clampScore } from '../index.js'
import type { ParsedResumeData, AtsFeedback } from '@repo/shared'

const SYSTEM_PROMPT = `You are a ruthless but fair Applicant Tracking System (ATS) evaluator at a top-tier tech company.
You will be given a candidate's structured resume JSON and the specific Job Role they are applying for.

Your task is to evaluate the resume against the job role and output a JSON report strictly matching this TypeScript interface:

interface AtsFeedback {
  overallScore: number // 0-100
  keywordScore: number // 0-100
  structureScore: number // 0-100
  impactScore: number // 0-100
  readabilityScore: number // 0-100
  strengths: string[] // 3-5 bullet points
  criticalIssues: string[] // 1-3 major red flags or missing things
  suggestions: string[] // Actionable advice to improve the resume
  missingKeywords: string[] // Keywords expected for this role but missing
  overallSummary: string // 2-3 sentences summarizing their fit
}

IMPORTANT RULES:
1. DO NOT wrap the JSON in Markdown formatting (do NOT use \`\`\`json).
2. Scores must be strict integers between 0 and 100.
3. Be brutally honest about missing keywords for the specific target role.
`

export async function generateAtsReport(parsedData: ParsedResumeData, targetRole: string): Promise<AtsFeedback> {
  const prompt = `${SYSTEM_PROMPT}\n\nTarget Job Role: ${targetRole}\n\nResume JSON Data:\n${JSON.stringify(parsedData, null, 2)}`
  
  const result = await generateText(prompt, 'gemini')
  const parsed = safeParseJSON<AtsFeedback>(result)
  
  if (!parsed) {
    throw new Error('AI returned invalid JSON structure during ATS scoring')
  }

  // Ensure scores are within 0-100 bounds just in case the AI hallucinates
  parsed.overallScore = clampScore(parsed.overallScore)
  parsed.keywordScore = clampScore(parsed.keywordScore)
  parsed.structureScore = clampScore(parsed.structureScore)
  parsed.impactScore = clampScore(parsed.impactScore)
  parsed.readabilityScore = clampScore(parsed.readabilityScore)

  return parsed
}
