export type InterviewPhase = 'listening' | 'ai_speaking' | 'activity_active' | 'processing';
export type InterviewStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';

export interface CurrentActivityState {
  id: string;
  type: string;
  title: string | null;
  prompt: string;
  codeSnippet: string | null;
}

export interface AblyStatePayload {
  version: number;
  status: InterviewStatus;
  phase: InterviewPhase;
  
  currentQuestion: string | null;
  audioKey: string | null;
  
  activitiesCompleted: number;
  activitiesPlanned: number;
  currentTurnIndex: number;
  totalQuestions: number;

  currentActivity: CurrentActivityState | null;
}

export interface ClientTurn {
  id: string;
  turnIndex: number;
  role: 'AI' | 'USER';
  question: string | null;
  answer: string | null;
  audioKey: string | null;
  wasInterruption: boolean;
  codeSnippetShown: string | null;
  createdAt: string;
}
