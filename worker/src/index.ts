import 'dotenv/config' // Auto-loads root ../.env when running from script
import { Worker } from 'bullmq'
import { redisConnection } from './queues/client.js'
import { QUEUE_NAMES } from '@repo/shared'
import resumeProcessor from './processors/resume.processor.js'
import atsProcessor from './processors/ats.processor.js'

console.log('🚀 Starting Background Workers...')

const resumeWorker = new Worker(QUEUE_NAMES.RESUME_PARSE, resumeProcessor, {
  connection: redisConnection,
  concurrency: 5
})

const atsWorker = new Worker(QUEUE_NAMES.ATS_GENERATE, atsProcessor, {
  connection: redisConnection,
  concurrency: 5
})

resumeWorker.on('completed', job => console.log(`✅ [Resume Worker] Job ${job.id} completed!`))
resumeWorker.on('failed', (job, err) => console.error(`❌ [Resume Worker] Job ${job?.id} failed:`, err))

atsWorker.on('completed', job => console.log(`✅ [ATS Worker] Job ${job.id} completed!`))
atsWorker.on('failed', (job, err) => console.error(`❌ [ATS Worker] Job ${job?.id} failed:`, err))

process.on('SIGINT', async () => {
  console.log('Gracefully shutting down workers...')
  await resumeWorker.close()
  await atsWorker.close()
  process.exit(0)
})
