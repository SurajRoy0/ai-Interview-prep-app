import {
  QUESTION_CATEGORIES,
  PSYCHOLOGICAL_INTENTS,
  QUESTION_DIFFICULTIES,
  INPUT_MODES,
  type QuestionCategory,
  type PsychologicalIntent,
  type QuestionDifficulty,
  type InputMode,
} from '@repo/shared'

const CATEGORY_ALIASES: Record<string, QuestionCategory> = {
  TECHNICAL: 'CONCEPTUAL',
  TECH: 'CONCEPTUAL',
  CODING: 'CONCEPTUAL',
  PROJECT: 'RESUME_BASED',
  RESUME: 'RESUME_BASED',
  FOLLOW_UP: 'FOLLOW_UP_DEPTH',
}

const INTENT_ALIASES: Record<string, PsychologicalIntent> = {
  PRESSURE: 'PRESSURE_TEST',
  AUTHENTICITY: 'AUTHENTICITY_CHECK',
  DEPTH: 'DEPTH_PROBE',
}

function toKey(value: unknown): string {
  if (value == null) return ''
  return String(value).trim().toUpperCase().replace(/[\s-]+/g, '_')
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  aliases: Record<string, T>,
  fallback: T
): T {
  const key = toKey(value)
  if (!key) return fallback
  if ((allowed as readonly string[]).includes(key)) return key as T
  return aliases[key] ?? fallback
}

export function normalizeQuestionCategory(
  value: unknown,
  fallback: QuestionCategory = 'CONCEPTUAL'
): QuestionCategory {
  return pickEnum(value, QUESTION_CATEGORIES, CATEGORY_ALIASES, fallback)
}

export function normalizePsychologicalIntent(
  value: unknown,
  fallback: PsychologicalIntent = 'DEPTH_PROBE'
): PsychologicalIntent {
  return pickEnum(value, PSYCHOLOGICAL_INTENTS, INTENT_ALIASES, fallback)
}

export function normalizeQuestionDifficulty(
  value: unknown,
  fallback: QuestionDifficulty = 'MEDIUM'
): QuestionDifficulty {
  return pickEnum(value, QUESTION_DIFFICULTIES, {}, fallback)
}

export function normalizeInputMode(value: unknown, fallback: InputMode = 'VOICE'): InputMode {
  return pickEnum(value, INPUT_MODES, {}, fallback)
}

/** Safety net when live interview model returns free-form category strings */
export function normalizeAITurnForDb(parsed: Record<string, unknown>) {
  return {
    question:
      typeof parsed.question === 'string' ? parsed.question : 'Could you elaborate on that?',
    questionCategory: normalizeQuestionCategory(parsed.category),
    questionDifficulty: normalizeQuestionDifficulty(parsed.difficulty),
    psychologicalIntent: normalizePsychologicalIntent(parsed.psychologicalIntent),
    targetSkills: Array.isArray(parsed.targetSkills)
      ? parsed.targetSkills.filter((s): s is string => typeof s === 'string')
      : [],
    inputMode: normalizeInputMode(parsed.suggestedInputMode),
    isFollowUp: Boolean(parsed.isFollowUp),
    followUpReason:
      typeof parsed.followUpReason === 'string' ? parsed.followUpReason : null,
    turnScore:
      typeof parsed.previousAnswerScore === 'number' ? parsed.previousAnswerScore : null,
    topicScored: typeof parsed.topicScored === 'string' ? parsed.topicScored : null,
  }
}
