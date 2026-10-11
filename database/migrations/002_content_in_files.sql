-- Question banks live in backend/app/content/*.json, not in database tables,
-- so attempt tables must not require a matching row in the content tables.
-- Safe to run more than once. Run this in the Supabase SQL editor.
alter table public.reading_attempts   drop constraint if exists reading_attempts_test_id_fkey;
alter table public.listening_attempts drop constraint if exists listening_attempts_test_id_fkey;
alter table public.vocabulary_progress drop constraint if exists vocabulary_progress_item_id_fkey;

-- Needed by Progress/Study Plan analytics.
alter table public.vocabulary_progress add column if not exists topic text;
alter table public.vocabulary_progress add column if not exists kind text;
