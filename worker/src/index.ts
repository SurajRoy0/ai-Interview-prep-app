import { Worker } from 'bullmq';
import { connection } from './queues/client';

console.log('Starting FoxTel Background Worker...');
console.log(`Connected to Redis at ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

// Queue names must match the Next.js side
const QUEUE_NAMES = {
  RESUME_PROCESSING: 'resume-processing',
  INTERVIEW_REPORT: 'interview-report',
  EVALUATE_TURN: 'evaluate-turn',
};

// We will implement the actual logic in the next phase.
// For now, we just initialize the workers to listen to the queues and do nothing.

import { processResumeJob } from './processors/resume.processor';

const resumeWorker = new Worker(
  QUEUE_NAMES.RESUME_PROCESSING,
  processResumeJob,
  { connection }
);

const reportWorker = new Worker(
  QUEUE_NAMES.INTERVIEW_REPORT,
  async (job) => {
    console.log(`[ReportWorker] Processing job ${job.id}`);
    // Implementation coming in Week 3
  },
  { connection }
);

const evaluateWorker = new Worker(
  QUEUE_NAMES.EVALUATE_TURN,
  async (job) => {
    console.log(`[EvaluateWorker] Processing job ${job.id}`);
    // Implementation coming in Week 3
  },
  { connection }
);

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, closing workers...`);
  await Promise.all([
    resumeWorker.close(),
    reportWorker.close(),
    evaluateWorker.close(),
  ]);
  console.log('Workers closed successfully.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

console.log('Workers are ready and listening for jobs.');
