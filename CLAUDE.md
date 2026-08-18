# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

```
my-portfolio/
├── backend/   ← Laravel 11 REST API (PHP 8.2+)
└── frontend/  ← React 18 + Vite + React Router + Tailwind CSS
```

## Backend (`backend/`)

**Stack:** Laravel 11, SQLite, Laravel Sanctum (cookie/session auth)

**Start dev server:**
```bash
cd backend && composer run dev
```
This concurrently runs: PHP server (`:8000`), queue worker, Pail log viewer.

Or individually:
```bash
php artisan serve
```

**Other commands (run from `backend/`):**
```bash
./vendor/bin/pint                           # lint PHP
php artisan test                            # all tests
php artisan test tests/Feature/ProfileTest.php  # single test
php artisan migrate
php artisan migrate:fresh --seed
```

**API routes:** All API endpoints are in `routes/api.php`, prefixed `/api/`. Auth routes (`/api/login`, `/api/register`, etc.) are in `routes/auth.php` (included by `api.php`). CORS is configured in `config/cors.php` — allowed origins: `localhost:5173` and `localhost:3000`.

**Auth:** Sanctum stateful SPA auth (cookie-based). Frontend must first call `GET /sanctum/csrf-cookie` before any mutating request. The `SANCTUM_STATEFUL_DOMAINS` env var lists allowed SPA origins.

**Controllers:** `app/Http/Controllers/` — `ProfileController` handles `/api/profile`. Auth controllers live in `Auth/` subdirectory and return JSON.

## Frontend (`frontend/`)

**Stack:** React 18, Vite, React Router v6, Tailwind CSS v4, Axios, Headless UI

**Start dev server:**
```bash
cd frontend && npm run dev   # runs on :5173
```

Vite proxies `/api/*` and `/sanctum/*` to `http://localhost:8000`, so no CORS issues during development.

**Build:**
```bash
npm run build
```

**Key directories:**
- `src/Pages/` — full-page components, mirroring routes (e.g. `Auth/Login.jsx`, `Profile/Edit.jsx`)
- `src/Layouts/` — `AuthenticatedLayout.jsx` (nav + user dropdown) and `GuestLayout.jsx`
- `src/Components/` — shared UI primitives (buttons, inputs, modal, dropdown)
- `src/contexts/AuthContext.jsx` — `AuthProvider` + `useAuth()` hook; manages user state, exposes `login`, `register`, `logout`
- `src/lib/api.js` — configured Axios instance (`baseURL: /api`, `withCredentials: true`); also exports `getCsrfCookie()`
- `src/hooks/useForm.js` — lightweight form state hook (data, errors, processing, reset, submit)

**Routing:** Defined in `src/App.jsx`. `PrivateRoute` redirects unauthenticated users to `/login`; `GuestRoute` redirects authenticated users to `/dashboard`. Auth state loads from `GET /api/user` on mount; `undefined` means loading (routes render `null` until resolved).

**Path alias:** `@/` resolves to `src/` (configured in `vite.config.js`).

## Running both together

```bash
# Terminal 1
cd backend && composer run dev

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173
