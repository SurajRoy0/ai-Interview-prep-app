import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

function createPgPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: process.env.NODE_ENV === 'development' ? 2 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  })
}

function createPrismaClient(): PrismaClient {
  const pool = globalForPrisma.pgPool ?? createPgPool()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pool
  }

  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
