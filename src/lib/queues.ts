import { Queue } from 'bullmq';

export const QUEUE_NAMES = {
  RESUME_PROCESSING: 'resume-processing',
  INTERVIEW_REPORT: 'interview-report',
  EVALUATE_TURN: 'evaluate-turn',
} as const;

// Create a single shared Redis connection config for BullMQ publishers
const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Instantiate queues for publishing
// We keep them in a global cache in dev so Next.js fast-refresh doesn't create thousands of connections

const globalForQueues = global as unknown as {
  resumeQueue: Queue;
  reportQueue: Queue;
  evaluateQueue: Queue;
};

export const resumeQueue =
  globalForQueues.resumeQueue ||
  new Queue(QUEUE_NAMES.RESUME_PROCESSING, { connection });

export const reportQueue =
  globalForQueues.reportQueue ||
  new Queue(QUEUE_NAMES.INTERVIEW_REPORT, { connection });

export const evaluateQueue =
  globalForQueues.evaluateQueue ||
  new Queue(QUEUE_NAMES.EVALUATE_TURN, { connection });

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.resumeQueue = resumeQueue;
  globalForQueues.reportQueue = reportQueue;
  globalForQueues.evaluateQueue = evaluateQueue;
}
