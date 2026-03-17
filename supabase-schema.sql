-- StackRank365 — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  username     text unique,
  name         text,
  headline     text,
  bio          text,
  location     text,
  specialism   text default 'Dynamics 365',
  years_exp    integer default 0,
  is_mvp       boolean default false,
  founding_member boolean default true,
  ms_account_id text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.certifications (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade,
  code         text not null,
  name         text not null,
  tier         text not null,
  specialism   text,
  points       integer not null,
  issue_date   date,
  verified     boolean default false,
  verified_at  timestamptz,
  verified_via text,
  verify_url   text,
  scarcity_multiplier boolean default false,
  created_at   timestamptz default now()
);

create table public.projects (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade,
  title        text not null,
  role         text,
  description  text,
  industry     text,
  privacy_mode text default 'public',
  enterprise   boolean default false,
  validated    boolean default false,
  validated_at timestamptz,
  points       integer not null default 800,
  created_at   timestamptz default now()
);

alter table public.profiles      enable row level security;
alter table public.certifications enable row level security;
alter table public.projects       enable row level security;

create policy "Users read own profile"    on public.profiles      for select using (auth.uid() = id);
create policy "Users update own profile"  on public.profiles      for update using (auth.uid() = id);
create policy "Users insert own profile"  on public.profiles      for insert with check (auth.uid() = id);
create policy "Users manage own certs"    on public.certifications for all   using (auth.uid() = user_id);
create policy "Users manage own projects" on public.projects       for all   using (auth.uid() = user_id);

create view public.leaderboard as
  select p.id, p.username, p.name, p.headline, p.location, p.specialism,
         p.is_mvp, p.founding_member,
         coalesce(sum(c.points), 0) + coalesce(sum(pr.points), 0) + 500 as score,
         count(distinct c.id) as cert_count,
         count(distinct pr.id) as project_count
  from public.profiles p
  left join public.certifications c  on c.user_id = p.id and c.verified = true
  left join public.projects pr       on pr.user_id = p.id
  group by p.id order by score desc;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username, ms_account_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(replace(coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)), ' ', '.')),
    new.raw_user_meta_data->>'sub'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Peer Validations ──────────────────────────────────────────────────────────
-- Run this block if you already ran the initial schema
create table if not exists public.validations (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid references public.projects(id) on delete cascade,
  requestor_id uuid references public.profiles(id) on delete cascade,
  validator_email text not null,           -- who was invited
  validator_id uuid references public.profiles(id) on delete set null, -- filled when they accept
  status       text default 'pending',     -- pending | accepted | declined
  token        text unique not null,       -- secret URL token
  message      text,                       -- optional note from requestor
  created_at   timestamptz default now(),
  responded_at timestamptz
);

alter table public.validations enable row level security;

-- Requestor can manage their own validation requests
create policy "Requestors manage own validations"
  on public.validations for all using (auth.uid() = requestor_id);

-- Anyone can read a validation by token (for the accept page)
create policy "Anyone read validation by token"
  on public.validations for select using (true);

-- Validator can update status when accepting/declining
create policy "Validators can respond"
  on public.validations for update using (true);
