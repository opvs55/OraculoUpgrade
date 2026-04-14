create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('tarot_weekly', 'unified_reading', 'runes_weekly', 'iching_weekly', 'numerology_weekly')),
  source_id uuid not null,
  week_ref text,
  title text not null,
  hook text,
  description text,
  duration_seconds integer not null default 30 check (duration_seconds > 0),
  cta_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);

create index if not exists idx_reels_user_id_updated_at on public.reels(user_id, updated_at desc);
create index if not exists idx_reels_user_id_source_type on public.reels(user_id, source_type);

alter table public.reels enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reels' and policyname = 'reels_select_own'
  ) then
    create policy reels_select_own on public.reels
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reels' and policyname = 'reels_insert_own'
  ) then
    create policy reels_insert_own on public.reels
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reels' and policyname = 'reels_update_own'
  ) then
    create policy reels_update_own on public.reels
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reels' and policyname = 'reels_delete_own'
  ) then
    create policy reels_delete_own on public.reels
      for delete using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.reel_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reel_id uuid not null references public.reels(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, reel_id)
);

create index if not exists idx_reel_favorites_user_id on public.reel_favorites(user_id);

alter table public.reel_favorites enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_favorites' and policyname = 'reel_favorites_select_own'
  ) then
    create policy reel_favorites_select_own on public.reel_favorites
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_favorites' and policyname = 'reel_favorites_insert_own'
  ) then
    create policy reel_favorites_insert_own on public.reel_favorites
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_favorites' and policyname = 'reel_favorites_delete_own'
  ) then
    create policy reel_favorites_delete_own on public.reel_favorites
      for delete using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.reel_consumption (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reel_id uuid not null references public.reels(id) on delete cascade,
  view_count integer not null default 0,
  completion_count integer not null default 0,
  total_watch_seconds integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reel_id)
);

create index if not exists idx_reel_consumption_user_id on public.reel_consumption(user_id);
create index if not exists idx_reel_consumption_user_id_last_viewed on public.reel_consumption(user_id, last_viewed_at desc);

alter table public.reel_consumption enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_consumption' and policyname = 'reel_consumption_select_own'
  ) then
    create policy reel_consumption_select_own on public.reel_consumption
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_consumption' and policyname = 'reel_consumption_insert_own'
  ) then
    create policy reel_consumption_insert_own on public.reel_consumption
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_consumption' and policyname = 'reel_consumption_update_own'
  ) then
    create policy reel_consumption_update_own on public.reel_consumption
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reel_consumption' and policyname = 'reel_consumption_delete_own'
  ) then
    create policy reel_consumption_delete_own on public.reel_consumption
      for delete using (auth.uid() = user_id);
  end if;
end $$;
