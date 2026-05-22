import { Redis } from 'ioredis'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load root .env file since worker runs standalone
config({ path: resolve(process.cwd(), '../.env') })

// BullMQ requires maxRetriesPerRequest to be null
export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})
