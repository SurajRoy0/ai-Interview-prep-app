export type RealtimeEventType = 'CANDIDATE_SPEECH' | 'AI_SPEECH' | 'CODE_CHANGE' | 'TURN_END'

export interface RealtimeEvent {
  type: RealtimeEventType
  interviewId: string
  payload: any
  timestamp: number
}

export interface CandidateSpeechPayload {
  text: string
  isFinal: boolean
}

export interface AiSpeechPayload {
  text: string
  audioUrl?: string
}

export interface CodeChangePayload {
  code: string
  language: string
}
