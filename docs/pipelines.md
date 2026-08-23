# Obliq-io Pipelines

This document explains the two review-critical pipelines in the prototype: GitHub Actions CI/CD and the local RAG flow.

## GitHub Actions CI

The workflow lives in `.github/workflows/ci.yml`.

It runs on:

- every push to `main`
- every pull request targeting `main`

The job uses Ubuntu, checks out the repo, installs Node 22, caches npm dependencies, and runs:

```bash
npm ci
npm run typecheck
npm run build
```

That means every pushed change must pass TypeScript and a production Next.js build before it is considered healthy.

## Deployment Script

The deployment helper lives in `scripts/deploy.sh`.

It performs the same local release checks:

```bash
npm ci
npm run typecheck
npm run build
```

After those pass, the app is ready for a Vercel-style deploy:

```bash
npx vercel --prod
```

## RAG Pipeline

The RAG prototype is intentionally runnable without API keys. It uses deterministic local embeddings so reviewers can create an account and test retrieval immediately.

### Ingestion

Endpoint: `POST /api/rag/ingest`

Flow:

1. The route checks the signed session with `currentUser()`.
2. It validates the title and document body length.
3. It creates a document record owned by the current user.
4. `chunkText()` normalizes the text and splits it into overlapping chunks.
5. `embed()` creates a deterministic vector for each chunk.
6. `addDocument()` stores the document, chunks, embeddings, and audit event in `data/local.json`.

Important files:

- `app/api/rag/ingest/route.ts`
- `lib/rag.ts`
- `lib/store.ts`

### Query

Endpoint: `POST /api/rag/query`

Flow:

1. The route checks the signed session.
2. It loads only chunks owned by the current user.
3. `embed()` converts the question into the same vector space.
4. `searchChunks()` ranks chunks with cosine similarity.
5. `answerFromContext()` returns a cited answer scaffold and CA workflow next steps.

Important files:

- `app/api/rag/query/route.ts`
- `lib/rag.ts`
- `lib/store.ts`

## Production Upgrade Path

The database schema in `db/schema.sql` already includes Supabase/Postgres tables and `pgvector`.

To move from local prototype to production:

1. Replace JSON persistence in `lib/store.ts` with Supabase queries.
2. Replace deterministic embeddings in `lib/rag.ts` with OpenAI, Gemini, or another embedding provider.
3. Store vectors in `document_chunks.embedding vector(1536)`.
4. Query with pgvector cosine distance.
5. Add file upload parsing for PDFs, images, spreadsheets, and email attachments.
6. Persist agent runs and citations for auditability.
