export interface InterviewPlanItem {
  type: string
  topic: string
  targetSkills: string[]
  difficulty: string
  psychologicalIntent: string
}

export interface InterviewPlan {
  estimatedDurationMins: number
  activities: InterviewPlanItem[]
}

export interface InterviewTurnData {
  turnIndex: number
  role: 'AI' | 'CANDIDATE'
  question?: string
  answer?: string
  codeSnippetShown?: string
  codeEditorContent?: string
  turnScore?: number
}
