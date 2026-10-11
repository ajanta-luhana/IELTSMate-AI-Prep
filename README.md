# IELTSMate — AI-Powered IELTS Preparation Platform

**Prepare smarter. Practice consistently. Achieve your target band.**

IELTSMate is an AI-powered IELTS preparation platform designed to help learners strengthen their English skills through structured practice, AI-assisted feedback, personalized study plans, and progress tracking.

## ✨ Features

- **AI Writing Feedback** — Practice IELTS Writing Task 1 and Task 2 with AI-assisted feedback and improvement suggestions.
- **Speaking Practice** — Practice speaking responses and review transcripts and feedback.
- **Reading Practice** — Improve comprehension through structured reading exercises.
- **Listening Practice** — Develop listening skills with practice activities.
- **Personalized Study Plans** — Organize preparation around individual learning goals.
- **Progress Tracking** — Monitor learning progress and estimated band scores.
- **Level Assessment** — Evaluate your current level and define a target band.
- **Vocabulary & Grammar** — Build vocabulary and strengthen grammatical accuracy.
- **User Profiles** — Manage your learning profile and preparation preferences.

## 📸 Screenshots

### Sign Up Page

![IELTSMate Sign Up Page](docs/screenshots/signup.jpeg)

### Student Dashboard

![IELTSMate Student Dashboard](docs/screenshots/dashboard.jpeg)

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database & Authentication | Supabase integration |
| AI Integration | Configurable AI provider architecture |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |

## 📂 Project Structure

```text
ieltsmate/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   ├── core/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
├── database/
│   ├── migrations/
│   └── schema.sql
├── docs/
│   ├── PLAN.md
│   ├── SECURITY.md
│   └── screenshots/
│       ├── signup.jpeg
│       └── dashboard.jpeg
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Git
- Node.js and npm
- Python
- Docker Desktop (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/ajanta-luhana/IELTSMate-AI-Prep.git
cd IELTSMate-AI-Prep
```

### 2. Configure Environment Variables

Use the provided `.env.example` files as templates and configure the variables required by the frontend, backend, database, and AI provider.

**Security:** Never commit API keys, passwords, access tokens, or real `.env` files to GitHub.

### 3. Run with Docker

```bash
docker compose up --build
```

Check `docker-compose.yml` for the configured ports and service URLs.

For running services separately, follow the setup instructions and scripts defined in the frontend and backend configuration files.

## 🔒 Security & Privacy

- Store credentials in environment variables.
- Review database access policies and authentication settings.
- Keep sensitive configuration files out of version control.
- Review `docs/SECURITY.md` before deployment.

## 🎯 Project Objective

IELTSMate aims to make IELTS preparation more accessible by bringing practice activities, AI-assisted learning feedback, personalized study planning, and progress monitoring into one platform.

## 👩‍💻 Author

**Ajanta Luhana**

- GitHub Profile: [@ajanta-luhana](https://github.com/ajanta-luhana)
- Project Repository: [IELTSMate-AI-Prep](https://github.com/ajanta-luhana/IELTSMate-AI-Prep)

## ⚠️ Disclaimer

IELTSMate is an independent IELTS preparation project and is not affiliated with or endorsed by IELTS, Cambridge, IDP, or the British Council.

AI-generated feedback and band scores are estimates for educational purposes only and are not official IELTS results.

---

*Built by Ajanta Luhana — AI-assisted IELTS preparation.*