# ai-job-expert

A web app that takes a job description as input and generates:
- A structured summary (location, required experience, key details)
- An optional AI-generated cover letter tailored to the job

## Architecture

Next.js full-stack app — frontend and backend live in the same project. All
Gemini API calls happen server-side (API routes / Server Actions) so the
API key is never exposed to the browser.

## Stack

**Frontend**
- Next.js (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui — accessible pre-built components (textarea, button, card, tabs)
- react-hook-form + zod — form handling and validation
- Cover letter streaming is read directly off the fetch `Response` body
  (`ReadableStream` + `TextDecoder`) — no separate streaming SDK, since
  `@google/genai`'s own stream already does the work

**Backend**
- Next.js Route Handlers (`app/api/*/route.ts`) — no separate server
- `@google/genai` — official Gemini API client, server-side only
- zod — shared validation for request bodies, and converted to JSON Schema
  (`z.toJSONSchema`) for Gemini's structured output
- Environment variables via `.env.local` (`GEMINI_API_KEY`)

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
- `lib/<feature>/` — feature-specific server logic, e.g. `lib/gemini/`
  (Gemini client, prompts, schemas). `lib/utils.ts` stays flat — it's the
  shadcn-generated `cn()` helper that generated components import directly.

## Phases

### Phase 0 — Scaffolding
- `create-next-app` with TypeScript + Tailwind
- Install `@google/genai`, zod, react-hook-form, shadcn/ui
- Set up `.env.local` for `GEMINI_API_KEY` (never committed)
- Basic folder structure (`app/`, `lib/`, `components/`)

### Phase 1 — Job description input
- A textarea page where the user pastes a job description
- Client-side validation (non-empty, reasonable length)
- "Analyze" button that submits to the backend

### Phase 2 — Summary generation (core feature)
- API route (`/api/analyze`) that sends the job description to Gemini
- Uses structured outputs (`response_format` with a JSON schema, via the
  Interactions API) so the response is guaranteed valid JSON — no fragile
  text parsing
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
- A form to capture info about the user (name, resume upload, tone
  preference)
- API route (`/api/cover-letter`) that extracts text from the uploaded resume
  PDF, sends it with the job description to Gemini, streamed back for
  responsiveness
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
cp .env.local.example .env.local   # then fill in GEMINI_API_KEY (free key: https://aistudio.google.com/apikey)
npm run dev
```

## Status

Phase 5 complete — both API routes are rate-limited (10 requests / 5 min per
IP, shared budget across `/api/analyze` and `/api/cover-letter`, in-memory —
see `lib/rate-limit.ts` for the scaling caveat), a global error boundary
(`app/error.tsx`) catches unhandled render errors, the cover letter download
filename now uses the job title, and the layout was verified overflow-free
at 375px mobile width.

**Visual design pass:** reskinned from the default grayscale shadcn theme to
an indigo accent (`--primary` and friends in `app/globals.css`), with a
gradient-glow hero, two-tone logotype, icon-led meta grid and buttons
(`lucide-react`), soft card shadows, and entrance animations
(`tw-animate-css`). "Modern tech/SaaS" direction, chosen and verified via
screenshots at desktop and 375px mobile.

**Round 2 — dark mode + personality:** along the way, found and fixed a real
bug — `--font-sans` was circularly self-referenced in `globals.css`, so the
Geist font loaded via `next/font` was never actually applied; the whole app
had been rendering in the browser's fallback system font. Fixed that, added
Space Grotesk (`--font-heading`) for headings, and added:
- **Dark mode** — `next-themes` (`components/theme-provider.tsx`,
  `components/theme-toggle.tsx`), system-aware with a manual toggle, no
  hydration flash (both icons always render; pure CSS `dark:` variants
  crossfade them — a `useEffect`-based "mounted" gate was tried first but
  flagged by this repo's `react-hooks/set-state-in-effect` lint rule)
- **Site header** (`components/site-header.tsx`) — sticky, gradient logo
  mark + wordmark + theme toggle
- **Dual-tone indigo→fuchsia** gradient (hero glow, gradient title text,
  card accent bars) instead of a single flat accent color
- **Dot-grid background texture**, theme-aware via a `--grid-dot` token
- **Branded favicon** (`app/icon.tsx`, generated with `next/og`)
- Punchier microcopy ("Job postings, decoded", personality-infused loading
  states)

Verified with real browser screenshots across light mode, dark mode
(including the toggle transition), and 375px mobile — all states, zero
console errors, zero layout overflow.

**Resume upload for cover letters:** the cover letter form no longer asks for
free-typed "background" text — instead the user uploads their resume as a
PDF. The form now submits as `multipart/form-data`; `/api/cover-letter`
extracts the resume's text server-side with `pdf-parse` (imported from its
inner `lib/pdf-parse.js` module rather than the package root, since the root
`index.js` runs a `require.main`-style debug self-test that Turbopack's
module bundling triggers on import — confirmed by a failing production
build before the fix) and feeds that text to Gemini in place of the old
background field. Validates file type (PDF only) and size (5MB max)
client- and server-side, and rejects PDFs with too little extractable text
(e.g. scanned image-only resumes) with a clear error message. Verified with
a real generated PDF resume run through the full flow via Playwright —
correct text extraction, correct rejection of non-PDF files, and a
generated cover letter that accurately cited specifics from the resume.
