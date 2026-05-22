import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use direct connection for CLI/migrations (Neon); fall back to DATABASE_URL
    url: process.env.DIRECT_URL ?? env('DATABASE_URL'),
  },
})
