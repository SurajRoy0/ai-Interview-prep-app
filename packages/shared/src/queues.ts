export const QUEUE_NAMES = {
  RESUME_PARSE: 'resume-parse',
  ATS_GENERATE: 'ats',
  REPORT_GENERATE: 'report-generate',
  COURSE_UPDATE: 'course-update',
} as const

export type ResumeJobData = {
  resumeId: string
}

export type AtsJobData = {
  jobProfileId: string
}

export type ReportJobData = {
  interviewId: string
}
