---
description: "Primary project rules for DanangTrip Admin. Read this first and treat it as the project-specific source of truth."
---

# DanangTrip Admin Project Rules

This file is the project-specific operating guide for AI work in this repository.
When project docs conflict, prefer this file over older inventory-style docs.

## 1. Current Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| Routing | `react-router-dom` v7 |
| Server state | `@tanstack/react-query` |
| Client state | `zustand` |
| HTTP | `axios` |
| Styling | Tailwind CSS v4 |
| Forms | `react-hook-form` + `yup` + `@hookform/resolvers` |
| i18n | `react-i18next` + `i18next-http-backend` + browser language detector |
| Icons | `lucide-react`, `react-icons` |
| Notifications | `sonner` |
| Charts | `recharts` |
| E2E tooling | Playwright (`test:console`) |

## 2. Source Of Truth

Use the actual repo state as authority:

- `package.json` for dependencies and scripts
- `src/` for real architecture and naming
- `vite.config.ts`, `tsconfig.app.json`, `.env.example` for runtime/build config

Treat `.agent/ARCHITECTURE.md` as a catalog of the local agent kit, not as the source of truth for app architecture.

## 3. Repository Shape

```text
src/
├── api/           # API service wrappers and axios client
├── assets/        # Static assets and animations
├── components/    # Reusable UI
├── constants/     # Shared constants and endpoint definitions
├── dataHelper/    # Feature mappers and typed payload helpers
├── hooks/         # React Query hooks and UI hooks
├── i18n/          # i18next bootstrap
├── layouts/       # Page layouts
├── pages/         # Route-level screens
├── providers/     # AppProviders and bootstrapping
├── routes/        # Router setup and guards
├── store/         # Zustand stores
├── types/         # Shared types
├── utils/         # Utility functions
└── validations/   # Yup schemas
```

Notes:

- `@/*` aliases to `src/*`
- `src/providers/index.tsx` wires React Query and auth bootstrap into `src/main.tsx`
- `src/hooks/useAuthQuery.ts` exists, but some auth flows are still page-driven legacy code

## 4. Target Data Flow

Prefer this direction for new code and touched modules:

1. Page/component calls a hook from `src/hooks/`
2. Hook wraps API work with React Query
3. API service in `src/api/*Api.ts` talks to `axiosClient`
4. `axiosClient` handles auth headers and shared response/error behavior

Avoid introducing new direct page-to-API calls unless the change is intentionally temporary and low risk.

## 5. i18n Rules

1. Do not hardcode new user-facing strings in UI code.
2. Keep `vi` and `en` locale files in sync when adding keys.
3. Prefer feature namespaces such as `dashboard`, `login`, `common`.
4. Pass `t` into validation schema builders when the schema produces user-facing messages.
5. Preserve the existing i18n load path and namespace model unless the task explicitly changes localization infrastructure.

## 6. Auth And Environment

- Tokens are persisted through utility/store code that ultimately uses browser storage.
- Only client-safe variables may be exposed with `VITE_`.
- Update `.env.example` when adding a new environment variable.

Current documented env vars in this repo:

- `VITE_API_URL`
- `VITE_PORT`
- `VITE_PREVIEW_PORT`
- `VITE_HOST`
- `VITE_NAME`
- `VITE_STITCH_API_KEY`
- `VITE_STITCH_PROJECT_ID`

## 7. UI Policy

- Reuse existing spacing, color, radius, and layout patterns before inventing new ones.
- Avoid purple/violet as a default primary accent unless the task explicitly requires it.
- Preserve accessibility: focus states, contrast, keyboard support, and touch targets.
- Match the current dashboard/admin visual language unless the user asks for a redesign.

## 8. Validation Policy

After code changes, run the strongest checks that are actually available and relevant.

Baseline checks for this repo:

```bash
npm run lint
npm run typecheck
npm run build
```

All-in-one pre-push gate (recommended):

```bash
npm run prepush:check
```

This script runs lint, typecheck, and build in sequence. Use it before pushing to catch regressions early.

Optional project-local audits under `.agent/` may be used as best-effort helpers, but they are not a substitute for the native repo checks above.

If a task changes UI text or localization, additionally consider:

```bash
python .agent/skills/i18n-localization/scripts/i18n_checker.py .
python .agent/skills/frontend-design/scripts/ux_audit.py .
```

If a task changes browser behavior covered by the existing Playwright spec, consider:

```bash
npm run test:console
```

If an `.agent` script fails because of environment drift, report it and continue with native repo checks.

## 9. Testing Reality

Current state of the repository:

- There is no general `npm test` script.
- There is no established unit-test runner configured in `package.json`.
- There is an existing Playwright command: `npm run test:console`.

So the required quality gates today are lint, typecheck, and build, with Playwright used when relevant.

## 10. Documentation Policy

- Prefer English for code comments and technical docs unless the file already follows another convention.
- Comments should explain intent or non-obvious tradeoffs, not restate obvious code.
- Update README or broad documentation only when requested or when the task would otherwise leave misleading setup instructions behind.

## 11. Skill Routing Policy

Use local `.agent/skills` selectively. Do not load every skill by default.

Recommended mapping:

