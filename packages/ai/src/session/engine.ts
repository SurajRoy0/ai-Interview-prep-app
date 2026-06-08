import { streamText } from 'ai'
import { getOpenAiModel } from '../client'
import {
  getOpeningQuestionPrompt,
  getFollowUpPrompt,
  buildContextPrompt,
} from '../prompts/session'

import type { InterviewTopic, TopicTurn } from '@repo/db'

export async function generateOpeningQuestion(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
    previousTopics: (InterviewTopic & { turns: TopicTurn[] })[]
) {
  const contextPrompt = buildContextPrompt(previousTopics)

  const systemPrompt = getOpeningQuestionPrompt(
    candidateProfile,
    plannedTopic,
    contextPrompt,
  )

  const result = streamText({
    model: getOpenAiModel(),
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: 'Begin the topic.',
      },
    ],
  })

  return result
}

export async function generateFollowUp(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  previousTopics: (InterviewTopic & { turns: TopicTurn[] })[],
  currentTopicTurns: TopicTurn[],
  maxFollowUpsReached: boolean,
) {
  const contextPrompt = buildContextPrompt(previousTopics)

  const systemPrompt = getFollowUpPrompt(
    candidateProfile,
    plannedTopic,
    contextPrompt,
    currentTopicTurns,
    maxFollowUpsReached,
  )

  const result = streamText({
    model: getOpenAiModel(),
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: 'The candidate just answered. Provide your next response.',
      },
    ],
  })

  return result
}