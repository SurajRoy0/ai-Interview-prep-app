import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

// pino-pretty spawns worker threads that leak on every Next.js HMR reload.
// Use plain stdout in dev; no transport workers.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'info' : 'warn'),
  base: { service: 'foxtel' },
  ...(isDev && {
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),
})
