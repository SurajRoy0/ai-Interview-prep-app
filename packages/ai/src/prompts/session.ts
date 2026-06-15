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
  const isActivity = plannedTopic.type === 'ACTIVITY'

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
${isActivity ? `
Activity Type: ${plannedTopic.activityType}
Code Snippet (Currently visible to candidate):
\`\`\`
${plannedTopic.codeSnippet}
\`\`\`
Expected Solution/Answer:
${plannedTopic.expectedAnswer}
` : ''}

### INSTRUCTIONS
You must generate the **very first question** for this current topic.
1. Be professional, natural, and conversational. Do not sound robotic.
2. Ask a question that aligns perfectly with the Current Topic Blueprint.
${isActivity ? `3. CRITICAL: This is a coding activity. You MUST explicitly ask the candidate to look at the code snippet shared on their screen and solve the challenge (e.g., "I've shared a code snippet with you. Can you find the bug?"). DO NOT ask a generic conceptual question.` : `3. If this is the very first topic of the interview, briefly welcome the candidate and jump into the first question.`}
4. If there were previous topics, DO NOT greet the candidate again or welcome them back. Use a seamless transitional phrase (e.g., "Moving on to our next topic..." or "Let's shift focus to...") and dive straight into the question to ensure a continuous conversation.
5. Your output should be the exact text that will be spoken/streamed to the candidate. Do not include any internal monologues, formatting like "Interviewer:", or metadata in your text.
`
}

export function getFollowUpPrompt(
  candidateProfile: Record<string, unknown>,
  plannedTopic: Record<string, unknown>,
  contextPrompt: string,
  currentTopicTurns: TopicTurn[],
  maxFollowUpsReached: boolean,
  isLastTopic: boolean = false
) {
  let currentTopicTranscript = '### CURRENT TOPIC TRANSCRIPT\n'
  for (const turn of currentTopicTurns) {
    currentTopicTranscript += `${turn.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${turn.content}\n`
  }

  const isActivity = plannedTopic.type === 'ACTIVITY'

  return `
You are a senior technical interviewer.

### CANDIDATE PROFILE
Target Role: ${candidateProfile.targetRole}
Experience Level: ${candidateProfile.experienceLevel}

${contextPrompt}

### CURRENT TOPIC BLUEPRINT
Category: ${plannedTopic.plannedCategory}
Target Skills: ${Array.isArray(plannedTopic.targetSkills) ? plannedTopic.targetSkills.join(', ') : (typeof plannedTopic.targetSkills === 'string' ? plannedTopic.targetSkills : 'None')}
${isActivity ? `
Activity Type: ${plannedTopic.activityType}
Code Snippet (Currently visible to candidate):
\`\`\`
${plannedTopic.codeSnippet}
\`\`\`
Expected Solution/Answer:
${plannedTopic.expectedAnswer}
` : ''}

${currentTopicTranscript}

### INSTRUCTIONS
The candidate just answered. You must evaluate their latest response and decide what to say next.

${maxFollowUpsReached ?
      (isLastTopic ?
        `CRITICAL: This is the very last topic of the entire interview, and you have reached the maximum allowed follow-ups. You MUST conclude the interview.
  Acknowledge their answer briefly, provide a warm and professional goodbye/closing message.
  DO NOT ask any new questions. Your only job is to gracefully end the interview.
  YOU MUST INCLUDE THE EXACT STRING [END_INTERVIEW] ANYWHERE IN YOUR RESPONSE.`
        :
        `CRITICAL: You have reached the maximum allowed follow-ups for this topic. You MUST conclude this topic and move to the next one.
  Acknowledge their answer briefly, provide a short bridging sentence, and signal transition.
  DO NOT ask any new questions. Your only job is to gracefully end this topic.
  YOU MUST INCLUDE THE EXACT STRING [NEXT_TOPIC] ANYWHERE IN YOUR RESPONSE.`)
      :
      `You have the option to:
A. Probe deeper with a follow-up question if their answer was shallow, vague, or missed the mark.
B. Clarify if the candidate asked a clarifying question.
C. Acknowledge and move on if their answer was excellent and demonstrated sufficient knowledge.
IF YOU CHOOSE THIS OPTION:
1. Provide a brief, positive acknowledgement.
2. YOU MUST INCLUDE THE EXACT STRING [${isLastTopic ? 'END_INTERVIEW' : 'NEXT_TOPIC'}] ANYWHERE IN YOUR RESPONSE.
3. DO NOT ASK ANY NEW QUESTIONS. Your response must simply conclude this topic.`
    }

IMPORTANT: Your output should be the exact text that will be spoken/streamed to the candidate. Do not include any internal monologues, formatting like "Interviewer:", or metadata in your text.
`
}
