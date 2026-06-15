import { generateObject } from 'ai'
import { z } from 'zod'
import { getOpenAiModel, AI_MODELS } from '../client'

export async function generateActivitySnippet(
  activityType: string,
  targetSkills: string[],
  plannedDifficulty: string,
  ecosystem: string
) {
  const { object } = await generateObject({
    model: getOpenAiModel(AI_MODELS.OPENAI.MINI),
    schema: z.object({
      codeSnippet: z.string().describe("The source code string that will be shown in the code editor to the candidate. Keep it concise (15-30 lines)."),
      expectedAnswer: z.string().describe("The ideal correct answer, bug fix, or prediction. This is for the AI judge and will NOT be shown to the candidate.")
    }),
    system: `You are an expert technical interviewer creating a code activity for a candidate.
Activity Type: ${activityType}
Target Skills: ${targetSkills.join(', ')}
Difficulty: ${plannedDifficulty}
Ecosystem: ${ecosystem}

Instructions:
1. Generate a concise, realistic code snippet.
2. If Activity Type is "DEBUGGING", introduce a subtle but realistic bug.
3. If Activity Type is "CODE_CORRECTION", provide code that is missing a crucial piece or is fundamentally flawed but fixable.
4. If Activity Type is "OUTPUT_PREDICTION", provide tricky code where the candidate must guess what it prints or returns.
5. Provide the "expectedAnswer" explaining what the candidate should identify, fix, or output.
`,
    prompt: "Generate the code snippet and expected answer for the activity.",
    temperature: 0.2,
  })

  return object
}
