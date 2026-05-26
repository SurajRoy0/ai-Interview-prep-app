import { create } from 'zustand'

export type InterviewPhase =
  | 'idle'
  | 'ai_typing'
  | 'waiting_input'
  | 'recording'
  | 'processing'
  | 'activity_active'
  | 'completed'
  | 'failed'

export interface TurnDisplay {
  turnIndex: number
  role: 'ai' | 'user'
  content: string
  inputMode?: string
}

export interface ActivityState {
  activityId: string
  type: string
  title: string
  prompt: string
  codeSnippet?: string
  requiresCodeEditor: boolean
  codeEditable: boolean
  requiresTextInput: boolean
}

export interface RecoveryState {
  status: string
  currentTurnIndex: number
  totalTurns: number
  turns: TurnDisplay[]
}

interface InterviewStore {
  interviewId: string | null
  phase: InterviewPhase

  streamingText: string
  currentInputMode: string

  currentTurnIndex: number
  totalTurns: number

  turns: TurnDisplay[]

  liveTranscript: string
  textInputContent: string
  codeEditorContent: string

  currentActivity: ActivityState | null

  elapsedSeconds: number

  setPhase: (p: InterviewPhase) => void
  setStreamingText: (t: string) => void
  setTurnMeta: (currentTurnIndex: number, totalTurns: number) => void
  finalizeAITurn: (question: string, inputMode: string) => void
  addUserTurn: (content: string, inputMode: string) => void
  addTurn: (t: TurnDisplay) => void
  setLiveTranscript: (t: string) => void
  setActivity: (a: ActivityState | null) => void
  setTextInputContent: (t: string) => void
  setCodeEditorContent: (t: string) => void
  tickTimer: () => void
  rebuildFromRecovery: (data: RecoveryState) => void
  reset: () => void
  setInterviewId: (id: string) => void
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  interviewId: null,
  phase: 'idle',

  streamingText: '',
  currentInputMode: 'VOICE',

  currentTurnIndex: 0,
  totalTurns: 0,

  turns: [],

  liveTranscript: '',
  textInputContent: '',
  codeEditorContent: '',

  currentActivity: null,

  elapsedSeconds: 0,

  setPhase: (phase) => set({ phase }),
  setStreamingText: (streamingText) => set({ streamingText }),

  setTurnMeta: (currentTurnIndex, totalTurns) => set({ currentTurnIndex, totalTurns }),

  finalizeAITurn: (question, inputMode) => set((state) => ({
    currentInputMode: inputMode,
    turns: [...state.turns, { turnIndex: state.currentTurnIndex, role: 'ai', content: question, inputMode }],
    streamingText: '',
  })),

  addUserTurn: (content, inputMode) => set((state) => ({
    turns: [...state.turns, { turnIndex: state.currentTurnIndex, role: 'user', content, inputMode }],
    currentTurnIndex: state.currentTurnIndex + 1,
  })),

  addTurn: (t) => set((state) => ({ turns: [...state.turns, t] })),

  setLiveTranscript: (liveTranscript) => set({ liveTranscript }),
  setActivity: (currentActivity) => set({ currentActivity }),
  setTextInputContent: (textInputContent) => set({ textInputContent }),
  setCodeEditorContent: (codeEditorContent) => set({ codeEditorContent }),
  tickTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  rebuildFromRecovery: (data) => set({
    phase: data.status === 'COMPLETED' ? 'completed' : data.status === 'FAILED' ? 'failed' : 'waiting_input',
    currentTurnIndex: data.currentTurnIndex,
    totalTurns: data.totalTurns,
    turns: data.turns,
  }),

  reset: () => set({
    interviewId: null,
    phase: 'idle',
    streamingText: '',
    currentInputMode: 'VOICE',
    currentTurnIndex: 0,
    totalTurns: 0,
    turns: [],
    liveTranscript: '',
    textInputContent: '',
    codeEditorContent: '',
    currentActivity: null,
    elapsedSeconds: 0,
  }),

  setInterviewId: (interviewId) => set({ interviewId }),
}))
