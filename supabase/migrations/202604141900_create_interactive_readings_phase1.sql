create table if not exists public.reading_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('reader', 'seeker', 'both')),
  status text not null default 'waiting' check (status in ('waiting', 'matched', 'cancelled', 'timeout')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  matched_session_id uuid,
  unique (user_id)
);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'matching' check (status in ('matching', 'preparing', 'in_progress', 'awaiting_close', 'closed', 'cancelled', 'timeout', 'no_show')),
  reader_user_id uuid not null references auth.users(id) on delete cascade,
  seeker_user_id uuid not null references auth.users(id) on delete cascade,
  topic text,
  allow_ai_assist boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reader_user_id <> seeker_user_id)
);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'reading_queue'
      and constraint_name = 'reading_queue_matched_session_id_fkey'
  ) then
    alter table public.reading_queue
      add constraint reading_queue_matched_session_id_fkey
      foreign key (matched_session_id) references public.reading_sessions(id) on delete set null;
  end if;
end $$;

create table if not exists public.reading_session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('reader', 'seeker')),
  connection_state text not null default 'invited' check (connection_state in ('invited', 'joined', 'audio_ready', 'active', 'left')),
  end_requested_at timestamptz,
  end_confirmed_at timestamptz,
  joined_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, user_id),
  unique (session_id, role)
);

create table if not exists public.reading_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'text' check (kind in ('text', 'system', 'ai')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_card_draws (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  draw_order integer not null check (draw_order > 0),
  card_id text not null,
  card_name text not null,
  orientation text not null default 'upright' check (orientation in ('upright', 'reversed')),
  drawn_by text not null default 'reader' check (drawn_by in ('reader', 'system')),
  note text,
  created_at timestamptz not null default now(),
  unique (session_id, draw_order)
);

create table if not exists public.reading_closures (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  reader_confirmed_at timestamptz,
  seeker_confirmed_at timestamptz,
  closure_note_reader text,
  closure_note_seeker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id)
);

create table if not exists public.reading_history_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,
  key_cards_json jsonb not null default '[]'::jsonb,
  insights_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (session_id, owner_user_id)
);

create table if not exists public.public_reading_shares (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  share_token_hash text,
  visibility text not null default 'unlisted' check (visibility in ('public', 'unlisted')),
  content_level text not null default 'summary' check (content_level in ('teaser', 'summary', 'full_anonymized')),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, owner_user_id)
);

