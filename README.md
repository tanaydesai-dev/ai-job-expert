# ai-job-expert

A web app that takes a job description as input and generates:
- A structured summary (location, required experience, key details)
- An optional AI-generated cover letter tailored to the job

## Architecture

Next.js full-stack app — frontend and backend live in the same project. All
Claude API calls happen server-side (API routes / Server Actions) so the
API key is never exposed to the browser.

## Stack

**Frontend**
- Next.js (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui — accessible pre-built components (textarea, button, card, tabs)
- react-hook-form + zod — form handling and validation
- Vercel AI SDK (`ai` package) — streaming cover letter output on the client

**Backend**
- Next.js Route Handlers (`app/api/*/route.ts`) — no separate server
- `@anthropic-ai/sdk` — official Claude API client, server-side only
- zod — shared validation for request bodies and Claude's structured JSON output
- Environment variables via `.env.local` (`ANTHROPIC_API_KEY`)

**Infra**
- Vercel — hosting and deployment
- ESLint + Prettier — code quality/formatting
- GitHub — version control

v1 is intentionally stateless — no database or auth. Persistence/accounts are a
later, optional phase.

## Folder conventions

- `app/api/<feature>/route.ts` — one folder per feature's API route (e.g.
  `app/api/analyze/`, `app/api/cover-letter/`)
- `components/ui/` — shadcn/ui primitives only (managed by `npx shadcn add`)
- `components/<feature>/` — feature-specific components (e.g.
  `components/job-analysis/`, `components/cover-letter/`)
- `lib/<feature>/` — feature-specific server logic, e.g. `lib/anthropic/`
  (Claude client, prompts, schemas). `lib/utils.ts` stays flat — it's the
  shadcn-generated `cn()` helper that generated components import directly.

## Phases

### Phase 0 — Scaffolding
- `create-next-app` with TypeScript + Tailwind
- Install `@anthropic-ai/sdk`, zod, react-hook-form, shadcn/ui
- Set up `.env.local` for `ANTHROPIC_API_KEY` (never committed)
- Basic folder structure (`app/`, `lib/`, `components/`)

### Phase 1 — Job description input
- A textarea page where the user pastes a job description
- Client-side validation (non-empty, reasonable length)
- "Analyze" button that submits to the backend

### Phase 2 — Summary generation (core feature)
- API route (`/api/analyze`) that sends the job description to Claude
- Uses structured outputs (`output_config.format` with a JSON schema) so the
  response is guaranteed valid JSON — no fragile text parsing
- Schema fields: title, company, location, work mode (remote/hybrid/onsite),
  required years of experience, required skills, nice-to-haves, salary range
  (if present), key responsibilities summary
- Returns the JSON to the frontend

### Phase 3 — Display the summary
- Renders the structured data as a clean card/table UI (location, experience,
  etc. as labeled fields, skills as tags)
- Loading and error states

### Phase 4 — Cover letter generation (on demand)
- "Generate cover letter" button, enabled once a summary exists
- A form to capture info about the user (name, background/resume text, tone
  preference)
- API route (`/api/cover-letter`) that sends the job description + user
  background to Claude, streamed back for responsiveness
- Streaming text displayed in the UI, with copy/download options

### Phase 5 — Polish & robustness
- Error handling for bad input, API failures, and rate limits, surfaced
  cleanly to the user
- Basic rate limiting / abuse protection on the API routes
- Loading skeletons, responsive layout

### Phase 6 — Optional persistence (stretch goal)
- Save past analyses/cover letters — would need a database (e.g. Postgres via
  Neon/Supabase + Prisma) and likely auth (e.g. NextAuth)
- Not in scope for v1 unless explicitly prioritized

### Phase 7 — Deploy
- Push to GitHub, deploy on Vercel, configure environment variables there

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

## Status

Phase 0 complete — Next.js + TypeScript + Tailwind + shadcn/ui scaffolded,
core dependencies installed, project builds and runs.
