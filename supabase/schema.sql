-- Run this in the Supabase SQL Editor

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  client text,
  status text not null default 'aktiv',
  start_date text,
  end_date text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  role text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  date text not null,
  weather text,
  temperature numeric,
  workers integer,
  activities text,
  notes text,
  chef_notes text,
  attendees jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Row Level Security: nur eingeloggte Nutzer dürfen alles lesen/schreiben
alter table projects enable row level security;
alter table contacts enable row level security;
alter table diary_entries enable row level security;

create policy "Authenticated full access" on projects
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on contacts
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on diary_entries
  for all to authenticated using (true) with check (true);
