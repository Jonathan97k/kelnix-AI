-- ====================================================================
-- KELNIX AI - PHASE 4 SUPABASE CLOUDINARY MEDIA METADATA MIGRATION
-- ====================================================================
-- Instructions:
-- 1. Log in to your Supabase Dashboard (https://supabase.com)
-- 2. Open your project -> SQL Editor -> New Query
-- 3. Copy and paste this script and click "Run"
-- ====================================================================

-- Add Cloudinary-specific metadata columns to media_assets if not already present
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'public_id') then
    alter table public.media_assets add column public_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'secure_url') then
    alter table public.media_assets add column secure_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'resource_type') then
    alter table public.media_assets add column resource_type text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'format') then
    alter table public.media_assets add column format text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'bytes') then
    alter table public.media_assets add column bytes bigint;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'width') then
    alter table public.media_assets add column width integer;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'height') then
    alter table public.media_assets add column height integer;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'duration') then
    alter table public.media_assets add column duration numeric;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'media_assets' and column_name = 'thumbnail_url') then
    alter table public.media_assets add column thumbnail_url text;
  end if;
end $$;
