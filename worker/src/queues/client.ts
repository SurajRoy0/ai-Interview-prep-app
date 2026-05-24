import IORedis from 'ioredis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('Redis connection error in worker:', err);
});
