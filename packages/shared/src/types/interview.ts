import type {
  QuestionCategory,
  PsychologicalIntent,
  ActivityType,
} from '../constants/interview-enums'

export type InterviewPlan = {
  targetRole: string
  ecosystem: string
  claimsToValidate: string[]
  activities: {
    insertAfterTurn: number
    type: ActivityType
  }[]
  turns: {
    category: QuestionCategory
    psychologicalIntent: PsychologicalIntent
    notes?: string
  }[]
}
