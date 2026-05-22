export interface ParsedResumeData {
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

export interface AtsFeedback {
  overallScore: number
  keywordScore: number
  structureScore: number
  impactScore: number
  readabilityScore: number
  strengths: string[]
  criticalIssues: string[]
  suggestions: string[]
  missingKeywords: string[]
  overallSummary: string
}
