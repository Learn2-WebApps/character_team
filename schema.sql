-- Supabase Database Schema for "Team Party"
-- Copy and run this in your Supabase project SQL Editor

-- 1. Enable UUID generation extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Create sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  entry_code text not null unique,
  instructor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Index for fast session entry code lookup
create index if not exists idx_sessions_entry_code on sessions(entry_code);

-- 3. Create participants table
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  affiliation text not null,
  team_number integer not null,
  answers jsonb, -- Array of 40 numbers [1-5]
  scores jsonb, -- Object with O, C, E, A, N scores (e.g. {"O": 3.5, "C": 4.0, ...})
  character_key text, -- Mapped primary character (e.g. "navigator")
  character_ranks jsonb, -- Array of top 3 character keys (e.g. ["navigator", "solver", "idea_bank"])
  assigned_role text, -- Assigned team role (e.g. "leader", "mic", "housekeeper")
  is_ready boolean not null default false,
  created_at timestamptz not null default now(),
  constraint name_length check (char_length(name) >= 1)
);

-- Index for session + team queries and realtime triggers
create index if not exists idx_participants_session_team on participants(session_id, team_number);

-- 4. Enable Row Level Security (RLS)
alter table sessions enable row level security;
alter table participants enable row level security;

-- 5. Set up RLS Policies

-- Sessions Policies:
-- Allow anyone to read sessions (so students can verify a session exists using the entry code)
create policy "Allow public read sessions by entry_code" on sessions
  for select using (true);

-- Allow authenticated instructors to create/update/delete sessions
create policy "Allow instructors full control of sessions" on sessions
  for all to authenticated
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- Participants Policies:
-- Allow public to select participants (needed for lobby sync and instructor dashboard)
create policy "Allow public read participants" on participants
  for select using (true);

-- Allow public to register as a participant
create policy "Allow public insert participants" on participants
  for insert with check (true);

-- Allow public to update their own answers, scores, character profiles, and ready state
create policy "Allow public update participants" on participants
  for update using (true) with check (true);

-- Allow authenticated instructors to delete participants if needed
create policy "Allow instructors delete participants" on participants
  for delete to authenticated using (true);

-- 6. Enable Realtime Replication for the participants table
-- Copy and run this in your Supabase project SQL Editor to authorize postgres changes subscription
alter publication supabase_realtime add table participants;

