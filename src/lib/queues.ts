import { Queue } from 'bullmq'
import { QUEUE_NAMES } from '@repo/shared'

export { QUEUE_NAMES }

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}

const globalForQueues = global as unknown as {
  resumeQueue: Queue
  planGenerationQueue: Queue
  reportQueue: Queue
}

export const resumeQueue =
  globalForQueues.resumeQueue ||
  new Queue(QUEUE_NAMES.RESUME_PROCESSING, { connection })

export const planGenerationQueue =
  globalForQueues.planGenerationQueue ||
  new Queue(QUEUE_NAMES.INTERVIEW_PLAN_GENERATION, { connection })

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.resumeQueue = resumeQueue
  globalForQueues.planGenerationQueue = planGenerationQueue
}
