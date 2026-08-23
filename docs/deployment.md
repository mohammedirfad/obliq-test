# Neon + Vercel Deployment

Use this when deploying Obliq-io to Vercel with persistent Neon Postgres storage.

## 1. Create Neon Database

1. Open `https://neon.com`.
2. Create a project, for example `obliq-io`.
3. Open the Neon SQL Editor.
4. Copy the contents of `db/neon-schema.sql`.
5. Paste and run the schema.
6. Open Neon connection details.
7. Copy the pooled connection string.

Keep the connection string secret. Do not commit it.

## 2. Local Environment

Create `.env.local` or `.env` locally:

```env
APP_URL=http://localhost:3000
SESSION_SECRET=replace-with-32-plus-random-characters
DATABASE_URL=your-neon-pooled-connection-string
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
```

The app automatically uses Neon when `DATABASE_URL` is present. If `DATABASE_URL` is empty, it falls back to `data/local.json`.

## 3. Test Locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then test:

- register
- login
- dashboard
- application CRUD
- user management
- RAG ingest/query
- agent planner

## 4. Add Vercel Environment Variables

In Vercel:

1. Open your project.
2. Go to `Settings -> Environment Variables`.
3. Add:

```env
APP_URL=https://your-vercel-domain.vercel.app
SESSION_SECRET=replace-with-32-plus-random-characters
DATABASE_URL=your-neon-pooled-connection-string
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
```

Add the variables for `Production`, `Preview`, and `Development` if needed.

## 5. Deploy

Vercel settings:

- Framework: `Next.js`
- Install command: `npm install` or `npm ci`
- Build command: `npm run build`
- Output directory: default

Deploy from Vercel or push to GitHub main.

## 6. Important Production Notes

- Never expose `DATABASE_URL` in client code.
- Never commit `.env` or `.env.local`.
- Rotate the Neon password if it was shared publicly.
- Use the pooled Neon URL for Vercel serverless deployments.
- After changing Vercel environment variables, redeploy the project. Existing deployments do not automatically receive new values.
- The deterministic RAG embedding in `lib/rag.ts` is a prototype. For production quality retrieval, replace it with OpenAI/Gemini embeddings and pgvector search.

## 7. Production Auth Checks

Use these URLs after deployment:

```text
https://your-vercel-domain.vercel.app/api/health/db
https://your-vercel-domain.vercel.app/api/health/auth?email=your-email@example.com
```

Expected results:

- `health/db` should return `ok: true`.
- `health/auth` with `userExists: false` means the user is not in Neon yet. Register again on the production site.
- `health/auth` with `passwordHashFormat: invalid` means the stored password hash is corrupted or was inserted manually. Delete and recreate that user.
- `health/auth` with `userExists: true` and `passwordHashFormat: valid` means the database user record is ready and login should work with the correct password.
