import { generateObject } from "ai";
import { AI_MODELS, getOpenAiModel } from "../client";

import { judgeResultSchema, type JudgeResult } from "@repo/shared";

import { buildJudgeSystemPrompt } from "../prompts/judge";

export async function evaluateTopicWithAI(
  topic: {
    intent: string;
    category: string;
    reasoning?: string;
    activityType?: string | null;
    targetSkills: string[];
    plannedDifficulty: string;
  },
  transcript: {
    role: "AI" | "USER";
    content: string;
  }[],
): Promise<JudgeResult> {
  const model = getOpenAiModel(AI_MODELS.OPENAI.MINI);

  const { object } = await generateObject({
    model,

    schema: judgeResultSchema,

    system: buildJudgeSystemPrompt(topic, transcript),

    prompt: JSON.stringify({
      topic,
      transcript,
    }),

    temperature: 0.2,
  });

  return object;
}
