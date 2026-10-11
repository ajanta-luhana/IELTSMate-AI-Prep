-- IELTSMate schema (Supabase Postgres). Run in the Supabase SQL editor.
-- All scores are ESTIMATED practice scores, never official IELTS results.

create extension if not exists "pgcrypto";

-- ───────── profiles ─────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  target_band numeric(2,1) check (target_band between 0 and 9),
  current_band numeric(2,1) check (current_band between 0 and 9),
  exam_date date,
  daily_goal_minutes int not null default 30 check (daily_goal_minutes between 5 and 480),
  hardest_skill text check (hardest_skill in ('speaking','writing','reading','listening')),
  confidence_level text not null default 'easy' check (confidence_level in ('easy','intermediate','exam')),
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overall_score numeric(2,1),
  speaking_score numeric(2,1),
  writing_score numeric(2,1),
  reading_score numeric(2,1),
  listening_score numeric(2,1),
  grammar_score numeric(2,1),
  vocabulary_score numeric(2,1),
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('confidence','practice','mock')),
  part smallint check (part in (1,2,3)),
  question text not null,
  audio_url text,            -- null by default: audio is not stored permanently
  transcript text,
  fluency_score numeric(2,1),
  vocabulary_score numeric(2,1),
  grammar_score numeric(2,1),
  coherence_score numeric(2,1),
  overall_score numeric(2,1),
  feedback jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_type text not null check (task_type in ('academic_task1','general_task1','task2')),
  prompt text,
  essay text not null,
  overall_score numeric(2,1),
  task_response numeric(2,1),
  coherence numeric(2,1),
  vocabulary numeric(2,1),
  grammar numeric(2,1),
  feedback jsonb,
  created_at timestamptz not null default now()
);

-- Content tables (original/open-license content only)
create table if not exists public.reading_tests (
  id text primary key,
  title text not null,
  level text not null check (level in ('easy','intermediate','exam')),
  passage text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_questions (
  id text primary key,
  test_id text not null references public.reading_tests(id) on delete cascade,
  position int not null,
  type text not null,
  prompt text not null,
  options jsonb,
  answer jsonb not null,     -- never returned to the client before submission
  explanation text
);

create table if not exists public.reading_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id text not null,
  answers jsonb not null,
  correct int not null,
  total int not null,
  estimated_band numeric(2,1),
  created_at timestamptz not null default now()
);

create table if not exists public.listening_tests (
  id text primary key,
  title text not null,
  level text not null check (level in ('easy','intermediate','exam')),
  audio_url text,
  transcript text,
  questions jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.listening_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id text not null,
  answers jsonb not null,
  correct int not null,
  total int not null,
  estimated_band numeric(2,1),
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary (
  id text primary key,
  kind text not null check (kind in ('vocabulary','grammar')),
  topic text not null,
  prompt text not null,
  options jsonb not null,
  answer_index int not null,
  explanation text
);

create table if not exists public.vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_assessments_user on public.assessments(user_id, created_at desc);
create index if not exists idx_speaking_user on public.speaking_sessions(user_id, created_at desc);
create index if not exists idx_writing_user on public.writing_submissions(user_id, created_at desc);
create index if not exists idx_reading_att_user on public.reading_attempts(user_id, created_at desc);
create index if not exists idx_listening_att_user on public.listening_attempts(user_id, created_at desc);
create index if not exists idx_vocab_prog_user on public.vocabulary_progress(user_id, created_at desc);
create index if not exists idx_plans_user on public.study_plans(user_id, created_at desc);

-- ───────── Row Level Security ─────────
-- The backend uses the service key (bypasses RLS) but still filters by the
-- verified JWT user id. RLS protects direct access with the anon key.
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.speaking_sessions enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.reading_attempts enable row level security;
alter table public.listening_attempts enable row level security;
alter table public.vocabulary_progress enable row level security;
alter table public.study_plans enable row level security;
alter table public.reading_tests enable row level security;
alter table public.reading_questions enable row level security;
alter table public.listening_tests enable row level security;
alter table public.vocabulary enable row level security;

create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array[
    'assessments','speaking_sessions','writing_submissions','reading_attempts',
    'listening_attempts','vocabulary_progress','study_plans'
  ] loop
    execute format(
      'create policy "%1$s: own rows" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- Content tables: readable by signed-in users; reading_questions (contains answers)
-- gets NO policy, so only the backend (service key) can read it.
create policy "reading_tests: read" on public.reading_tests for select to authenticated using (true);
create policy "listening_tests: read" on public.listening_tests for select to authenticated using (true);
create policy "vocabulary: read" on public.vocabulary for select to authenticated using (true);

-- ───────── Auto-create profile on signup ─────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
