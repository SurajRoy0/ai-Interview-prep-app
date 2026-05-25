export const INTERVIEW_SYSTEM_PROMPT = `You are a brutally honest Principal Engineer conducting a technical mock interview.

Your behavior rules:
- Ask ONE question at a time. Wait for the candidate's answer before asking the next.
- Start by greeting the candidate and asking them to introduce themselves briefly.
- After the intro, dive into technical questions based on the candidate's resume and the target role.
- Ask deep follow-up questions based on what the candidate says — probe further on anything vague.
- Give coding tasks when relevant (ask them to write code in the editor on the right).
- Evaluate code they submit: give direct, honest feedback on correctness, efficiency, and style.
- Be concise — keep responses to 2-4 sentences max to emulate a fast-paced spoken conversation.
- Do NOT compliment unnecessarily. Be professional and direct.
- Score internally but never reveal scores mid-interview.`

export function buildCodeContext(code: string, language: string): string {
  if (!code || code.trim() === '') return ''
  return `\n\nThe candidate has written the following code in the ${language} editor:\n\`\`\`${language}\n${code}\n\`\`\`\nIf the code is relevant to your question, give direct feedback on it.`
}

export function buildResumeContext(resumeContext: ResumeInterviewContext): string {
  const { targetRole, experienceLevel, basics, skills, experience } = resumeContext

  const skillsText = [
    skills.languages.length ? `Languages: ${skills.languages.join(', ')}` : '',
    skills.frameworks.length ? `Frameworks: ${skills.frameworks.join(', ')}` : '',
    skills.tools.length ? `Tools: ${skills.tools.join(', ')}` : '',
  ].filter(Boolean).join(' | ')

  const recentExp = experience
    .slice(0, 3)
    .map(e => `${e.role} at ${e.company} (${e.startDate ?? '?'} – ${e.endDate ?? 'present'}): ${e.description}`)
    .join('\n- ')

  const name = basics.name ?? 'the candidate'

  return `\n\n--- CANDIDATE CONTEXT (use this to ask relevant questions) ---
Candidate: ${name}
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Technical Skills: ${skillsText || 'Not specified'}
Recent Experience:
- ${recentExp || 'No experience listed'}
Summary: ${basics.summary ?? 'Not provided'}
--- END CANDIDATE CONTEXT ---`
}

export interface ResumeInterviewContext {
  targetRole: string
  experienceLevel: string
  basics: {
    name: string | null
    email: string | null
    phone: string | null
    summary: string | null
  }
  skills: {
    languages: string[]
    frameworks: string[]
    tools: string[]
  }
  experience: {
    company: string
    role: string
    startDate: string | null
    endDate: string | null
    description: string
    technologies: string[]
  }[]
}
