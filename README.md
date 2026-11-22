# My Portfolio

A full-stack personal portfolio application with a public portfolio site and an authenticated dashboard for managing portfolio content.

## Tech stack

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios, Headless UI, and Tiptap
- **Backend:** Laravel 11, PHP 8.2+, SQLite, and Laravel Sanctum
- **Authentication:** Cookie-based Sanctum SPA authentication

## Project structure

```
my-portfolio/
├── backend/   # Laravel REST API and SQLite database
└── frontend/  # React single-page application
```

## Features

- Public portfolio page with profile, projects, skills, work experience, and education
- Authenticated dashboard for managing portfolio content
- Registration, login, logout, password reset, password confirmation, and email verification
- Rich-text content editing and sanitized portfolio biographies
- Reorderable projects, skills, experience, and education entries
- Light and dark theme support

## Getting started

### Prerequisites

- PHP 8.2 or later and Composer
- Node.js and npm

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
composer run dev
```

`composer run dev` starts the Laravel development server on port `8000`, plus the queue worker and log viewer. To run only the API server:

```bash
php artisan serve
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). During development, Vite proxies `/api/*` and `/sanctum/*` requests to `http://localhost:8000`.

## Available commands

Run these from the indicated directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `composer run dev` | Start the API server, queue worker, and logs |
| `backend/` | `php artisan test` | Run the backend test suite |
| `backend/` | `./vendor/bin/pint` | Format PHP code |
| `backend/` | `php artisan migrate:fresh --seed` | Recreate and seed the database |
| `frontend/` | `npm run dev` | Start the Vite development server |
| `frontend/` | `npm run build` | Create a production build |
| `frontend/` | `npm run lint` | Lint frontend code |

## API overview

All API routes are prefixed with `/api`.

- `GET /api/portfolio` returns the public portfolio data.
- Authenticated users can access `/api/user` and manage their account at `/api/profile`.
- Authenticated users can manage portfolio profile, projects, skills, experiences, and education under `/api/portfolio/*`.

The frontend obtains a Sanctum CSRF cookie from `/sanctum/csrf-cookie` before sending mutating requests. Configure `SANCTUM_STATEFUL_DOMAINS` and the CORS settings for any non-default SPA origin.

## Frontend routes

- `/` — public portfolio
- `/login`, `/register`, `/forgot-password`, `/reset-password` — guest authentication flows
- `/dashboard` and `/admin` — protected portfolio management dashboard
- `/profile` — protected account profile settings

## Key source locations

- `backend/routes/api.php` — API routes
- `backend/app/Http/Controllers/Api/` — portfolio content controllers
- `frontend/src/App.jsx` — client-side routing
- `frontend/src/contexts/AuthContext.jsx` — authentication state and actions
- `frontend/src/lib/api.js` — configured Axios client

## License

This project is licensed under the MIT License.