create table if not exists public.public_reading_share_views (
  id uuid primary key default gen_random_uuid(),
  share_id uuid not null references public.public_reading_shares(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  device text,
  user_agent text
);

create index if not exists idx_reading_queue_status_created_at on public.reading_queue(status, created_at asc);
create index if not exists idx_reading_queue_expires_at on public.reading_queue(expires_at);

create index if not exists idx_reading_sessions_reader_created_at on public.reading_sessions(reader_user_id, created_at desc);
create index if not exists idx_reading_sessions_seeker_created_at on public.reading_sessions(seeker_user_id, created_at desc);
create index if not exists idx_reading_sessions_status_created_at on public.reading_sessions(status, created_at desc);

create index if not exists idx_reading_session_participants_user on public.reading_session_participants(user_id, created_at desc);
create index if not exists idx_reading_session_participants_session on public.reading_session_participants(session_id);

create index if not exists idx_reading_messages_session_created_at on public.reading_messages(session_id, created_at asc);
create index if not exists idx_reading_card_draws_session_created_at on public.reading_card_draws(session_id, created_at asc);
create index if not exists idx_reading_history_snapshots_owner_created_at on public.reading_history_snapshots(owner_user_id, created_at desc);

create index if not exists idx_public_reading_shares_owner_created_at on public.public_reading_shares(owner_user_id, created_at desc);
create index if not exists idx_public_reading_shares_slug on public.public_reading_shares(slug);
create index if not exists idx_public_reading_share_views_share_viewed_at on public.public_reading_share_views(share_id, viewed_at desc);

create or replace function public.is_reading_session_participant(target_session_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.reading_session_participants p
    where p.session_id = target_session_id
      and p.user_id = auth.uid()
  );
$$;

create or replace function public.is_reading_session_reader(target_session_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.reading_sessions s
    where s.id = target_session_id
      and s.reader_user_id = auth.uid()
  );
$$;

alter table public.reading_queue enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.reading_session_participants enable row level security;
alter table public.reading_messages enable row level security;
alter table public.reading_card_draws enable row level security;
alter table public.reading_closures enable row level security;
alter table public.reading_history_snapshots enable row level security;
alter table public.public_reading_shares enable row level security;
alter table public.public_reading_share_views enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_queue' and policyname = 'reading_queue_select_own'
  ) then
    create policy reading_queue_select_own on public.reading_queue
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_queue' and policyname = 'reading_queue_insert_own'
  ) then
    create policy reading_queue_insert_own on public.reading_queue
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_queue' and policyname = 'reading_queue_update_own'
  ) then
    create policy reading_queue_update_own on public.reading_queue
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_queue' and policyname = 'reading_queue_delete_own'
  ) then
    create policy reading_queue_delete_own on public.reading_queue
      for delete using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_sessions' and policyname = 'reading_sessions_select_participants'
  ) then
    create policy reading_sessions_select_participants on public.reading_sessions
      for select using (auth.uid() = reader_user_id or auth.uid() = seeker_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_sessions' and policyname = 'reading_sessions_insert_participants'
  ) then
    create policy reading_sessions_insert_participants on public.reading_sessions
      for insert with check (auth.uid() = reader_user_id or auth.uid() = seeker_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_sessions' and policyname = 'reading_sessions_update_participants'
  ) then
    create policy reading_sessions_update_participants on public.reading_sessions
      for update using (auth.uid() = reader_user_id or auth.uid() = seeker_user_id)
      with check (auth.uid() = reader_user_id or auth.uid() = seeker_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_session_participants' and policyname = 'reading_session_participants_select_participants'
  ) then
    create policy reading_session_participants_select_participants on public.reading_session_participants
      for select using (
        exists (
          select 1
          from public.reading_sessions s
          where s.id = session_id
            and (s.reader_user_id = auth.uid() or s.seeker_user_id = auth.uid())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_session_participants' and policyname = 'reading_session_participants_insert_self'
  ) then
    create policy reading_session_participants_insert_self on public.reading_session_participants
      for insert with check (
        auth.uid() = user_id
        and exists (
          select 1
          from public.reading_sessions s
          where s.id = session_id
            and (s.reader_user_id = auth.uid() or s.seeker_user_id = auth.uid())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_session_participants' and policyname = 'reading_session_participants_update_self'
  ) then
    create policy reading_session_participants_update_self on public.reading_session_participants
      for update using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_messages' and policyname = 'reading_messages_select_participants'
  ) then
    create policy reading_messages_select_participants on public.reading_messages
      for select using (public.is_reading_session_participant(session_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_messages' and policyname = 'reading_messages_insert_sender'
  ) then
    create policy reading_messages_insert_sender on public.reading_messages
      for insert with check (
        auth.uid() = sender_user_id
        and public.is_reading_session_participant(session_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_messages' and policyname = 'reading_messages_update_sender'
  ) then
    create policy reading_messages_update_sender on public.reading_messages
      for update using (auth.uid() = sender_user_id)
      with check (auth.uid() = sender_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_messages' and policyname = 'reading_messages_delete_sender'
  ) then
    create policy reading_messages_delete_sender on public.reading_messages
      for delete using (auth.uid() = sender_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_card_draws' and policyname = 'reading_card_draws_select_participants'
  ) then
    create policy reading_card_draws_select_participants on public.reading_card_draws
      for select using (public.is_reading_session_participant(session_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_card_draws' and policyname = 'reading_card_draws_insert_reader_or_system'
  ) then
    create policy reading_card_draws_insert_reader_or_system on public.reading_card_draws
      for insert with check (
        public.is_reading_session_participant(session_id)
        and (
          (drawn_by = 'reader' and public.is_reading_session_reader(session_id))
          or drawn_by = 'system'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_closures' and policyname = 'reading_closures_select_participants'
  ) then
    create policy reading_closures_select_participants on public.reading_closures
      for select using (public.is_reading_session_participant(session_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_closures' and policyname = 'reading_closures_insert_participants'
  ) then
    create policy reading_closures_insert_participants on public.reading_closures
      for insert with check (public.is_reading_session_participant(session_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_closures' and policyname = 'reading_closures_update_participants'
  ) then
    create policy reading_closures_update_participants on public.reading_closures
      for update using (public.is_reading_session_participant(session_id))
      with check (public.is_reading_session_participant(session_id));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_history_snapshots' and policyname = 'reading_history_snapshots_select_own'
  ) then
    create policy reading_history_snapshots_select_own on public.reading_history_snapshots
      for select using (auth.uid() = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_history_snapshots' and policyname = 'reading_history_snapshots_insert_own'
  ) then
    create policy reading_history_snapshots_insert_own on public.reading_history_snapshots
      for insert with check (
        auth.uid() = owner_user_id
        and public.is_reading_session_participant(session_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reading_history_snapshots' and policyname = 'reading_history_snapshots_delete_own'
  ) then
    create policy reading_history_snapshots_delete_own on public.reading_history_snapshots
      for delete using (auth.uid() = owner_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_shares' and policyname = 'public_reading_shares_select_public_or_owner'
  ) then
    create policy public_reading_shares_select_public_or_owner on public.public_reading_shares
      for select using (
        auth.uid() = owner_user_id
        or (
          is_active
          and (expires_at is null or expires_at > now())
          and visibility in ('public', 'unlisted')
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_shares' and policyname = 'public_reading_shares_insert_owner'
  ) then
    create policy public_reading_shares_insert_owner on public.public_reading_shares
      for insert with check (
        auth.uid() = owner_user_id
        and public.is_reading_session_participant(session_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_shares' and policyname = 'public_reading_shares_update_owner'
  ) then
    create policy public_reading_shares_update_owner on public.public_reading_shares
      for update using (auth.uid() = owner_user_id)
      with check (auth.uid() = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_shares' and policyname = 'public_reading_shares_delete_owner'
  ) then
    create policy public_reading_shares_delete_owner on public.public_reading_shares
      for delete using (auth.uid() = owner_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_share_views' and policyname = 'public_reading_share_views_insert_any'
  ) then
    create policy public_reading_share_views_insert_any on public.public_reading_share_views
      for insert with check (
        exists (
          select 1
          from public.public_reading_shares s
          where s.id = share_id
            and s.is_active
            and (s.expires_at is null or s.expires_at > now())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'public_reading_share_views' and policyname = 'public_reading_share_views_select_owner'
  ) then
    create policy public_reading_share_views_select_owner on public.public_reading_share_views
      for select using (
        exists (
          select 1
          from public.public_reading_shares s
          where s.id = share_id
            and s.owner_user_id = auth.uid()
        )
      );
  end if;
end $$;
