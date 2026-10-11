# IELTSMate — free AI IELTS coach

Practice → AI feedback → understand mistakes → practice again → track progress → build confidence.

> IELTSMate is an independent IELTS preparation platform and is not affiliated with or endorsed by IELTS, Cambridge, IDP, or the British Council. All scores are **estimated practice bands**, not official IELTS scores.

## Features
- Auth (Supabase), profile, settings, Confidence Mode (easy → intermediate → exam)
- Level test (grammar, vocabulary, reading, short speaking) with estimated band
- Reading and Listening practice (original content, instant marking; Listening uses browser text-to-speech)
- Vocabulary and Grammar drills
- Writing Coach (AI feedback on Task 1 / Task 2, criteria scores, rewrite suggestions)
- Speaking Coach (record → transcribe → edit → AI feedback; audio is never stored)
- Personal study plan (rule-based, optional AI coach note) and progress dashboard (streak, weekly charts, recommendations)

## Structure
- `frontend/` Next.js + TypeScript + Tailwind (deploy to Vercel, root = `frontend`)
- `backend/` FastAPI + Pydantic; AI behind a replaceable `AIProvider` (Ollama default)
- `database/schema.sql` + `database/migrations/` Supabase Postgres schema, RLS
- `docs/PLAN.md` plan and status · `docs/SECURITY.md` security notes

## Run with Docker (recommended)
1. Supabase: create a free project, run `database/schema.sql`, then `database/migrations/002_content_in_files.sql` in the SQL editor.
2. `copy backend\.env.example backend\.env` (Supabase URL + service key, `MODEL_NAME` = a model you pulled) and `copy .env.example .env` (Supabase URL + anon key).
3. Install [Ollama](https://ollama.com) on the host and `ollama pull <model>`.
4. `docker compose up --build` → frontend http://localhost:3000, API http://localhost:8001/health.
5. Speech-to-text is optional: set `WITH_STT=1` in `.env` and rebuild; the first use downloads the Whisper model. Without it, Speaking falls back to typing the answer.

`NEXT_PUBLIC_*` values are baked in at build time: rebuild after changing them.

## Run without Docker
Backend: `cd backend && python -m venv .venv && pip install -r requirements.txt && uvicorn app.main:app --reload`.
Frontend: `cd frontend && npm install && npm run dev` (copy `.env.example` to `.env.local`).

## Tests
`cd backend && PYTHONPATH=. python -m unittest discover -s tests` (65 pure-logic tests: scoring, validation, AI JSON handling, plan, progress).

## Known limits
- Small local models (e.g. `qwen3:1.7b`) give rougher feedback and can be slow; the AI timeout is 240 s.
- The frontend was written without being compiled in the authoring environment; run `npm run build` (or the Docker build) and fix any type errors it reports.
