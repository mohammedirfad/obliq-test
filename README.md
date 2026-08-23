# Obliq-io

A complete founding-engineer prototype for Obliq-io: landing page, basic auth, user dashboard, client application tracking, RAG pipeline prototype, AI agent planner, Supabase schema, CI, and deploy script.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an account, then test the dashboard RAG and agent flows.

## What Stands Out

- Polished responsive landing page for CA firm automation.
- Email/password auth using `scrypt` hashing and signed HTTP-only cookies.
- Dashboard seeded with client applications after signup, plus full application CRUD.
- Local RAG pipeline: chunking, embeddings, cosine search, citations, workflow answer.
- AI agent planning endpoint for GST notices, audit evidence, KYC, filings, and advisory work.
- Supabase/Postgres schema with pgvector and row-level security in `db/schema.sql`.
- GitHub Actions CI and deploy script.

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`
- `POST /api/rag/ingest`
- `POST /api/rag/query`
- `POST /api/agent/plan`
- `POST /api/mail/send`

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
SESSION_SECRET="a-long-random-secret"
OPENAI_API_KEY=""
GEMINI_API_KEY=""
GROQ_API_KEY=""
```

The current demo works without LLM keys because embeddings and agent planning have local deterministic fallbacks.

## Production Path

Use `db/schema.sql` in Supabase, replace the JSON store in `lib/store.ts`, and swap `lib/rag.ts` embeddings for a provider-backed embedding model. The app is designed so those changes are isolated.

## Pipeline Notes

See `docs/pipelines.md` for the GitHub Actions flow, deployment checks, and a step-by-step explanation of how RAG ingestion/querying works in this prototype.
