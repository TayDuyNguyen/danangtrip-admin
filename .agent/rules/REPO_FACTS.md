# DanangTrip Admin Repo Facts

This file is the compact, high-priority facts sheet for AI and contributors.
Use it to stay aligned with the real repository instead of generic templates.

Priority:
1. `PROJECT_RULES.md`
2. `REPO_FACTS.md`
3. Real repository files (`package.json`, `src/`, config files)
4. Skill docs under `.agent/skills/`

## Current Stack

| Area | Current reality |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server/client data | TanStack Query v5 |
| Client state | Zustand v5 |
| HTTP | Axios via `src/api/axiosClient.ts` |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + yup + `@hookform/resolvers` |
| i18n | react-i18next |
| Browser checks | Playwright console spec |
| Build gate | `npm run prepush:check` |

## Repository Shape

- Route-level screens live under `src/pages/`.
- Shared UI lives under `src/components/`.
- API wrappers live under `src/api/`.
- Query hooks live under `src/hooks/`.
- Typed mapping helpers live under `src/dataHelper/`.
- Validation schemas live under `src/validations/`.
- Router wiring lives under `src/routes/`.
- Providers live under `src/providers/`.

## Form And Validation Reality

- `react-hook-form` is an actual current standard in this repo.
- `yupResolver` is already used in live code, for example:
  - `src/pages/Login/index.tsx`
  - `src/pages/Locations/components/LocationForm.tsx`
  - `src/pages/Tours/TourCreate/index.tsx`
- Validation messages should stay connected to `t`.

## Data Fetching Reality

- Prefer hook -> query -> api module -> `axiosClient`.
- TanStack Query is the source of truth for server data.
- Do not mirror query results into Zustand unless there is a clear client-state reason.

## Auth And Error Handling Reality

- Shared auth/network behavior lives around `src/api/axiosClient.ts` and related hooks/stores.
- Avoid duplicating generic toast/error behavior both in interceptors and in every mutation.

## Testing Reality

- Native checks:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npm run prepush:check`
- Browser check when relevant:
  - `npm run test:console`

## Agent Guardrails

- Prefer project-local examples over generic CRUD dashboard templates.
- Before creating new helpers, search existing `src/hooks/`, `src/dataHelper/`, `src/utils/`, and `src/validations/`.
- If a skill example conflicts with this file, follow the repo and update the artifact accordingly.
