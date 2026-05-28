import { Queue } from 'bullmq'
import { QUEUE_NAMES } from '@repo/shared'

export { QUEUE_NAMES }

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

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.resumeQueue = resumeQueue
}
