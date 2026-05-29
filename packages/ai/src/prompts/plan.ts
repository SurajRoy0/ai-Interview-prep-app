import { type ParsedResume } from '@repo/shared'

/*
 * ============================================================================
 * REFERENCE: Plan Config (Available in planConfigSnapshot)
 * ============================================================================
 * The worker passes 'targetTurns' from the config to this generator.
 * Other fields in the config are used across the platform:
 * 
 * {
 *   targetTurns: 8,                  // How many total topics to generate (Used here in Plan Generator)
 *   activityConfig: { ... },         // How many coding/debugging tasks to inject (Used in Phase 2 Plan Generator)
 *   questionTimeSecs: 120,           // The countdown timer for each topic (Used in Live Session UI)
 *   followUpTimeSecs: 90,            // Extra time granted if AI asks a follow up (Used in Live Session Action)
 *   clarificationTimeSecs: 30,       // Extra time granted if User asks a clarifying question (Used in Live Session Action)
 *   allowedDifficultyModes: [...],   // Modes the user is allowed to pick in the UI (e.g. 'GRADUAL', 'INTENSIVE')
 *   questionGenMode: 'HYBRID',       // Tells the Session Engine to generate the exact question text live, not here
 *   reportDepth: 'STANDARD'          // How detailed the final PDF report should be (Used in Report Generator)
 * }
 * ============================================================================
 */

export interface PlanGeneratorOptions {
  targetTopics: number
  interviewType: string
  allowActivities?: boolean
  activityConfig?: Record<string, number>
}

export function buildPlanGeneratorSystemPrompt(
  targetRole: string,
  experienceLevel: string,
  resumeData: ParsedResume,
  options: PlanGeneratorOptions
) {
  let focusInstruction = ''
  switch (options.interviewType) {
    case 'HR':
      focusInstruction = 'Focus EXCLUSIVELY on HR, BEHAVIORAL, and SCENARIO categories. Do NOT generate conceptual topics.'
      break
    case 'TECHNICAL':
      focusInstruction = 'Focus EXCLUSIVELY on CONCEPTUAL, RESUME_BASED, SCENARIO, and SYSTEM_DESIGN categories. Do NOT generate HR questions.'
      break
    case 'SYSTEM_DESIGN':
      focusInstruction = 'Focus EXCLUSIVELY on CONCEPTUAL and SYSTEM_DESIGN categories focusing on Architecture and scaling. Every question should relate to high-level design.'
      break
    case 'BEHAVIORAL':
      focusInstruction = 'Focus EXCLUSIVELY on BEHAVIORAL and SCENARIO categories. Explore past experiences and conflict resolution.'
      break
    default:
      focusInstruction = 'Create a balanced FULL interview. Mix HR, BEHAVIORAL, CONCEPTUAL, and RESUME_BASED questions.'
  }

  const baseCategories = ['HR', 'RESUME_BASED', 'CONCEPTUAL', 'SCENARIO', 'BEHAVIORAL', 'SYSTEM_DESIGN']
  let activityInstruction = ''

  if (options.allowActivities && options.activityConfig) {
    baseCategories.push('ACTIVITY')
    const configEntries = Object.entries(options.activityConfig).filter(([_, count]) => count > 0)
    if (configEntries.length > 0) {
      const requirements = configEntries.map(([type, count]) => `exactly ${count} topic(s) with activityType "${type}"`).join(', ')
      activityInstruction = `\nACTIVITY REQUIREMENT: You MUST generate ${requirements}. For these specific topics, you must set "category": "ACTIVITY", set "activityType" to the required value, and explicitly set "intent" to "CHALLENGE".`
    }
  }

  return `You are an expert technical interviewer planning a mock interview.
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Interview Focus Type: ${options.interviewType}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Generate exactly ${options.targetTopics} interview topics.
Structure the interview progressively. Start with an EXPLORE intent, then move into VALIDATE and CHALLENGE based on their strongest resume claims. 

CRITICAL INSTRUCTION: ${focusInstruction}${activityInstruction}
Ensure the categories match the standard QuestionCategory enum exactly. 
Valid Categories: ${baseCategories.join(', ')}.
Valid Intents: EXPLORE, VALIDATE, CHALLENGE.`
}