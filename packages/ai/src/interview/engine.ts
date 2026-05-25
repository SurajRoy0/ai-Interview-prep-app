import { streamText, type ModelMessage, type StreamTextOnFinishCallback, type ToolSet } from 'ai'
import { getGeminiModel, AI_MODELS } from '../client'
import {
  INTERVIEW_SYSTEM_PROMPT,
  buildCodeContext,
  buildResumeContext,
  type ResumeInterviewContext,
} from '../prompts/interview'

export type { ResumeInterviewContext }

export interface InterviewStreamOptions {
  codeContext?: { code: string; language: string }
  resumeContext?: ResumeInterviewContext
}

export async function streamInterviewTurn(
  messages: ModelMessage[],
  options: InterviewStreamOptions = {},
  onFinish?: StreamTextOnFinishCallback<ToolSet>
) {
  const model = getGeminiModel(AI_MODELS.GEMINI.FLASH)

  const systemParts: string[] = [INTERVIEW_SYSTEM_PROMPT]

  if (options.resumeContext) {
    systemParts.push(buildResumeContext(options.resumeContext))
  }

  if (options.codeContext?.code && options.codeContext.code.trim() !== '') {
    systemParts.push(buildCodeContext(options.codeContext.code, options.codeContext.language))
  }

  return streamText({
    model,
    system: systemParts.join(''),
    messages,
    onFinish,
  })
}
