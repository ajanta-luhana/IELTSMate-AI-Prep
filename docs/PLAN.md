# IELTSMate — Implementation Plan

Derived from *IELTSMate Complete Project Requirements* (37 sections). Workspace was empty at start (greenfield).

## 1. Architecture

```
Browser (Next.js, Vercel) ──JWT──▶ FastAPI ──▶ AIProvider ──▶ Ollama (LLM)
        │                              │   └──▶ faster-whisper (speech)
        └── Supabase Auth (anon key)   └──▶ Supabase Postgres (service key, server only)
```

- **Frontend** (`frontend/`): Next.js App Router + TypeScript + Tailwind + shadcn/ui-style components. Talks to Supabase *only* for auth (anon key) and to FastAPI for everything else.
- **Backend** (`backend/`): FastAPI + Pydantic. Verifies the Supabase JWT on every request, owns all business logic, and is the only holder of the service-role key.
- **Database** (`database/`): Supabase Postgres, schema in SQL with Row Level Security.
- **AI layer** (`backend/app/ai/`): `AIProvider` interface → `OllamaProvider`, `LocalModelProvider`, `CloudProvider` (placeholder). Feature modules (`speaking.py`, `writing.py`, `study_plan.py`) only know the interface. All model output is parsed as JSON and validated by Pydantic before it leaves the backend.

## 2. What needs AI and what doesn't

| Feature | AI? | Notes |
|---|---|---|
| Auth, profile, dashboard, progress | No | Plain DB + code |
| Reading, Listening, Vocabulary, Grammar scoring | **No** | Deterministic; original question bank in JSON |
| Assessment: grammar/vocab/reading parts | No | Deterministic |
| Assessment: short speaking response | Yes | Falls back to "skipped" if AI offline |
| Writing evaluation | Yes (LLM) | Structured JSON, validated |
| Speaking | Yes (Whisper + LLM) | Audio not stored by default |
| Study plan | Hybrid | Rule-based plan always works; LLM adds personalised commentary |

AI-down behaviour: non-AI features keep working; AI endpoints return a typed `503 ai_unavailable` the UI renders as a friendly state.

## 3. Dependencies

Frontend: next, react, typescript, tailwindcss, tailwind-merge, clsx, class-variance-authority, @radix-ui/* (via shadcn), lucide-react, @supabase/supabase-js, @supabase/ssr, recharts, zod.
Backend: fastapi, uvicorn, pydantic(+settings), httpx, supabase (or PostgREST via httpx), PyJWT, python-multipart, faster-whisper (optional extra), slowapi (rate limiting).
Local runtime: Ollama + a small instruct model (e.g. `qwen2.5:3b-instruct`), configurable via `MODEL_NAME`.

## 4. Phases

| # | Scope | Done when |
|---|---|---|
| 1 | Scaffold, env, DB schema, AIProvider skeleton, health endpoints | Both apps build/start; `/health` reports AI status |
| 2 | Supabase auth pages, profile API, route protection | Sign up → profile row → protected `/dashboard` |
| 3 | Landing + design system + legal disclaimer | Public pages responsive |
| 4 | Dashboard + assessment flow | Estimated band + target saved |
| 5 | Reading + Vocabulary/Grammar (deterministic) | Submit → score → saved attempt |
| 6 | AI Writing Coach | Essay → validated structured feedback |
| 7 | AI Speaking Coach | Mic → Whisper → LLM → feedback |
| 8 | Study plan + progress analytics | Plan generated; charts from history |
| 9 | Listening (self-created/TTS-free text+open audio) | Deterministic scoring |
| 10 | Integration, tests, a11y, security review | MVP Definition of Done (§34) met |

## 5. Cross-cutting rules (from the brief)

- Never claim official scores: all UI/API use "Estimated Band"; global disclaimer component.
- No copyrighted IELTS material; question bank is original.
- Secrets only in env; `.env.example` for both apps; service key never in `frontend/`.
- Rate limiting, file size/type validation on audio, RLS on every user table.
- Loading / error / empty states on every data view.

## 6. Environment status (this session)

npm and PyPI are blocked by the sandbox egress policy, so dependencies could not be installed and the apps could not be built here. Phase 1 code is hand-written to the versions above and must be installed/built locally (`npm install`, `pip install -r requirements.txt`) as the first verification step.

## 7. Status

Phases 1–10 are implemented. Backend logic: 65 unit tests pass. Frontend: syntax-checked only (101 files transpile cleanly); the first `docker compose up --build` is its real type-check.
