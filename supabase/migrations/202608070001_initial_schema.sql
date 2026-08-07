-- Rally Queue MVP schema. Run this through the Supabase CLI or SQL editor.
create extension if not exists "pgcrypto";

create type public.skill_level as enum (
  'beginner',
  'lower_intermediate',
  'higher_intermediate',
  'advanced'
);
create type public.session_status as enum ('active', 'closed');
create type public.player_session_status as enum ('waiting', 'playing', 'resting', 'inactive');
create type public.match_status as enum ('in_progress', 'completed', 'cancelled');
create type public.suggestion_status as enum ('pending', 'approved', 'rejected');

create table public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  self_tagged_level public.skill_level not null,
  current_level public.skill_level not null,
  rating integer not null check (rating between 500 and 3000),
  total_matches integer not null default 0 check (total_matches >= 0),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date not null default current_date,
  status public.session_status not null default 'active',
  court_count integer not null check (court_count between 1 and 4),
  created_by uuid not null references public.players(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique nulls not distinct (session_date, status)
);

create table public.session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  games_played integer not null default 0 check (games_played >= 0),
  status public.player_session_status not null default 'waiting',
  joined_queue_at timestamptz not null default now(),
  last_match_at timestamptz,
  unique (session_id, player_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  court_number integer not null check (court_number between 1 and 4),
  player_ids uuid[] not null check (cardinality(player_ids) in (2, 4)),
  winner_ids uuid[] check (winner_ids is null or cardinality(winner_ids) in (1, 2)),
  status public.match_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index one_live_match_per_court
  on public.matches (session_id, court_number)
  where status = 'in_progress';

create table public.rating_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  rating_before integer not null,
  rating_after integer not null,
  created_at timestamptz not null default now(),
  unique (player_id, match_id)
);

create table public.level_change_suggestions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  suggested_level public.skill_level not null,
  reason text not null,
  status public.suggestion_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.players(id)
);

create unique index one_pending_suggestion_per_player
  on public.level_change_suggestions (player_id)
  where status = 'pending';

create or replace function public.starting_rating(level public.skill_level)
returns integer
language sql
immutable
as $$
  select case level
    when 'beginner' then 1100
    when 'lower_intermediate' then 1300
    when 'higher_intermediate' then 1500
    when 'advanced' then 1650
  end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  selected_level public.skill_level;
begin
  selected_level := coalesce((new.raw_user_meta_data ->> 'level')::public.skill_level, 'beginner');
  insert into public.players (id, name, self_tagged_level, current_level, rating)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    selected_level,
    selected_level,
    public.starting_rating(selected_level)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.players where id = auth.uid()), false);
$$;

alter table public.players enable row level security;
alter table public.sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.matches enable row level security;
alter table public.rating_history enable row level security;
alter table public.level_change_suggestions enable row level security;

create policy "authenticated users read players" on public.players
  for select to authenticated using (true);
create policy "players update own safe profile" on public.players
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Column grants prevent clients from editing ratings, levels, match counts, or admin access.
revoke update on public.players from authenticated;
grant update (name) on public.players to authenticated;

create policy "authenticated users read sessions" on public.sessions
  for select to authenticated using (true);
create policy "admins manage sessions" on public.sessions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "authenticated users read session roster" on public.session_players
  for select to authenticated using (true);
create policy "players join active session" on public.session_players
  for insert to authenticated with check (
    player_id = auth.uid()
    and games_played = 0
    and status = 'waiting'
    and last_match_at is null
    and exists (select 1 from public.sessions where id = session_id and status = 'active')
  );
create policy "players update own queue status" on public.session_players
  for update to authenticated using (player_id = auth.uid() and status <> 'playing')
  with check (
    player_id = auth.uid()
    and status in ('waiting', 'resting', 'inactive')
  );
create policy "admins update roster" on public.session_players
  for update to authenticated using (public.is_admin())
  with check (public.is_admin());
create policy "admins manage roster" on public.session_players
  for delete to authenticated using (public.is_admin());

-- Clients provide only IDs on join and can update only their queue status.
-- Match counters and playing state must be changed by a trusted database/Edge function.
revoke insert, update on public.session_players from authenticated;
grant insert (session_id, player_id) on public.session_players to authenticated;
grant update (status) on public.session_players to authenticated;

create or replace function public.refresh_queue_joined_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'waiting' and old.status is distinct from 'waiting' then
    new.joined_queue_at := now();
  end if;
  return new;
end;
$$;

create trigger session_player_returned_to_queue
  before update of status on public.session_players
  for each row execute procedure public.refresh_queue_joined_at();

create policy "authenticated users read matches" on public.matches
  for select to authenticated using (true);
create policy "admins manage matches" on public.matches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "authenticated users read rating history" on public.rating_history
  for select to authenticated using (true);
create policy "admins write rating history" on public.rating_history
  for insert to authenticated with check (public.is_admin());

create policy "authenticated users read suggestions" on public.level_change_suggestions
  for select to authenticated using (true);
create policy "admins manage suggestions" on public.level_change_suggestions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.session_players;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.level_change_suggestions;

create index session_players_fair_queue
  on public.session_players (session_id, games_played, last_match_at, joined_queue_at)
  where status = 'waiting';
create index matches_recent_by_session
  on public.matches (session_id, completed_at desc)
  where status = 'completed';
