// Zustand or similar — add when live interview state is implemented.

export type InterviewStoreState = {
  interviewId: string | null
}

export const interviewStoreInitialState: InterviewStoreState = {
  interviewId: null,
}
