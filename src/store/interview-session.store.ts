import { create } from 'zustand'

export interface InterviewSessionState {
  // Database references
  interviewId: string | null
  currentQuestionId: string | null
  questionIndex: number
  totalQuestions: number

  // Timer state
  timeRemainingSeconds: number
  totalTimeAllocated: number

  // Flow state
  isPaused: boolean
  isFinished: boolean

  // Actions
  initializeSession: (data: {
    interviewId: string
    currentQuestionId: string
    questionIndex: number
    totalQuestions: number
    timeAllocated: number
  }) => void

  tickTimer: () => void
  advanceToNextQuestion: (nextQuestionId: string, newTimeAllocated: number) => void
  setPaused: (paused: boolean) => void
  finishInterview: () => void
}

export const useInterviewSessionStore = create<InterviewSessionState>((set) => ({
  // Initial state
  interviewId: null,
  currentQuestionId: null,
  questionIndex: 0,
  totalQuestions: 0,
  timeRemainingSeconds: 0,
  totalTimeAllocated: 0,
  isPaused: false,
  isFinished: false,

  // Actions
  initializeSession: (data) =>
    set({
      interviewId: data.interviewId,
      currentQuestionId: data.currentQuestionId,
      questionIndex: data.questionIndex,
      totalQuestions: data.totalQuestions,
      timeRemainingSeconds: data.timeAllocated,
      totalTimeAllocated: data.timeAllocated,
      isPaused: false,
      isFinished: false,
    }),

  tickTimer: () =>
    set((state) => {
      if (state.isPaused || state.isFinished || state.timeRemainingSeconds <= 0) {
        return state
      }
      return { timeRemainingSeconds: state.timeRemainingSeconds - 1 }
    }),

  advanceToNextQuestion: (nextQuestionId, newTimeAllocated) =>
    set((state) => ({
      currentQuestionId: nextQuestionId,
      questionIndex: state.questionIndex + 1,
      timeRemainingSeconds: newTimeAllocated,
      totalTimeAllocated: newTimeAllocated,
    })),

  setPaused: (paused) => set({ isPaused: paused }),

  finishInterview: () => set({ isFinished: true, timeRemainingSeconds: 0 }),
}))
