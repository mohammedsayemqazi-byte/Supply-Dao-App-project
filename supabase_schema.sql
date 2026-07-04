-- ============================================================
-- Supply Buddy — Part 1: Schema + RLS
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to re-run: all DDL statements are idempotent.
-- DO NOT run Part 2 (seed script) in production.
-- ============================================================


-- ── 1. Profiles ─────────────────────────────────────────────
-- Auto-created on auth.users insert via trigger below.

create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null,
  role          text not null check (role in ('buyer', 'supplier', 'agent', 'admin')),
  company_name  text,
  phone         text,
  address       text,
  created_at    timestamptz default now()
);

-- Trigger: create profile row automatically on signup
-- search_path is set explicitly because security definer functions do not
-- reliably inherit 'public' in their path, which would make the
-- unqualified "profiles" reference fail silently inside auth's trigger call.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'company_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ── 2. Suppliers ─────────────────────────────────────────────
-- FIX: profile_id is now NOT NULL — every supplier must be
-- owned by a real auth user. Prevents orphaned ghost rows.

create table if not exists suppliers (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references profiles(id) on delete cascade,
  company_name        text not null,
  description         text,
  location            text not null,
  certifications      text[] default '{}',
  capacity_per_month  text,
  rating              numeric(3,2) default 0,
  total_reviews       integer default 0,
  is_verified         boolean default false,
  logo_url            text,
  cover_url           text,
  created_at          timestamptz default now()
);


-- ── 3. Materials ─────────────────────────────────────────────
-- FIX: Wrapped in DO block so re-running the script does not
-- crash with "type already exists" (PostgreSQL has no
-- CREATE TYPE IF NOT EXISTS syntax unlike CREATE TABLE).

do $$ begin
  create type material_category as enum (
    'fabric_natural',
    'fabric_synthetic',
    'fabric_woven',
    'thread',
    'accessories'
  );
exception when duplicate_object then
  null; -- type already exists, safe to continue
end $$;

create table if not exists materials (
  id                uuid primary key default gen_random_uuid(),
  supplier_id       uuid references suppliers(id) on delete cascade,
  name              text not null,
  category          material_category not null,
  description       text,
  unit              text not null,
  price_per_unit    numeric(12,2) not null,
  minimum_order_qty numeric(10,2) not null,
  stock_available   numeric(10,2) default 0,
  lead_time_days    integer default 7,
  image_url         text,
  is_active         boolean default true,
  created_at        timestamptz default now()
);


-- ── 4. Availability Slots ────────────────────────────────────

create table if not exists availability_slots (
  id              uuid primary key default gen_random_uuid(),
  supplier_id     uuid references suppliers(id) on delete cascade,
  date            date not null,
  is_available    boolean default true,
  max_orders      integer default 10,
  current_orders  integer default 0,
  notes           text,
  unique(supplier_id, date)
);


-- ── 5. Bookings ──────────────────────────────────────────────

do $$ begin
  create type booking_status as enum (
    'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'
  );
exception when duplicate_object then
  null;
end $$;

create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  buyer_id         uuid references profiles(id),
  supplier_id      uuid references suppliers(id),
  delivery_date    date not null,
  status           booking_status default 'pending',
  delivery_address text not null,
  notes            text,
  total_amount     numeric(14,2) not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);


-- ── 6. Booking Items ─────────────────────────────────────────

create table if not exists booking_items (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid references bookings(id) on delete cascade,
  material_id    uuid references materials(id),
  quantity       numeric(10,2) not null,
  price_per_unit numeric(12,2) not null,
  total_price    numeric(14,2) not null
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles          enable row level security;
alter table suppliers         enable row level security;
alter table materials         enable row level security;
alter table bookings          enable row level security;
alter table booking_items     enable row level security;
alter table availability_slots enable row level security;

-- Profiles: anyone can read; only the owner can update their own row
drop policy if exists "profiles_select"     on profiles;
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_select"     on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Suppliers: public read; supplier can insert/update only their own row
drop policy if exists "suppliers_select"     on suppliers;
drop policy if exists "suppliers_insert_own" on suppliers;
drop policy if exists "suppliers_update_own" on suppliers;
create policy "suppliers_select"      on suppliers for select using (true);
create policy "suppliers_insert_own"  on suppliers for insert with check (profile_id = auth.uid());
create policy "suppliers_update_own"  on suppliers for update using  (profile_id = auth.uid());

-- Materials: public read; supplier can manage materials under their own supplier row
drop policy if exists "materials_select"     on materials;
drop policy if exists "materials_insert_own" on materials;
drop policy if exists "materials_update_own" on materials;
create policy "materials_select"      on materials for select using (true);
create policy "materials_insert_own"  on materials for insert
  with check (supplier_id in (select id from suppliers where profile_id = auth.uid()));
create policy "materials_update_own"  on materials for update
  using      (supplier_id in (select id from suppliers where profile_id = auth.uid()));

-- Bookings: buyer sees own; supplier sees bookings placed with them
drop policy if exists "bookings_buyer_select"    on bookings;
drop policy if exists "bookings_supplier_select" on bookings;
drop policy if exists "bookings_insert"          on bookings;
create policy "bookings_buyer_select"    on bookings for select using (buyer_id = auth.uid());
create policy "bookings_supplier_select" on bookings for select
  using (supplier_id in (select id from suppliers where profile_id = auth.uid()));
create policy "bookings_insert"          on bookings for insert with check (buyer_id = auth.uid());

-- Booking items: accessible if the parent booking belongs to the user
drop policy if exists "booking_items_select" on booking_items;
drop policy if exists "booking_items_insert" on booking_items;
create policy "booking_items_select" on booking_items for select
  using (booking_id in (
    select id from bookings
    where buyer_id = auth.uid()
       or supplier_id in (select id from suppliers where profile_id = auth.uid())
  ));
create policy "booking_items_insert" on booking_items for insert
  with check (booking_id in (select id from bookings where buyer_id = auth.uid()));

-- Availability slots: public read; supplier manages their own slots
drop policy if exists "slots_select"     on availability_slots;
drop policy if exists "slots_manage_own" on availability_slots;
create policy "slots_select"      on availability_slots for select using (true);
create policy "slots_manage_own"  on availability_slots for all
  using (supplier_id in (select id from suppliers where profile_id = auth.uid()));
