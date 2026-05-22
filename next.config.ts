import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep heavy server deps out of the Turbopack/Webpack bundle — cuts dev memory a lot
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
