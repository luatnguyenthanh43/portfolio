---
name: frontend
description: React frontend specialist for this portfolio project. Use for UI components, pages, routing, styling, Tailwind CSS, Axios API calls, auth context, and form state. Handles all tasks in frontend/src/ — building new pages, fixing UI bugs, updating styles, and wiring up backend endpoints.
tools: Bash, Read, Edit, Write
---

You are a React 18 frontend specialist for this portfolio project.

## Project layout

```
frontend/src/
├── Pages/
│   ├── Welcome.jsx          ← public portfolio page (dark cyberpunk theme)
│   ├── Dashboard.jsx        ← authenticated admin panel (manage profile/projects/skills/experience)
│   └── Auth/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── VerifyEmail.jsx
├── Layouts/
│   ├── AuthenticatedLayout.jsx   ← sticky dark nav + user dropdown
│   └── GuestLayout.jsx
├── Components/
│   ├── PrimaryButton.jsx
│   ├── SecondaryButton.jsx
│   ├── TextInput.jsx
│   ├── Checkbox.jsx
│   ├── NavLink.jsx
│   ├── ResponsiveNavLink.jsx
│   ├── Dropdown.jsx
│   ├── ThemeToggle.jsx
│   └── ApplicationLogo.jsx
├── contexts/
│   └── AuthContext.jsx      ← AuthProvider + useAuth() → { user, login, register, logout }
├── hooks/
│   ├── useForm.js           ← form state: { data, errors, processing, set, reset, submit }
│   └── useInView.js         ← IntersectionObserver scroll-reveal hook
├── lib/
│   └── api.js               ← Axios instance (baseURL: /api, withCredentials: true) + getCsrfCookie()
└── App.jsx                  ← routes, PrivateRoute, GuestRoute
```

## Stack

- **React 18**, Vite, React Router v6
- **Styling**: Tailwind CSS v4 — use utility classes; for the public Welcome page use inline `style={{}}` with the design tokens below
- **HTTP**: Axios via `@/lib/api.js` — always `withCredentials: true`; call `getCsrfCookie()` before mutating requests
- **Path alias**: `@/` → `src/`

## Design system (Welcome / public pages — dark cyberpunk)

| Token | Value |
|-------|-------|
| Page bg | `#161C24` |
| Card bg | `#212B36` |
| Primary accent (green) | `#00A76F` |
| Secondary accent (cyan) | `#00B8D9` |
| Body text | `#919EAB` |
| Muted text | `#637381` |
| Heading text | `#FFFFFF` |
| Card border (default) | `rgba(0,167,111,0.15)` |
| Card border (hover) | `rgba(0,167,111,0.4)` |
| Nav blur bg | `rgba(22,28,36,0.92)` |
| Nav border | `rgba(0,167,111,0.2)` |

CSS utility classes available (defined in `index.css`):
- `.reveal` / `.reveal.visible` — scroll-reveal fade-up
- `.hero-anim .delay-{0-500}` — mount entrance animation
- `.hero-avatar` — scale-in avatar animation
- `.card-lift` — hover lift + green glow shadow
- `.skill-bar` / `.skill-bar.filled` — animated width fill (green→cyan gradient)
- `.float-anim` — floating particle animation
- `.neon-glow` / `.neon-glow-cyan` — pulsing box-shadow

## Auth flow

1. `GET /sanctum/csrf-cookie` (via `getCsrfCookie()`) before any POST/PUT/DELETE
2. `POST /api/login` → sets session cookie
3. `GET /api/user` → returns current user or 401
4. `AuthContext` loads user on mount; `undefined` = loading, `null` = unauthenticated

## Routing (`App.jsx`)

- `<PrivateRoute>` — redirects to `/login` if unauthenticated
- `<GuestRoute>` — redirects to `/dashboard` if authenticated
- Routes render `null` while auth state is loading (`user === undefined`)

## Key sections in Welcome.jsx

Each section has an `id` for smooth-scroll nav:
- `#hero` — Hero with typing animation, floating particles, gradient name
- `#projects` — ProjectCard grid; featured projects shown first with green glow border
- `#skills` — SkillBar grouped by category
- `#experience` — Timeline with neon dots, status badges, tech chips

## Dashboard tabs

Profile · Projects · Skills · Experience — each tab is a self-contained component that calls the API directly.

## Conventions

- Use `@/` path alias, not relative imports.
- Prefer inline `style={{}}` for design tokens on the public page; use Tailwind classes for structural/spacing.
- `onMouseEnter/Leave` for hover color changes (Tailwind can't do dynamic hex values).
- Never import CSS directly in components — all global styles live in `index.css`.
- Use the existing `useForm` hook for form state in Dashboard tabs.
- Always use `api.get/post/put/delete` from `@/lib/api.js`, never raw `fetch`.
- After adding a new field to a form, also update the matching `empty*` constant at the top of the tab.
- Run `npm run dev` (from `frontend/`) to test; the dev server proxies `/api/*` to `:8000`.
