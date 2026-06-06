import { streamText } from 'ai'
import { getOpenAiModel } from '../client'
import { getOpeningQuestionPrompt, getFollowUpPrompt, buildContextPrompt } from '../prompts/session'
import type { InterviewTopic, TopicTurn } from '@repo/db'

export async function generateOpeningQuestion(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  previousTopics: (InterviewTopic & { turns: TopicTurn[] })[]
) {
  const contextPrompt = buildContextPrompt(previousTopics)
  const systemPrompt = getOpeningQuestionPrompt(candidateProfile, plannedTopic, contextPrompt)

  const result = streamText({
    model: getOpenAiModel(),
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Begin the topic.' }],
  })

  return result
}

export async function generateFollowUp(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  previousTopics: (InterviewTopic & { turns: TopicTurn[] })[],
  currentTopicTurns: TopicTurn[],
  maxFollowUpsReached: boolean
) {
  const contextPrompt = buildContextPrompt(previousTopics)
  const systemPrompt = getFollowUpPrompt(candidateProfile, plannedTopic, contextPrompt, currentTopicTurns, maxFollowUpsReached)

  // We use streamText but guide the AI to output exactly the streamable content.
  // We can use structured outputs via tools if we want to extract moveToNext, 
  // but since we want to stream text primarily, we will have a single tool 
  // that the AI must call, or we ask it to return a specific JSON chunk at the end.
  // Actually, Vercel AI SDK streamText can stream text and also call tools!
  
  // To keep it simple and ensure fast streaming, we will instruct the AI to stream the text,
  // and we'll use a tool to indicate transition if needed.
  // Let's configure a tool 'submit_evaluation' that it MUST call to set metadata, 
  // or we can just infer `moveToNext` based on the tool called.

  const result = streamText({
    model: getOpenAiModel(),
    system: systemPrompt,
    messages: [{ role: 'user', content: 'The candidate just answered. Provide your next response.' }],
  })

  return result
}
