# Security notes

- **Secrets**: only in environment variables (`.env` is git-ignored; `.env.example` has placeholders). The Supabase service key lives only in the backend; the frontend only has the public anon key.
- **Auth**: the backend validates every Bearer token against Supabase and filters all data by the verified user id. RLS is enabled on all tables as a second layer; `reading_questions` has no client policy.
- **Validation**: Pydantic on every request body (bands, lengths, dates, enums); invalid input returns `{code, message}`.
- **Prompt injection**: essays and transcripts are passed to the model as delimited data; model output is parsed and validated, overall scores are computed server-side, and quotes not found in the student's text are dropped.
- **Rate limiting**: in-memory sliding window on AI and upload endpoints (per process; use a shared store if you scale to several instances).
- **Uploads**: audio size capped (`MAX_AUDIO_MB`), processed in a temp file, deleted immediately, never stored.
- **Privacy**: transcripts and feedback are stored per user; recordings are not.
- **Honesty**: all scores are labelled "estimated"; disclaimer shown in the footer and on results.
- **Not yet done**: email-confirmation redirect URLs for production, CAPTCHA on signup, shared rate-limit store, dependency audit (could not run offline).
