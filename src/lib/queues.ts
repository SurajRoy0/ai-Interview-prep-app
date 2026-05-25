import { Queue } from 'bullmq'

export const QUEUE_NAMES = {
  RESUME_PROCESSING: 'resume-processing',
  INTERVIEW_REPORT: 'interview-report',
} as const

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}

const globalForQueues = global as unknown as {
  resumeQueue: Queue
  reportQueue: Queue
}

export const resumeQueue =
  globalForQueues.resumeQueue ||
  new Queue(QUEUE_NAMES.RESUME_PROCESSING, { connection })

export const reportQueue =
  globalForQueues.reportQueue ||
  new Queue(QUEUE_NAMES.INTERVIEW_REPORT, { connection })

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.resumeQueue = resumeQueue
  globalForQueues.reportQueue = reportQueue
}
