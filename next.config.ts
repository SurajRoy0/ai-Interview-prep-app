import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/db',
    '@repo/shared',
    '@repo/validators',
    '@repo/ai',
    '@repo/audio',
  ],
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'pino',
    'pino-pretty',
    'better-auth',
    'bullmq',
  ],
}

export default nextConfig
