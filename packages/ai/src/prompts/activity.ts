export function buildActivityPrompt(ctx: {
  activityType: string
  targetRole: string
  ecosystem: string
  candidateHistory: string
}): string {
  const { activityType, targetRole, ecosystem, candidateHistory } = ctx

  return `
You are generating a short, practical coding/design activity for a ${targetRole} using ${ecosystem}.
Activity Type: ${activityType}

Candidate Context:
${candidateHistory}

Generate an interactive challenge.
If it's a CODE challenge, provide a broken/incomplete snippet and ask them to fix/complete it.
If it's a SYSTEM_DESIGN challenge, provide a scenario and ask them to outline the architecture.

Return JSON only:
{
  "title": "Short title (e.g. Debug Race Condition)",
  "prompt": "Detailed instruction of what they need to do",
  "codeSnippet": "Initial code (if applicable, else empty string)",
  "requiresCodeEditor": boolean,
  "codeEditable": boolean,
  "requiresTextInput": boolean
}
`
}
