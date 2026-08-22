-- KELNIX AI - COMPLETE DATABASE MIGRATION
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. BUSINESSES TABLE
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  industry text,
  description text,
  brand_voice text,
  target_audience text,
  location text,
  website text,
  logo_url text,
  key_selling_points text,
  call_to_action text,
  default_hashtags text,
  brand_color text default '#E11D48',
  facebook_page_name text,
  facebook_page_id text,
  instagram_handle text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete set null,
  title text not null,
  description text,
  content_type text default 'video',
  status text check (status in ('draft', 'generating', 'ready', 'scheduled', 'published', 'failed')) default 'draft' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. MEDIA_ASSETS TABLE
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  type text not null,
  url text not null,
  thumbnail_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- 5. GENERATED_CONTENT TABLE
create table if not exists public.generated_content (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  script text,
  caption text,
  hashtags text[],
  scene_prompts jsonb default '[]'::jsonb,
  voice_script text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. SOCIAL_ACCOUNTS TABLE
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  platform text not null,
  account_name text not null,
  account_id text not null,
  status text default 'connected' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 7. PROJECT EDITOR STATE TABLE
create table if not exists public.project_editor_state (
  project_id uuid primary key references public.projects(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_businesses_user_id on public.businesses(user_id);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_business_id on public.projects(business_id);
create index if not exists idx_media_assets_user_id on public.media_assets(user_id);
create index if not exists idx_generated_content_project_id on public.generated_content(project_id);
create index if not exists idx_social_accounts_user_id on public.social_accounts(user_id);

-- ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.projects enable row level security;
alter table public.media_assets enable row level security;
alter table public.generated_content enable row level security;
alter table public.social_accounts enable row level security;
alter table public.project_editor_state enable row level security;

-- RLS POLICIES
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can view own businesses" on public.businesses;
create policy "Users can view own businesses" on public.businesses for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own businesses" on public.businesses;
create policy "Users can insert own businesses" on public.businesses for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own businesses" on public.businesses;
create policy "Users can update own businesses" on public.businesses for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own businesses" on public.businesses;
create policy "Users can delete own businesses" on public.businesses for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own media" on public.media_assets;
create policy "Users can view own media" on public.media_assets for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own media" on public.media_assets;
create policy "Users can insert own media" on public.media_assets for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own media" on public.media_assets;
create policy "Users can delete own media" on public.media_assets for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own generated content" on public.generated_content;
create policy "Users can view own generated content" on public.generated_content for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own generated content" on public.generated_content;
create policy "Users can insert own generated content" on public.generated_content for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own generated content" on public.generated_content;
create policy "Users can update own generated content" on public.generated_content for update using (auth.uid() = user_id);

drop policy if exists "Users can view own social accounts" on public.social_accounts;
create policy "Users can view own social accounts" on public.social_accounts for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own social accounts" on public.social_accounts;
create policy "Users can insert own social accounts" on public.social_accounts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own social accounts" on public.social_accounts;
create policy "Users can update own social accounts" on public.social_accounts for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own social accounts" on public.social_accounts;
create policy "Users can delete own social accounts" on public.social_accounts for delete using (auth.uid() = user_id);

drop policy if exists "Users can manage their own project editor state" on public.project_editor_state;
create policy "Users can manage their own project editor state" on public.project_editor_state for all using (
  project_id in (select id from public.projects where user_id = auth.uid())
);

-- UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_business_updated on public.businesses;
create trigger on_business_updated before update on public.businesses for each row execute function public.handle_updated_at();
drop trigger if exists on_project_updated on public.projects;
create trigger on_project_updated before update on public.projects for each row execute function public.handle_updated_at();
drop trigger if exists on_content_updated on public.generated_content;
create trigger on_content_updated before update on public.generated_content for each row execute function public.handle_updated_at();

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- CLOUDINARY COLUMNS
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS public_id text;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS secure_url text;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS resource_type text;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS format text;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS bytes bigint;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS height integer;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS duration numeric;
