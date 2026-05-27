import { Worker } from 'bullmq'
import { QUEUE_NAMES } from '@repo/shared'
import { connection } from './queues/client'
import { processResumeJob } from './processors/resume.processor'

console.log('Starting FoxTel Background Worker...')
console.log(`Connected to Redis at ${process.env.REDIS_URL || 'redis://localhost:6379'}`)

const resumeWorker = new Worker(
  QUEUE_NAMES.RESUME_PROCESSING,
  processResumeJob,
  { connection }
)

resumeWorker.on('completed', (job) => {
  console.log(`[ResumeWorker] Job ${job.id} completed successfully`)
})

resumeWorker.on('failed', (job, err) => {
  console.error(`[ResumeWorker] Job ${job?.id} failed:`, err.message)
})



const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, closing workers...`)
  await Promise.all([
    resumeWorker.close(),
  ])
  console.log('Workers closed successfully.')
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

console.log('Workers are ready and listening for jobs.')
