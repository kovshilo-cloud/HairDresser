-- Run this in your Supabase project's SQL Editor

create extension if not exists "pgcrypto";

-- Time slots created by the hairdresser
create table slots (
  id           uuid primary key default gen_random_uuid(),
  slot_time    timestamptz not null unique,
  duration     integer not null,         -- minutes
  is_published boolean not null default false,
  created_at   timestamptz default now()
);

-- Client bookings
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  slot_id       uuid not null references slots(id) on delete cascade,
  client_name   text not null,
  client_phone  text not null,
  cancel_token  uuid not null default gen_random_uuid(),
  cancelled_at  timestamptz,
  created_at    timestamptz default now()
);

create unique index bookings_cancel_token_idx on bookings(cancel_token);

-- Row Level Security
alter table slots    enable row level security;
alter table bookings enable row level security;

create policy "anon read published slots"
  on slots for select using (is_published = true);

create policy "service role full access to slots"
  on slots for all using (true);

create policy "anon can insert bookings"
  on bookings for insert with check (true);

create policy "anon can read bookings"
  on bookings for select using (true);

create policy "anon can update bookings"
  on bookings for update using (true);

-- View: published slots with no active booking
create view available_slots as
  select s.*
  from slots s
  where s.is_published = true
    and not exists (
      select 1 from bookings b
      where b.slot_id = s.id
        and b.cancelled_at is null
    );

-- After running this SQL:
-- 1. Go to Database > Tables in Supabase dashboard
-- 2. Enable Realtime for both "slots" and "bookings" tables
