import { Queue } from 'bullmq'
import { QUEUE_NAMES } from '@repo/shared'

export { QUEUE_NAMES }

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}

const globalForQueues = global as unknown as {
  resumeQueue: Queue
  planGenerationQueue: Queue
  judgeQueue: Queue
}

export const resumeQueue =
  globalForQueues.resumeQueue ||
  new Queue(QUEUE_NAMES.RESUME_PROCESSING, { connection })

export const planGenerationQueue =
  globalForQueues.planGenerationQueue ||
  new Queue(QUEUE_NAMES.INTERVIEW_PLAN_GENERATION, { connection })


// The judge queue is used for judging candidate responses to topics
export const judgeQueue =
  globalForQueues.judgeQueue ||
  new Queue(QUEUE_NAMES.TOPIC_JUDGING, {
    connection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 1000, // 1 second
      },

      removeOnComplete: 1000,
      removeOnFail: 100,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.resumeQueue = resumeQueue
  globalForQueues.planGenerationQueue = planGenerationQueue
  globalForQueues.judgeQueue = judgeQueue
}
