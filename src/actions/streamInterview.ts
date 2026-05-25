import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Example stub for streaming the interview turn
export async function streamInterviewTurn(interviewId: string, candidateAnswer: string) {
  'use server';
  
  // 1. Save candidate answer to DB
  // 2. Fetch interview context
  // 3. Generate and stream AI response
  
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: "You are a brutally honest Principal Engineer conducting a technical interview.",
    prompt: `Candidate said: ${candidateAnswer}\nRespond appropriately:`,
  });

  return result.toTextStreamResponse();
}
