# Foxtel

AI-powered interview preparation platform. This repo is a **pnpm monorepo**: the Next.js app lives at the root, shared logic lives in `packages/`, and background jobs run in `worker/`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- PostgreSQL (local Docker via `docker compose`, or a hosted DB such as Neon)

## Project structure

```
foxtel/
├── src/                      # Next.js app (pages, API routes, components, hooks)
├── packages/
│   ├── db/                   # @repo/db — Prisma schema + client
│   ├── shared/               # @repo/shared — logger, env, errors, types, utilities
│   ├── validators/           # @repo/validators — Zod schemas (auth, resume, interview, payment)
│   ├── ai/                   # @repo/ai — interview / resume / report AI logic
│   └── audio/                # @repo/audio — STT / TTS
├── worker/                   # @repo/worker — background job processor (BullMQ, etc.)
├── prisma.config.ts          # Points at packages/db/prisma/schema.prisma
├── pnpm-workspace.yaml
└── package.json              # Root app + workspace scripts
```

## Environment variables

Create a `.env` file at the **repo root** (not inside individual packages):

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5433/foxtel"
DIRECT_URL="postgresql://postgres:password@127.0.0.1:5433/foxtel"

BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-at-least-32-chars"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional
ADMIN_EMAIL="admin@foxtel.local"
ADMIN_PASSWORD="admin12345"
LOG_LEVEL="info"
```

## Running the project

All commands below are run from the **repo root**.

### First-time setup

```bash
pnpm install          # installs root + all workspace packages; runs prisma generate
pnpm db:up            # start Postgres (Docker maps port 5433 on your machine)
pnpm db:push          # sync database schema (or: pnpm db:migrate)
pnpm dev              # start Next.js at http://localhost:3000
```

In another terminal (development only), seed the admin user:

```bash
curl -X POST http://localhost:3000/api/seed
```

Use the credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or the defaults in `.env`).

### Day-to-day

```bash
pnpm dev              # Next.js development server
pnpm build            # production build
pnpm start            # run production server (after build)
pnpm lint             # ESLint
```

### Database

```bash
pnpm db:generate      # regenerate Prisma client (packages/db)
pnpm db:push          # push schema changes without migration files
pnpm db:migrate       # create/apply migrations
pnpm db:studio        # Prisma Studio UI
```

### Background worker

When job queues are wired up:

```bash
pnpm worker:dev
```

The worker uses the same root `.env` for `DATABASE_URL` and other secrets.

### Dev-only database reset

```bash
curl -X POST http://localhost:3000/api/reset
curl -X POST http://localhost:3000/api/seed
```

Only works when `NODE_ENV=development`.

---

## Workspace packages

| Package | Import name | Purpose |
|---------|-------------|---------|
| `packages/db` | `@repo/db` | `prisma` client, Prisma types/enums |
| `packages/shared` | `@repo/shared` | `logger`, `env`, `AppError`, `ErrorCodes`, `rateLimit`, storage helpers |
| `packages/validators` | `@repo/validators` | Zod schemas + inferred form/API types |
| `packages/ai` | `@repo/ai` | LLM interview engine, resume parser, reports |
| `packages/audio` | `@repo/audio` | Speech-to-text / text-to-speech |
| `worker` | `@repo/worker` | Separate process (not imported by the web app) |

The root `package.json` already links workspace packages:

```json
"@repo/db": "workspace:*",
"@repo/shared": "workspace:*"
```

`workspace:*` means “use the local folder in this repo,” not a package from npm.

---

## How to import workspace packages

### In the Next.js app (`src/`)

```ts
// Database
import { prisma } from '@repo/db'

// Shared utilities
import { logger, env, AppError, ErrorCodes, rateLimit } from '@repo/shared'

// Validation (use schemas — do not import `z` directly in pages)
import { loginSchema, type LoginValues } from '@repo/validators'

