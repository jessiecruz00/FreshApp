# FreshApp

Full-stack app with **FastAPI** (backend), **Next.js** (frontend), and **MySQL**, featuring admin and user panels, blog, auth (email + Google), SendGrid verification, and theme/notification management.

## Structure

- **Backend** (`backend/`): Python FastAPI, Swagger at `/docs`, async MySQL (SQLAlchemy + aiomysql).
- **Frontend** (`frontend/`): Next.js (App Router), Tailwind CSS, dark/light theme with a modern glow-style UI.
- **Database**: MySQL.

## Features

- **Auth**: Login, signup, Google sign-in/signup, email verification (SendGrid) and invite links with expiring tokens.
- **Admin panel**: User management, blog management, settings (admin info, app theme, notification management).
- **User panel**: View blog, settings (profile, theme, notifications).

## Quick start

### 1. MySQL

Create a database:

```sql
CREATE DATABASE freshapp;
```

### 2. Backend

**Python 3.11–3.14** supported. Use [python.org](https://www.python.org/downloads/) or pyenv if needed.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set MYSQL_*, SECRET_KEY, optional SendGrid and Google OAuth
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 and optional NEXT_PUBLIC_GOOGLE_AUTH_URL
npm run dev
```

- App: http://localhost:3000  

### 4. First admin user

Create a user (signup or DB insert), then set `role = 'admin'` in the `users` table for that user.

## Env (backend)

| Variable | Description |
|----------|-------------|
| `MYSQL_*` | MySQL connection |
| `SECRET_KEY` | JWT signing (use `openssl rand -hex 32`) |
| `SENDGRID_API_KEY` | SendGrid (verification/invite emails) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth |
| `FRONTEND_URL` | Base URL for verification/invite links |

## Env (frontend)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base (e.g. `http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_GOOGLE_AUTH_URL` | Google OAuth authorization URL (optional) |

## UI

The frontend uses a dark-first theme with a subtle luminous glow (reference-style), minimal header, rounded inputs/buttons, and an announcement bar. Theme can be switched to light or system in Settings.
