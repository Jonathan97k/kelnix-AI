-- ====================================================================
-- KELNIX AI - PHASE 3 SUPABASE AUTH & PROFILE TRIGGER MIGRATION
-- ====================================================================
-- Instructions:
-- 1. Log in to your Supabase Dashboard (https://supabase.com)
-- 2. Open your project -> SQL Editor -> New Query
-- 3. Copy and paste this script and click "Run"
-- ====================================================================

-- Ensure profiles table has proper references and columns
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS on profiles if not already enabled
alter table public.profiles enable row level security;

-- Drop existing policies if any to prevent conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Create secure RLS policies for profiles
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Function to automatically create a profile record upon user signup
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Drop trigger if exists to allow clean re-creation
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger on auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
