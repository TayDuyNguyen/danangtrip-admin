# DaNang Trip Admin - Agent Memory

## Project Overview

- Name: `danangtrip-admin`
- Type: React/TypeScript admin dashboard
- Build tool: Vite
- Primary languages: TypeScript, Tailwind CSS
- UI language support: Vietnamese and English via i18n

## Current Tech Stack

- Frontend: React 19
- State management: `@tanstack/react-query` for server state, `zustand` for client state
- Routing: React Router v7
- Styling: Tailwind CSS v4
- Forms: React Hook Form + Yup
- HTTP client: Axios
- UI libraries: Lucide React, React Icons, Sonner
- Charts: Recharts
- Animation: Lottie
- i18n: i18next + `react-i18next` + browser language detector + HTTP backend
- E2E tooling: Playwright (`npm run test:console`)

## Key Project Structure

```text
src/
├── api/           # axios client and feature API wrappers
├── assets/        # animations and static assets
├── components/    # shared UI pieces
├── constants/     # shared constants and endpoints
├── dataHelper/    # mappers and typed feature helpers
├── hooks/         # React Query hooks and UI hooks
├── i18n/          # i18next setup
├── layouts/       # layout components
├── pages/         # route screens
├── providers/     # AppProviders / bootstrap wiring
├── routes/        # route config and guards
├── store/         # Zustand stores
├── types/         # shared types
├── utils/         # utilities
└── validations/   # Yup schemas
```

## Important Notes

- The repo is React Query + Zustand, not Redux.
- The repo currently uses React 19, not React 18.
- Some older page code still calls APIs directly, but new code should prefer the hook -> API service pattern.
- `@/*` resolves to `src/*`.
- Locale assets are loaded from `/lang/{{lng}}/{{ns}}.json`.

## Validation Notes

- Main checks: `npm run lint`, `npm run typecheck`, `npm run build`
- Extra browser check available: `npm run test:console`

## Documentation Note

For project-specific decisions, prefer `.agent/rules/PROJECT_RULES.md` over older inventory-style docs if they conflict.
