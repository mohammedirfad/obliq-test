-- Supabase/Postgres schema for Obliq-io.
-- Enable pgvector in Supabase: create extension if not exists vector;

create extension if not exists vector;

create type public.application_status as enum ('intake', 'processing', 'review', 'filed', 'blocked');
create type public.application_priority as enum ('low', 'medium', 'high');
create type public.service_type as enum ('GST', 'Income Tax', 'Audit', 'KYC', 'Advisory');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  firm_name text not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  service public.service_type not null,
  status public.application_status not null default 'intake',
  priority public.application_priority not null default 'medium',
  due_date date,
  internal_owner text,
  notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  title text not null,
  source_uri text,
  mime_type text default 'text/plain',
  checksum text,
  created_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536),
  token_count integer,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  provider text not null,
  intent text not null,
  risk text not null,
  prompt text not null,
  output jsonb not null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index applications_owner_status_idx on public.applications(owner_id, status);
create index documents_owner_idx on public.documents(owner_id);
create index chunks_owner_document_idx on public.document_chunks(owner_id, document_id);
create index chunks_embedding_idx on public.document_chunks using ivfflat (embedding vector_cosine_ops);
create index audit_owner_created_idx on public.audit_events(owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.agent_runs enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "applications owned by user" on public.applications
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "documents owned by user" on public.documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "chunks owned by user" on public.document_chunks
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "agent runs owned by user" on public.agent_runs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "audit events owned by user" on public.audit_events
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
