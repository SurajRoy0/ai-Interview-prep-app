import { CoreMessage } from 'ai'

export interface TurnData {
  role: 'AI' | 'USER'
  question?: string | null
  answer?: string | null
}

export function buildConversationHistory(turns: TurnData[], newAnswer: string): CoreMessage[] {
  const messages: CoreMessage[] = []

  for (const turn of turns) {
    if (turn.role === 'AI' && turn.question) {
      messages.push({ role: 'assistant', content: turn.question })
    } else if (turn.role === 'USER' && turn.answer) {
      messages.push({ role: 'user', content: turn.answer })
    }
  }

  // Add the new answer as the final user message
  messages.push({ role: 'user', content: newAnswer })

  return messages
}

export function parseAITurnResponse(fullText: string) {
  // Often LLMs wrap JSON in markdown blocks
  let jsonStr = fullText.trim()
  if (jsonStr.startsWith('\`\`\`json')) {
    jsonStr = jsonStr.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim()
  } else if (jsonStr.startsWith('\`\`\`')) {
    jsonStr = jsonStr.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim()
  }

  try {
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('[Engine] Failed to parse AI turn response:', jsonStr)
    // Return a fallback so the interview doesn't crash completely,
    // though in production this should perhaps be handled by structured output options in Vercel AI
    return {
      question: "Could you elaborate on that?",
      category: "CONCEPTUAL",
      difficulty: "MEDIUM",
      psychologicalIntent: "DEPTH_PROBE",
      targetSkills: [],
      suggestedInputMode: "VOICE",
      isFollowUp: true,
      followUpReason: "parse_error",
      previousAnswerScore: null,
      topicScored: null
    }
  }
}