// AI / audio (when implementing features)
import { InterviewEngine } from '@repo/ai'
import { transcribeAudio } from '@repo/audio'
```

Path alias `@/*` still maps to `src/*` for app-only code (components, `src/lib/auth.ts`, etc.).

### In the worker

```ts
import { logger } from '@repo/shared'
import { prisma } from '@repo/db'
import { InterviewEngine } from '@repo/ai'
```

Ensure the dependency exists in `worker/package.json`:

```json
"@repo/shared": "workspace:*"
```

Then run `pnpm install` from the root.

### Inside a package

Packages can depend on each other, for example `@repo/ai` depends on `@repo/shared`:

```ts
import { logger } from '@repo/shared'
```

---

## What belongs where

| Put it here | Examples |
|-------------|----------|
| **`src/`** | React pages, components, hooks, Better Auth wiring (`src/lib/auth*.ts`), Next-only guards |
| **`@repo/validators`** | All Zod schemas used by forms **and** API routes |
| **`@repo/shared`** | Logger, env, errors, rate limiting, file storage helpers, shared types/constants |
| **`@repo/db`** | Prisma schema, migrations, `prisma` client |
| **`@repo/ai`** | OpenAI/Gemini, prompts, interview engine, resume/report generation |
| **`@repo/audio`** | STT/TTS providers |
| **`worker`** | BullMQ processors, long-running jobs |

Avoid duplicating schemas or utilities in `src/lib` if they belong in a package.

---

## Adding npm dependencies (`pnpm add`)

Install the dependency in the package that **imports** it, then run `pnpm install` from the root.

### Next.js / UI only (used in `src/`)

```bash
pnpm add sonner
pnpm add -D @types/something
```

### Shared across app + worker + packages

```bash
pnpm add some-package --filter @repo/shared
```

### Database / Prisma

```bash
pnpm add some-package --filter @repo/db
```

### Zod schemas / validation

```bash
pnpm add some-package --filter @repo/validators
```

`zod` already lives in `@repo/validators`; app code should import **schemas**, not `zod` directly.

### AI / LLM

```bash
pnpm add openai --filter @repo/ai
```

### Audio

```bash
pnpm add @google-cloud/text-to-speech --filter @repo/audio
```

### Worker (queues, Redis)

```bash
pnpm add bullmq ioredis --filter @repo/worker
```

### Cheat sheet

| I need… | Command |
|---------|---------|
| UI library in React | `pnpm add <pkg>` (root) |
| Used everywhere | `pnpm add <pkg> --filter @repo/shared` |
| Prisma / Postgres | `pnpm add <pkg> --filter @repo/db` |
| Validation | `pnpm add <pkg> --filter @repo/validators` |
| AI | `pnpm add <pkg> --filter @repo/ai` |
| Worker jobs | `pnpm add <pkg> --filter @repo/worker` |

---

## Creating a new workspace package

Example: `@repo/payments`

1. Create the folder and `package.json`:

```bash
mkdir -p packages/payments/src
```

```json
{
  "name": "@repo/payments",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@repo/shared": "workspace:*",
    "razorpay": "^2.9.6"
  }
}
```

2. Add `packages/payments/src/index.ts` and export your modules.

3. Register usage in the **root** app (if Next.js needs it):

```bash
pnpm add @repo/payments@workspace:*
```

Or add to root `package.json` manually:

```json
"@repo/payments": "workspace:*"
```

4. Add a TypeScript path in root `tsconfig.json` (optional if using package exports; Next already lists packages in `transpilePackages` in `next.config.ts`):

```json
"@repo/payments": ["./packages/payments/src/index.ts"]
```

5. Add the package name to `transpilePackages` in `next.config.ts` if the web app imports it.

6. From the repo root:

```bash
pnpm install
```

7. Import in app code:

```ts
import { createOrder } from '@repo/payments'
```

`packages/*` is already included in `pnpm-workspace.yaml`, so new folders under `packages/` are picked up automatically.

---

## Adding a new Zod schema

1. Add the schema in `packages/validators/src/` (e.g. `interview.ts`).
2. Export it from `packages/validators/src/index.ts` (via `export * from './interview'`).
3. Use in a page:

```tsx
import { createInterviewSchema, type CreateInterviewInput } from '@repo/validators'
import { zodResolver } from '@hookform/resolvers/zod'

useForm<CreateInterviewInput>({ resolver: zodResolver(createInterviewSchema) })
```

4. Use in an API route:

```ts
const result = createInterviewSchema.safeParse(body)
```

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:up` | Start Docker Postgres |
| `pnpm worker:dev` | Run background worker in watch mode |

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth](https://www.better-auth.com/docs)
