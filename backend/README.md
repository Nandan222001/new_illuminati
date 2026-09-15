# Illuminati Brotherhood — Backend API

A Python (FastAPI) + MySQL backend for the `new_illuminati` frontend. Replaces
the frontend's current localStorage-based demo auth/content/admin logic with
a real API and database. Nothing here is production-hardened — it's a demo
backend matching a demo frontend — but the layout follows normal practice
(layered app, Alembic migrations, JWT auth, no secrets in code).

## Folder structure

```
backend/
  app/
    core/        # settings (.env), password hashing, JWT
    db/          # SQLAlchemy engine/session, declarative base
    models/      # SQLAlchemy ORM models (users, content_items, admin_settings, transactions)
    schemas/     # Pydantic request/response models
    crud/        # DB read/write logic, one module per domain
    api/v1/      # FastAPI routers (one file per resource) + auth dependency
    seeds/       # One-time data seeding (built-in videos/rituals/gallery)
    main.py      # App wiring, CORS, startup seeding
  alembic/       # DB migrations
  requirements.txt
  .env.example   # Copy to .env and fill in
```

## Setup

1. MySQL database + user already created (see below to redo elsewhere):

   ```sql
   CREATE DATABASE illuminati_brotherhood CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ib_app'@'localhost' IDENTIFIED BY 'your-password';
   GRANT ALL PRIVILEGES ON illuminati_brotherhood.* TO 'ib_app'@'localhost';
   ```

2. Copy `.env.example` to `.env` and fill in `DB_PASSWORD`, `JWT_SECRET_KEY`,
   and the seed admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

3. Create a virtualenv and install dependencies:

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. Run migrations:

   ```bash
   alembic upgrade head
   ```

5. Start the API:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   On first startup the app seeds one admin ("Grand Keeper") user from
   `ADMIN_EMAIL`/`ADMIN_PASSWORD`, and seeds the built-in videos, rituals and
   gallery images (ported from the frontend's `src/data/content.js`).

   Interactive API docs: http://127.0.0.1:8000/docs

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | Auth tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed admin account, created once on first startup |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API (the Vite dev server) |

## API overview

All routes are under `/api/v1`.

**Auth** (`/auth`)
- `POST /auth/register` — create a member account, returns a JWT + user
- `POST /auth/login` — returns a JWT + user
- `GET /auth/me` — current user (bearer token required)
- `POST /auth/initiate` — seal the (simulated) ₹999 initiation fee for the current user; records a `transactions` row

**Users** (`/users`, admin only)
- `GET /users` — list all initiates
- `PATCH /users/{id}/role` — promote/demote (keeps at least one admin)
- `DELETE /users/{id}` — remove an initiate (can't delete yourself or the last admin)

**Content** (`/content/{kind}` where kind is `video`, `ritual`, or `image`)
- `GET /content/{kind}` — public list (hidden items excluded)
- `GET /content/{kind}/{slug}` — public single item
- `GET /content/{kind}/admin/all` — admin: list including hidden items
- `POST /content/{kind}` — admin: create a custom item
- `PATCH /content/{kind}/{id}` — admin: edit title/description/image/extra
- `PATCH /content/{kind}/{id}/lock` — admin: toggle free/paid (sealed)
- `DELETE /content/{kind}/{id}` — admin: fully delete a custom item, or hide a built-in one (reversible)
- `POST /content/{kind}/{id}/restore` — admin: unhide a built-in item

**Admin** (`/admin`, admin only)
- `GET /admin/settings` / `PUT /admin/settings` — Razorpay/SMTP/Twilio integration config (stored only, no live calls are made — same demo behavior as the frontend's Keeper console)
- `GET /admin/revenue?months=6` — real monthly revenue aggregated from `transactions`
- `GET /admin/transactions` — recent transaction list

## Notes

- Auth is stateless JWT (bearer token in `Authorization: Bearer <token>`), matching a typical SPA + API setup. There is no server-side session/refresh-token flow yet.
- `content_items` is one table for videos/rituals/gallery images, with a `kind` column and a JSON `extra` column for type-specific fields (duration, tags, view counts, etc.) — this mirrors how the frontend's `ContentContext` already treats all three as one catalog with per-item lock/hidden flags.
- The ₹999 initiation fee and the Razorpay/SMTP/Twilio settings remain **simulated** — no real payment gateway, email, or SMS provider is called. This matches the existing frontend, which explicitly does the same thing.
- This backend is not yet wired into the frontend (which still uses localStorage). Swapping the frontend's `src/auth/authService.js`, `src/context/ContentContext.jsx` and `src/admin/adminStore.js` to call this API is a separate follow-up step.
