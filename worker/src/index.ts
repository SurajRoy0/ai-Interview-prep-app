import { Worker } from 'bullmq'
import { connection } from './queues/client'
import { processResumeJob } from './processors/resume.processor'
import { processReportJob } from './processors/report.processor'

const QUEUE_NAMES = {
  RESUME_PROCESSING: 'resume-processing',
  INTERVIEW_REPORT: 'interview-report',
} as const

console.log('Starting FoxTel Background Worker...')
console.log(`Connected to Redis at ${process.env.REDIS_URL || 'redis://localhost:6379'}`)

const resumeWorker = new Worker(
  QUEUE_NAMES.RESUME_PROCESSING,
  processResumeJob,
  { connection }
)

const reportWorker = new Worker(
  QUEUE_NAMES.INTERVIEW_REPORT,
  processReportJob,
  { connection }
)

resumeWorker.on('failed', (job, err) => {
  console.error(`[ResumeWorker] Job ${job?.id} failed:`, err.message)
})

reportWorker.on('failed', (job, err) => {
  console.error(`[ReportWorker] Job ${job?.id} failed:`, err.message)
})

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, closing workers...`)
  await Promise.all([
    resumeWorker.close(),
    reportWorker.close(),
  ])
  console.log('Workers closed successfully.')
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

console.log('Workers are ready and listening for jobs.')
