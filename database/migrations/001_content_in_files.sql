-- Reading/listening tests and vocabulary items now live in backend/app/content/*.json,
-- so attempts must not reference the (unused) content tables. Run once in the Supabase SQL editor.
alter table public.reading_attempts drop constraint if exists reading_attempts_test_id_fkey;
alter table public.listening_attempts drop constraint if exists listening_attempts_test_id_fkey;
alter table public.vocabulary_progress drop constraint if exists vocabulary_progress_item_id_fkey;