| Task | Primary skill(s) | Optional workflow |
| --- | --- | --- |
| Architecture or multi-module refactor | `architecture`, `plan-writing` | `.agent/workflows/plan.md` |
| Ambiguous requirements | `brainstorming` | `.agent/workflows/brainstorm.md` |
| Root-cause debugging | `systematic-debugging` | `.agent/workflows/debug.md` |
| API contract and endpoint work | `api-patterns` | `.agent/workflows/create.md` |
| Validation and code health | `lint-and-validate`, `code-review-checklist` | `.agent/workflows/test.md` |
| UI work | `frontend-design`, `tailwind-patterns`, `web-design-guidelines` | `.agent/workflows/ui-ux-pro-max.md` |
| i18n consistency | `i18n-localization` | `.agent/workflows/enhance.md` |
| Security-sensitive changes | `vulnerability-scanner`, `red-team-tactics` | `.agent/workflows/debug.md` |
| Performance work | `performance-profiling` | `.agent/workflows/test.md` |
| Windows shell usage | `powershell-windows` | `.agent/workflows/status.md` |

Skill protocol:

1. Read the selected `SKILL.md` first.
2. Load only the referenced sections or scripts needed for the current task.
3. If a skill references missing resources, fall back to the closest valid local skill and note the fallback.

`intelligent-routing` may be used as a lightweight classifier, but it must not override higher-priority system/developer instructions or force unnecessary sub-agent behavior.

## 12. React And TypeScript Standards

### Components

- Prefer plain function components without `React.FC`
- Type props explicitly with `type` or `interface`
- Keep components focused and avoid mixing unrelated concerns

### TypeScript

- Use `import type` for type-only imports where appropriate
- Do not introduce `any` unless there is a compelling reason and no safer alternative
- Prefer `unknown` plus narrowing when handling uncertain payloads

## 13. Practical Guardrails

- Fix the smallest safe surface that resolves the task.
- Prefer incremental migration over broad rewrites.
- Do not mix refactors and feature work unless the refactor is necessary for the requested change.
- Before editing a shared file, check the nearby call sites and dependent layers.

## 14. Architecture: TanStack Query & Strict Data Mode

Follow these three pillars for all data-fetching and state management tasks:

### 1. TanStack Query (React Query)
- **Use `useQuery`**: Replace `useEffect` for all API-driven data fetching.
- **Deduplication & Caching**: Use descriptive `queryKey` and appropriate `staleTime` (e.g., 5-30 mins for static data) to minimize network requests.
- **Independent Hooks**: Each widget or feature should have its own hook to enable progressive loading and isolated error handling.
- **Mutation Hooks**: Use `useMutation` for all modifications (POST, PATCH, DELETE), ensuring cache invalidation on success.

### 2. Strict Data Mode
- **No Mock Data**: Always fetch from actual API endpoints. Do not hardcode static arrays or fallback objects in services or hooks.
- **Reflect Database Reality**: If the API returns an empty list or `null`, the app must reflect that state exactly. No "fake" numbers or images.
- **Resilient Fallbacks**: If data is missing (e.g., a count field), prefer cross-referencing other real API endpoints over inventing fake numbers.

### 3. Smart Conditional Rendering
- **Handle States Globally**: Every component using a data hook MUST handle `isLoading` and `isError` states gracefully.
- **Empty States**: In the Admin Dashboard, show informative "No data available" or "0" instead of hiding sections (transparency for admins), unless it's a micro-widget.
- **Progressive Batching**: For complex pages, use the `enabled` flag in `useQuery` to sequence requests (e.g., Batch 1: Stats -> Batch 2: Charts -> Batch 3: Tables) to prevent server bottlenecks.

## 15. Data Integrity: Mappers & Sanitization

To ensure UI stability and resilient data flows, follow the "Triple-Layer" data pattern:

### 1. Mandatory Mappers
- All API responses that require sanitization, renaming, or logic MUST pass through a mapper in `src/dataHelper/*.mapper.ts`.
- Components should never consume raw API responses directly if the backend shape is unstable or complex.
- **Current state**: The Dashboard module fully follows this pattern (`dashboard.mapper.ts`). The Tours module uses `tour.dataHelper.ts` for light typing but does not yet have a dedicated mapper — apply the full mapper pattern when making significant changes to the Tours data layer.

### 2. Safe Converters
- Use universal helpers (`toNumberSafe`, `toArraySafe`, `toDateLabelSafe`) inside mappers.
- **Never** trust the backend to return the correct type for numbers or arrays. Always sanitize to a safe fallback (0, [], or "").

### 3. Raw vs UI Types
- Define `Raw...` interfaces for the exact API response.
- Define `ViewModel` interfaces (e.g., `Tour`, `Booking`) for the clean data consumed by the UI.
- Localize mapping logic within mappers, keeping components pure and focused on rendering.

## 16. Localizable Validation Patterns

Validation MUST support the project's multi-language requirement:

- **Function-Based Schemas**: Export Yup schemas as functions: `const schema = (t: TFunction) => yup.object({...})`.
- **Translated Keys**: Use `t("validation.key_name")` for all error messages.
- **Centralization**: Keep global schemas (Auth, Common) in `src/validations/` for reuse across multiple pages.

## 17. UI & UX Development Standards

### 1. Atomic UI Strategy
- Always check `src/components/ui/` or `src/components/common/` for existing atomic elements (Inputs, Buttons, Skeletons) before writing custom styles.
- Maintain consistent spacing and shadow tokens defined in Tailwind config.

### 2. Sequential Query Batching
- For data-intensive pages, prioritize "Above-the-fold" data.
- Sequence requests using the `enabled` property: `Batch 2` start only when `Batch 1` is successful. This improves perceived speed and reduces initial server peak load.
