export const QUEUES = {
  RESUME: 'resume-queue',
  ATS: 'ats-queue',
  REPORT: 'report-queue',
} as const

export type ResumeJobData = {
  resumeId: string
  userId: string
}

export type AtsJobData = {
  resumeId: string
  userId: string
}

export type ReportJobData = {
  interviewId: string
  userId: string
}
