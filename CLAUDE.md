# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo with two independent apps that talk over HTTP:

- `backend/` — Laravel 11 JSON API (PHP 8.2+), Sanctum cookie/session auth
- `frontend/` — React 19 SPA (Vite 8, React Router 7, Tailwind CSS 4, Axios, Headless UI, Tiptap)

The public portfolio is served at `/` and the admin dashboard edits the same data. Specialist subagents exist in `.claude/agents/` (`backend`, `frontend`).

## First-time setup

```bash
# backend/
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
# frontend/
npm install
```

**`.env.example` defaults to MySQL** (`DB_CONNECTION=mysql`), but the README and the intended setup use SQLite. Before migrating, set `DB_CONNECTION=sqlite` in `.env` (comment out the other `DB_*` vars) and `touch database/database.sqlite`; otherwise migrate fails without a MySQL server. Sessions use the `database` driver, so migrations must run before login works.

## Commands

Backend (run from `backend/`):

```bash
composer run dev                  # php artisan serve (:8000) + queue:listen + pail logs (uses npx concurrently)
php artisan serve                 # API only
php artisan test                  # all tests (PHPUnit)
php artisan test tests/Feature/ProfileTest.php
php artisan test --filter=test_name
./vendor/bin/pint                 # format PHP
php artisan migrate:fresh --seed  # reset DB
```

Frontend (run from `frontend/`):

```bash
npm run dev      # Vite on :5173
npm run build
npm run lint     # oxlint (not ESLint)
```

Run both servers together for development and open http://localhost:5173. There is no frontend test setup.

## Architecture

**Request flow.** Vite proxies `/api/*` and `/sanctum/*` to `http://localhost:8000` (`frontend/vite.config.js`), so the browser sees one origin and CORS is a non-issue in dev. `src/lib/api.js` is the Axios instance (`baseURL: /api`, `withCredentials: true`) and exports `getCsrfCookie()`; call it (`GET /sanctum/csrf-cookie`) before any mutating request. For non-default origins configure `SANCTUM_STATEFUL_DOMAINS` and `backend/config/cors.php`.

**Backend API** (`backend/routes/api.php`, auth routes in `routes/auth.php` are required from it):
- `GET /api/portfolio` is the single public endpoint returning all portfolio data for the landing page.
- Everything under `auth:sanctum`: `/api/user`, `/api/profile` (account settings via `ProfileController`), and admin CRUD under `/api/portfolio/*` (`profile` PUT, plus `apiResource` for `projects`, `skills`, `experiences`, `educations` — index/show are excluded because reads go through `/api/portfolio`).
- Skills, experiences and educations each have `POST .../reorder` (declared before the `apiResource` so it isn't captured as `{id}`); keep that ordering when adding routes.
- Portfolio content controllers are in `app/Http/Controllers/Api/`; auth controllers in `Auth/` return JSON.

**HTML sanitization.** Rich text (profile `bio`, project/education `description`, authored in Tiptap via `frontend/src/Components/RichEditor.jsx`) is stored as HTML. Controllers must pass it through `App\Support\HtmlSanitizer::purify()` (HTMLPurifier whitelist) on write, because `Welcome.jsx` renders it with `dangerouslySetInnerHTML`. Any new rich-text field needs both: purify in the controller and the sanitizer's allowed tags to cover what the editor emits. Note that experiences' description fields are not currently purified — check before rendering them as HTML.

**Frontend structure.** Routing lives in `src/App.jsx`: `PrivateRoute` redirects unauthenticated users to `/login`, `GuestRoute` redirects authenticated users to `/dashboard`. `src/contexts/AuthContext.jsx` loads the user from `GET /api/user` on mount (`undefined` = still loading; routes render nothing until resolved) and exposes `login/register/logout`. `ToastContext` handles notifications. `src/Pages/Welcome.jsx` is the public portfolio; `Pages/Dashboard.jsx` (also mounted at `/admin`) is the content manager. `@/` aliases `src/`. `src/hooks/useForm.js` is a custom form-state hook (not Inertia's).

**Password reset.** `POST /api/forgot-password` and `/api/reset-password` use Laravel's stock `Password` broker. The backend has no `password.reset` route, so `AppServiceProvider` overrides the email link via `ResetPassword::createUrlUsing()` to point at the SPA: `{FRONTEND_URL}/reset-password?token=…&email=…` (`config('app.frontend_url')`, env `FRONTEND_URL`, default `http://localhost:5173`). Set `FRONTEND_URL` in production. With `MAIL_MAILER=log` (default) emails are written to `storage/logs/laravel.log`; use SMTP (e.g. Mailtrap) for real delivery. Test: `php artisan test tests/Feature/PasswordResetEmailTest.php`.

## Gotchas

- `backend/resources/js/`, `resources/views/app.blade.php` and `backend/public/build/` are leftover Laravel Breeze/Inertia scaffolding. The real UI is `frontend/`; don't edit the Inertia pages expecting visible changes.
- The `frontend/src/Pages`, `Layouts`, `Components` directories are PascalCase, while `contexts`, `hooks`, `lib` are lowercase — match the existing casing in imports.
- Most tests in `backend/tests/Feature` (old Breeze/Inertia auth and profile tests) already fail; don't treat a full `php artisan test` run as a signal. Run the specific test file instead.
- Model for portfolio profile is `PortfolioProfile` (table `profile`), not `Profile`.
