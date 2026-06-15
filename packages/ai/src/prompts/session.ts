import type { InterviewTopic, TopicTurn } from '@repo/db'

export function buildContextPrompt(
  previousTopics: (InterviewTopic & { turns: TopicTurn[] })[]
) {
  let context = '### CONVERSATION CONTEXT FROM PREVIOUS TOPICS\n\n'

  if (previousTopics.length === 0) {
    return context + 'No previous topics. This is the first question.\n'
  }

  for (const topic of previousTopics) {
    context += `#### Topic ${topic.topicIndex}: ${topic.plannedCategory || 'General'}\n`
    
    if (topic.judgeSummary) {
      context += `[Judge Summary]: ${topic.judgeSummary}\n\n`
    } else {
      context += `[Judge Summary Pending]: The judge is currently evaluating this topic. Here is the raw transcript:\n`
      for (const turn of topic.turns) {
        context += `${turn.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${turn.content}\n`
      }
      context += '\n'
    }
  }

  return context
}

export function getOpeningQuestionPrompt(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  contextPrompt: string
) {
  return `
You are a senior technical interviewer conducting a mock interview for the candidate.

### CANDIDATE PROFILE
Target Role: ${candidateProfile.targetRole}
Experience Level: ${candidateProfile.experienceLevel}
Resume Data: ${JSON.stringify(candidateProfile.parsedData)}

${contextPrompt}

### CURRENT TOPIC BLUEPRINT
Category: ${plannedTopic.plannedCategory}
Target Skills: ${Array.isArray(plannedTopic.targetSkills) ? plannedTopic.targetSkills.join(', ') : (typeof plannedTopic.targetSkills === 'string' ? plannedTopic.targetSkills : 'None')}
Intent: ${plannedTopic.plannedIntent}
Difficulty Level: ${plannedTopic.plannedDifficulty}

### INSTRUCTIONS
You must generate the **very first question** for this current topic.
1. Be professional, natural, and conversational. Do not sound robotic.
2. Ask a question that aligns perfectly with the Current Topic Blueprint.
3. If this is the very first topic of the interview, briefly welcome the candidate and jump into the first question.
4. If there were previous topics, DO NOT greet the candidate again or welcome them back. Use a seamless transitional phrase (e.g., "Moving on to our next topic..." or "Let's shift focus to...") and dive straight into the question to ensure a continuous conversation.
5. Your output should be the exact text that will be spoken/streamed to the candidate. Do not include any internal monologues, formatting like "Interviewer:", or metadata in your text.
`
}

export function getFollowUpPrompt(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  contextPrompt: string,
  currentTopicTurns: TopicTurn[],
  maxFollowUpsReached: boolean
) {
  let currentTopicTranscript = '### CURRENT TOPIC TRANSCRIPT\n'
  for (const turn of currentTopicTurns) {
    currentTopicTranscript += `${turn.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${turn.content}\n`
  }

  return `
You are a senior technical interviewer.

### CANDIDATE PROFILE
Target Role: ${candidateProfile.targetRole}
Experience Level: ${candidateProfile.experienceLevel}

${contextPrompt}

### CURRENT TOPIC BLUEPRINT
Category: ${plannedTopic.plannedCategory}
Target Skills: ${Array.isArray(plannedTopic.targetSkills) ? plannedTopic.targetSkills.join(', ') : (typeof plannedTopic.targetSkills === 'string' ? plannedTopic.targetSkills : 'None')}

${currentTopicTranscript}

### INSTRUCTIONS
The candidate just answered. You must evaluate their latest response and decide what to say next.

${maxFollowUpsReached ? 
`CRITICAL: You have reached the maximum allowed follow-ups for this topic. You MUST conclude this topic and move to the next one.
Acknowledge their answer briefly, provide a short bridging sentence, and signal transition.
DO NOT ask any new questions. Your only job is to gracefully end this topic.
YOU MUST INCLUDE THE EXACT STRING [NEXT_TOPIC] ANYWHERE IN YOUR RESPONSE.` 
: 
`You have the option to:
A. Probe deeper with a follow-up question if their answer was shallow, vague, or missed the mark.
B. Clarify if the candidate asked a clarifying question.
C. Acknowledge and move on if their answer was excellent and demonstrated sufficient knowledge. IF YOU CHOOSE THIS OPTION, YOU MUST INCLUDE THE EXACT STRING [NEXT_TOPIC] ANYWHERE IN YOUR RESPONSE.`
}

IMPORTANT: Your output should be the exact text that will be spoken/streamed to the candidate. Do not include any internal monologues, formatting like "Interviewer:", or metadata in your text.
`
}
