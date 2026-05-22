import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { QUEUE_NAMES } from '@repo/shared'

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
})

export const resumeParseQueue = new Queue(QUEUE_NAMES.RESUME_PARSE, { connection })
export const atsQueue = new Queue(QUEUE_NAMES.ATS_GENERATE, { connection })
export const reportGenerateQueue = new Queue(QUEUE_NAMES.REPORT_GENERATE, { connection })
export const courseUpdateQueue = new Queue(QUEUE_NAMES.COURSE_UPDATE, { connection })
