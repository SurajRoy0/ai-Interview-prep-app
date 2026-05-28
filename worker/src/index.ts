import { Worker } from 'bullmq'
import { QUEUE_NAMES } from '@repo/shared'
import { connection } from './queues/client'
import { processResumeJob } from './processors/resume.processor'
import { processInterviewPlanJob } from './processors/plan.processor'

console.log('Starting FoxTel Background Worker...')
console.log(`Connected to Redis at ${process.env.REDIS_URL || 'redis://localhost:6379'}`)

const resumeWorker = new Worker(
  QUEUE_NAMES.RESUME_PROCESSING,
  processResumeJob,
  { connection }
)

const planWorker = new Worker(
  QUEUE_NAMES.INTERVIEW_PLAN_GENERATION,
  processInterviewPlanJob,
  { connection }
)

resumeWorker.on('completed', (job) => {
  console.log(`[ResumeWorker] Job ${job.id} completed successfully`)
})

resumeWorker.on('failed', (job, err) => {
  console.error(`[ResumeWorker] Job ${job?.id} failed:`, err.message)
})

planWorker.on('completed', (job) => {
  console.log(`[PlanWorker] Job ${job.id} completed successfully`)
})

planWorker.on('failed', (job, err) => {
  console.error(`[PlanWorker] Job ${job?.id} failed:`, err.message)
})

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, closing workers...`)
  await Promise.all([
    resumeWorker.close(),
    planWorker.close(),
  ])
  console.log('Workers closed successfully.')
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

console.log('Workers are ready and listening for jobs.')
