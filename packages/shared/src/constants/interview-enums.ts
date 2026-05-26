/** Must stay in sync with Prisma enums in packages/db/prisma/schema.prisma */

export const QUESTION_CATEGORIES = [
  'HR',
  'RESUME_BASED',
  'FOLLOW_UP_DEPTH',
  'CONCEPTUAL',
  'SCENARIO',
  'BEHAVIORAL',
  'PRESSURE',
  'REFLECTION',
  'COMMUNICATION_SIMPLIFICATION',
  'ACTIVITY',
] as const

export const PSYCHOLOGICAL_INTENTS = [
  'CONFIDENCE_CHECK',
  'DEPTH_PROBE',
  'PRESSURE_TEST',
  'CLARITY_CHECK',
  'REASONING_EVAL',
  'AUTHENTICITY_CHECK',
  'REFLECTION_TRIGGER',
] as const

export const QUESTION_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const

export const INPUT_MODES = [
  'VOICE',
  'TEXT',
  'CODE_EDITOR',
  'VOICE_AND_CODE',
  'VOICE_AND_TEXT',
] as const

export const ACTIVITY_TYPES = [
  'DEBUGGING',
  'CODE_CORRECTION',
  'OUTPUT_PREDICTION',
  'RESUME_DEFENCE',
  'PRIORITISATION',
  'COMMUNICATION',
  'SYSTEM_DESIGN_MINI',
] as const

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number]
export type PsychologicalIntent = (typeof PSYCHOLOGICAL_INTENTS)[number]
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number]
export type InputMode = (typeof INPUT_MODES)[number]
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export function formatEnumList(values: readonly string[]): string {
  return values.join(' | ')
}
