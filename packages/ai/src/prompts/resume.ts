export interface ResumeParserOptions {
  parseFullResume: boolean
  maxProjectsToExtract: number
  maxSkillsPerCategory: number
  maxExperienceYears: number
}

export function buildResumeParseSystemPrompt(jobTargetRole: string, options: ResumeParserOptions): string {
  let instruction = `You are an expert technical recruiter and resume parser.
You are given the raw, unformatted text extracted from a candidate's resume, and their target role: "${jobTargetRole}".
Extract all available details into the structured JSON schema.

RULES:
1. Do not invent information. If something is missing, leave it as null or an empty array.
2. Group technologies into languages, frameworks, and tools accurately.
3. For "suggestedEcosystem", guess the primary backend/frontend ecosystem based on the resume skills (JAVASCRIPT, PYTHON, JAVA, GO). If it doesn't fit, use OTHER. If you aren't sure, return null.
4. Keep experience descriptions concise but include the main accomplishments.`

  if (options.parseFullResume) {
    instruction += `\n5. Extract absolutely everything you can find comprehensively.`
  } else {
    instruction += `\n5. Extract a maximum of ${options.maxProjectsToExtract} projects. ` +
                   `Extract a maximum of ${options.maxSkillsPerCategory} skills per category (languages, frameworks, tools). ` +
                   `Ignore any work experience older than ${options.maxExperienceYears} years.`
  }

  return instruction
}
