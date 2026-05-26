import { InterviewPlan } from '@repo/shared'

export function buildReportPrompt(ctx: {
  targetRole: string
  transcript: string
  interviewPlan: InterviewPlan
}): string {
  const { targetRole, transcript, interviewPlan } = ctx

  return `
You are an expert technical interviewer evaluating a candidate for a ${targetRole} role.
Based on the following interview transcript and the intended interview plan, generate a comprehensive evaluation report.

Transcript:
${transcript}

Interview Plan:
${JSON.stringify(interviewPlan, null, 2)}

Analyze the candidate's performance. Focus on technical accuracy, communication skills, and problem-solving abilities.
Identify their strong areas and specific topics they need to improve.

Return ONLY a JSON object with the following schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "feedback": "Detailed markdown formatted feedback report",
  "strongTopics": ["topic1", "topic2"],
  "weakTopics": ["topic1", "topic2"]
}
`
}
