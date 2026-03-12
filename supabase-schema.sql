-- Supabase schema for Cabana Management System
-- This is a lightweight version aligned with PROJECT_SUMMARY.md

create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('SUPER_USER', 'ADMIN', 'USER')),
  created_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  nic text,
  full_name text not null,
  mobile text,
  country text,
  address text,
  created_at timestamptz default now()
);

create table if not exists cabanas (
  id serial primary key,
  name text not null,
  base_rate_hour numeric not null default 30,
  base_rate_day numeric not null default 250,
  is_active boolean not null default true
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id),
  cabana_id int references cabanas(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'CONFIRMED',
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  total_amount numeric not null,
  currency text not null default 'USD',
  created_at timestamptz default now()
);

create table if not exists system_settings (
  id int primary key default 1,
  is_active boolean not null default true,
  updated_at timestamptz default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  actor_id uuid references profiles(id),
  actor_name text,
  actor_role text,
  action text not null,
  entity_type text,
  entity_id text,
  source_ip text,
  metadata jsonb
);

-- Seed cabanas
insert into cabanas (id, name)
values
  (1, 'Cabana 1'),
  (2, 'Cabana 2'),
  (3, 'Cabana 3'),
  (4, 'Cabana 4')
on conflict (id) do nothing;

