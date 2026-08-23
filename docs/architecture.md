# Obliq-io Prototype Architecture

## Product

Obliq-io is positioned as an AI workflow OS for CA firms. The first feature is a compliance operations console that combines:

- user profile and workspace creation
- client application CRUD for intake, owner assignment, status, priority, due dates, and notes
- document ingestion
- RAG search over client/compliance text
- agent planning for CA workflows such as GST notices, audit evidence, KYC, and filing packs

## Runtime

- **Frontend:** Next.js App Router, React, TypeScript, responsive CSS, lucide icons.
- **Backend:** Next.js route handlers for auth, application CRUD, RAG, mail demo, and agent planning.
- **Auth:** Email/password with Node `scrypt`, signed HTTP-only session cookie, 7-day expiry.
- **Local data:** JSON store in `data/local.json` for quick reviewer setup.
- **Production data path:** Supabase/Postgres with `pgvector`; see `db/schema.sql`.

## RAG Pipeline

1. Validate document ownership and content size.
2. Normalize text and split into overlapping chunks.
3. Generate deterministic local embeddings for zero-key demo execution.
4. Search chunks by cosine similarity.
5. Return answer scaffold with citations and CA workflow next steps.

Production replacement points:

- replace `lib/rag.ts` embedding with OpenAI/Gemini embeddings
- persist chunks in `document_chunks.embedding vector(1536)`
- use SQL vector search ordered by cosine distance
- add OCR/parser workers for PDFs, images, spreadsheets, and emails

## Agent Prototype

`/api/agent/plan` classifies the request, assigns risk, lists tools, and emits a handoff path. It is intentionally provider-agnostic so routing can use:

- Groq for low-latency classification
- Gemini for long-context extraction
- OpenAI for final cited drafting and tool orchestration

## Security Baseline

- HTTP-only sessions
- hashed passwords with unique salts
- input length validation
- user-owned data access
- Supabase RLS design
- audit events for auth, application CRUD, ingestion, and agent plans
- CI typecheck/build gate

## Scaling Plan

- Move JSON store to Supabase or MongoDB.
- Add queue-backed ingestion workers for large documents.
- Store original files in S3/Supabase Storage with checksums.
- Add organization/team roles and invitation flow.
- Stream agent runs with durable state and replayable audit traces.
- Add observability for latency, token spend, and retrieval quality.
