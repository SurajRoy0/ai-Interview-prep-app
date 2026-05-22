import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to .env (see .env.example). Docker uses port 5433.',
    )
  }
  return url
}

function createPrismaClient(): PrismaClient {
  // Pass connection string — let @prisma/adapter-pg create the Pool.
  // Pre-creating pg.Pool in Next.js triggers a patched Promise and ECONNREFUSED.
  const adapter = new PrismaPg(getDatabaseUrl())
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

/** Lazy client so DATABASE_URL is loaded before the adapter connects. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
