-- Neon/Postgres schema for Obliq-io.
-- Run this in Neon SQL Editor before deploying with DATABASE_URL.

create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  firm_name text not null,
  role text not null check (role in ('founder', 'admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  client_name text not null,
  service text not null check (service in ('GST', 'Income Tax', 'Audit', 'KYC', 'Advisory')),
  status text not null check (status in ('intake', 'processing', 'review', 'filed', 'blocked')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  due_date date not null,
  owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists documents (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists chunks (
  id text primary key,
  document_id text not null references documents(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  chunk_index integer not null,
  text text not null,
  embedding jsonb not null,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create table if not exists audit_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists users_firm_name_idx on users(lower(firm_name));
create index if not exists applications_user_status_idx on applications(user_id, status);
create index if not exists applications_user_due_idx on applications(user_id, due_date);
create index if not exists documents_user_idx on documents(user_id);
create index if not exists chunks_user_document_idx on chunks(user_id, document_id);
create index if not exists audit_user_created_idx on audit_events(user_id, created_at desc);
