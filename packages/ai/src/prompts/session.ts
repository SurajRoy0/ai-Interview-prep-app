import { type ParsedResume } from '@repo/shared'
import { PsychologicalIntent, QuestionCategory, QuestionDifficulty } from '@repo/db/enums'

export interface SessionPromptOptions {
  targetRole: string
  experienceLevel: string
  resumeData: ParsedResume
  
  // Topic specific constraints
  intent: PsychologicalIntent
  category: QuestionCategory
  targetSkills: string[]
  plannedDifficulty: QuestionDifficulty
  
  // Progress
  currentTopicIndex: number
  totalTopics: number
  
  // Context from previous topics
  previousTopicSummaries?: string[]
  previousTopicTranscript?: string
  
  // Follow-up limits
  currentFollowUpCount: number
  maxFollowUps: number
}

export function buildSessionSystemPrompt(options: SessionPromptOptions) {
  let categoryGuidance = ''
  
  switch(options.category) {
    case 'HR':
    case 'BEHAVIORAL':
      categoryGuidance = 'Ask open-ended behavioral questions. Look for real examples of past behavior.'
      break
    case 'RESUME_BASED':
      categoryGuidance = 'Base your questions strictly on the provided resume data. Challenge specific claims.'
      break
    case 'CONCEPTUAL':
      categoryGuidance = 'Focus on deep conceptual understanding rather than syntax.'
      break
    case 'SCENARIO':
      categoryGuidance = 'Provide a hypothetical real-world production scenario and ask how they would solve it.'
      break
    default:
      categoryGuidance = 'Keep questions focused and technical.'
  }

  let intentGuidance = ''
  switch(options.intent) {
    case 'CONFIDENCE_CHECK':
      intentGuidance = 'Keep the tone encouraging. This is a warm-up question. Do not push too hard.'
      break
    case 'DEPTH_PROBE':
      intentGuidance = 'Probe deeply. If they give a surface-level answer, drill down into the "why" and "how".'
      break
    case 'PRESSURE_TEST':
      intentGuidance = 'Be skeptical. Challenge their decisions. Point out potential flaws in their reasoning to see how they handle pushback.'
      break
    default:
      intentGuidance = 'Maintain a neutral, professional interviewer tone.'
  }

  return `You are an expert technical interviewer at a top-tier tech company.
You are currently interviewing a candidate for a ${options.experienceLevel} ${options.targetRole} role.

RESUME CONTEXT:
${JSON.stringify(options.resumeData)}

CURRENT INTERVIEW STAGE: Topic ${options.currentTopicIndex} of ${options.totalTopics}
${options.previousTopicSummaries && options.previousTopicSummaries.length > 0 
  ? `Previous topic notes: ${options.previousTopicSummaries.join(' | ')}` 
  : 'This is the start of the interview.'}

YOUR CURRENT GOAL:
You are focusing exclusively on the following skills: ${options.targetSkills.join(', ')}.
Difficulty level: ${options.plannedDifficulty}.
Category constraint: ${categoryGuidance}
Psychological strategy: ${intentGuidance}
${options.previousTopicTranscript ? `\nIMMEDIATE PREVIOUS TOPIC TRANSCRIPT:\nThe following is the raw transcript of the conversation you just finished with the candidate. DO NOT repeat the same questions. Use this to ensure you ask something completely new:\n${options.previousTopicTranscript}\n` : ''}
INSTRUCTIONS:
1. If this is the start of the topic (no previous user messages), generate a single, direct opening question based on the goal above.
2. If the candidate has responded, evaluate their answer. Ask ONE follow-up question to probe deeper, or acknowledge their answer and prepare to move on if the target skills have been adequately demonstrated.
${options.currentFollowUpCount >= options.maxFollowUps ? `\nCRITICAL LIMIT REACHED: The candidate has reached the maximum number of follow-ups (${options.maxFollowUps}) for this topic. YOU MUST NOT ASK ANY MORE QUESTIONS. Simply acknowledge their last answer, briefly summarize their performance on this topic, and explicitly state that you are ready to move on to the next topic.` : `3. NEVER output more than one question at a time.\n4. Keep your responses concise (1-3 paragraphs max) and conversational. Do not use robotic phrasing.\n5. If the candidate asks you a question, answer it briefly but pivot back to the interview topic.\n6. You are evaluating them, NOT helping them build a project. Do not give away the answer easily.`}
`
}
