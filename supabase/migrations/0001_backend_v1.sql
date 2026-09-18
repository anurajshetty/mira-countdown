-- Mira Countdown backend v1
-- Run this in the SQL Editor of the EXISTING restaurant POS Supabase project
-- (uusnyqhpnedqqsdzpzeh). Safe to run more than once.
-- Table names are prefixed mira_ so they never clash with POS tables.

-- 1. A single shared due date, so every family phone counts down to the same day.
create table if not exists public.mira_config (
  key text primary key,
  value text not null
);

insert into public.mira_config (key, value)
values ('due_date', '2026-10-08')
on conflict (key) do nothing;

-- 2. Family notes feed ("can't wait to meet you" messages).
create table if not exists public.mira_notes (
  id bigint generated always as identity primary key,
  author text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- 3. v1 is login-free: the app uses the anon (public) key, so Row Level
--    Security must explicitly allow reading the due date + notes and adding notes.
--    The secret service key is never used in the app.
alter table public.mira_config enable row level security;
alter table public.mira_notes enable row level security;

drop policy if exists "Anyone can read mira_config" on public.mira_config;
create policy "Anyone can read mira_config"
  on public.mira_config for select
  using (true);

drop policy if exists "Anyone can read mira_notes" on public.mira_notes;
create policy "Anyone can read mira_notes"
  on public.mira_notes for select
  using (true);

drop policy if exists "Anyone can add a mira_note" on public.mira_notes;
create policy "Anyone can add a mira_note"
  on public.mira_notes for insert
  with check (true);
