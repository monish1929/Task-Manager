# Docket — React frontend for the Spring Boot task manager

A responsive task dashboard built with React, Vite, Tailwind CSS, Axios, React
Router, and Lucide icons. It talks to the existing backend at
`http://localhost:8080/api`; no mock data is used.

## Before you start

1. Start PostgreSQL and the Spring Boot backend in `../Springbackend/task_manager`.
2. In this folder, install dependencies and start Vite:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The dev server is pinned to port 5173 because the
backend CORS configuration only allows that origin.

## What the backend actually exposes

| Action | Endpoint | Body | Response |
| --- | --- | --- | --- |
| Register | `POST /api/auth/register` | `{ username, password }` | `{ id, username, role }` |
| Login | `POST /api/auth/login` | `{ username, password }` | `{ "message": "<jwt>" }` |
| List my tasks | `GET /api/task/my-tasks` | — | `TaskResponse[]` |
| Get one task | `GET /api/task/{id}` | — | `TaskResponse` |
| Create task | `POST /api/task` | `TaskRequest` | `TaskResponse` |
| Update task | `PUT /api/task/{id}` | `TaskRequest` | `TaskResponse` |
| Delete task | `DELETE /api/task/{id}` | — | `204 No Content` |

`TaskRequest` and `TaskResponse` both use `title`, `description`, `status`, and
`priority`; only the response adds `id` and `username`.

### Two backend details worth knowing

- **The JWT comes back as `message`, not `token`.** `AuthResponse` has a private
  `token` field but only a `getMessage()` getter, so Jackson serialises it as
  `{"message": "..."}`. `authService.login()` reads `token` first and falls back
  to `message`, so a future DTO change will not break the client.
- **Tokens expire after five minutes.** `jwt.expiration=300000` in
  `application.properties`. The auth context reads `exp` from the JWT and ends
  the session at the same time, showing a "session expired" message instead of
  leaving the UI in a signed-in state the API will reject.

Spring Security in this project has no custom authentication entry point, so an
invalid JWT often produces **403** rather than 401. The Axios interceptor only
logs out on 401 (as requested); the client-side expiry timer covers the expired
token case without treating every 403 as a logout.

## Statuses and priorities

The backend stores `status` and `priority` as plain strings, with no enum. This
frontend uses:

- Status: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- Priority: `LOW`, `MEDIUM`, `HIGH`

Existing values are normalised (for example `in progress` becomes
`IN_PROGRESS`). Unknown values still display with a neutral label and appear in
the dashboard's "Other" slice, but editing a task with an unknown value asks you
to choose one of the three standard options.

Descriptions are capped at 200 characters because the backend entity declares
`@Size(max = 200)`.

## Project structure

```
src/
  components/     Layout, cards, form, dialogs, toasts, loading and empty states
  context/        AuthContext (session + JWT) and ToastContext
  pages/          Login, Register, Dashboard, Tasks
  services/       api.js (single Axios instance), authService, taskService
  utils/          API error messages, JWT reading, task status/priority metadata
```

All HTTP calls live in `src/services`. Components never import Axios directly.

## Notes for development

- React StrictMode is enabled, so development builds intentionally run effects
  twice on mount (you may see a repeated GET in the network tab). Production
  builds make one request.
- The `success` and `error` toasts are announced through a polite live region;
  dialogs close on Escape, trap focus, and restore focus to the trigger.
- If the backend is not running, screens show a retryable error instead of an
  empty list.
