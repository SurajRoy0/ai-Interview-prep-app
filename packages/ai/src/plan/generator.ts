import { generateObject } from 'ai'
import { AI_MODELS, getOpenAiModel } from '../client'
import { buildPlanGeneratorSystemPrompt, type PlanGeneratorOptions } from '../prompts/plan'
import { interviewPlanSchema, type InterviewPlan, type ParsedResume } from '@repo/shared'

export async function generateInterviewPlanWithAI(
  targetRole: string,
  experienceLevel: string,
  resumeData: ParsedResume,
  options: PlanGeneratorOptions
): Promise<InterviewPlan> {
  const model = getOpenAiModel(AI_MODELS.OPENAI.MINI)
  const { object } = await generateObject({
    model,
    schema: interviewPlanSchema,
    system: buildPlanGeneratorSystemPrompt(targetRole, experienceLevel, resumeData, options),
    prompt: `Generate the interview plan for the candidate. Ensure you generate exactly ${options.targetTopics} topics.`,
    temperature: 0.2, // slight variation for better reasoning
  })

  return object satisfies InterviewPlan
}
