# DanangTrip Admin - Agent Prompt Playbook (Figma -> UI)

This document is a standard prompt framework for Codex/AI when implementing UI from Figma in the `danangtrip-admin` repository.

Goals:

- Follow real admin app conventions, not generic code patterns.
- Ship quickly while respecting architecture, i18n, and quality gates.
- Reduce regressions in dashboard and admin workflows.

---

## 0) Required bootstrap (run once per session)

Use this prompt:

> Act as a Senior Frontend Engineer for repo `d:/DATN/danangtrip-admin`.
>
> Before writing code, you must read:
>
> 1. `.agent/rules/PROJECT_RULES.md`
> 2. `DESIGN.md`
> 3. `package.json`
> 4. current `src/` structure and routes
>
> Rules:
>
> - Current stack: React 19 + Vite + TypeScript + React Router v7.
> - Server state: TanStack Query. Client state: Zustand.
> - i18n: react-i18next (no hardcoded user-facing text).
> - Current icons: lucide-react + react-icons (Solar is a future target, not a shipping blocker now).
> - End each step with: `DONE | DOING | NEXT`.

---

## 1) Figma analysis (no code yet)

Use this prompt:

> Analyze Figma: `[FIGMA_LINK]` for screen `[SCREEN_NAME]`.
>
> Return 5 sections:
>
> 1. Required design tokens (color, spacing, radius, typography, shadow, blur).
> 2. Component breakdown (what can be reused, what must be new).
> 3. Responsive behavior (mobile/tablet/desktop).
> 4. Required UI states (loading, empty, error, success, disabled, hover/focus).
> 5. Display data fields (field, type, required/optional).
>
> Do not create files and do not write code yet.

---

## 2) Map to existing admin codebase (no code yet)

Use this prompt:

> Compare Figma with the current codebase.
>
> Required:
>
> - Find reusable parts in `src/components`, `src/layouts`, `src/pages`.
> - Identify data path: `src/api` + `src/hooks` + `src/dataHelper`.
> - Identify route updates in `src/routes`.
> - Identify i18n keys to add/update (vi/en) by current namespace.
>
> Return:
>
> - List `[REUSE]`, `[NEW]`, `[MOD]` + reason.
> - Gap/risk if conflict with `PROJECT_RULES.md` or `DESIGN.md`.
> - Ask for confirmation before scaffold.

---

## 3) Scaffold plan (no code yet)

Use this prompt:

> Create a file plan for screen `[SCREEN_NAME]`.
>
> Requirements:
>
> - List as: `[NEW|MOD] path - one-line purpose`.
> - Order by: types -> mapper -> api -> hook -> validation -> ui/page -> i18n.
> - If shared files are touched, state impact clearly.
>
> Do not code yet; wait for confirmation.

---

## 4) Implement code (after confirmation)

Use this prompt:

> Implement based on the approved scaffold.
>
> Required order:
>
> 1. Types: define `Raw...` and `ViewModel` (if needed) in correct location (`src/types` or feature-level).
> 2. Mapper: place in `src/dataHelper` when sanitization/transformation is needed.
> 3. API service: place in `src/api/*Api.ts`, use `axiosClient`.
> 4. Hook: place in `src/hooks`, use TanStack Query (`useQuery`, `useMutation`), no API fetch in `useEffect`.
> 5. Validation: place in `src/validations`, support `t()` for messages.
> 6. UI/Page: place in `src/components` and `src/pages` following conventions.
>
> Quality rules:
>
> - Do not duplicate source of truth between Query cache and Zustand.
> - Do not hardcode user-facing text.
> - Do not introduce `any` unless strictly required.
> - Avoid unnecessary cross-import cycles.

---

## 5) Quality review and close

Use this prompt:

> Review changes with this checklist:
>
> - Correct data flow: page/component -> hook -> api -> axios client.
> - No API fetch inside `useEffect`.
> - No mocked/hardcoded API data.
> - i18n vi/en kept in sync.
> - Loading/empty/error states are present.
> - TypeScript remains safe, no unnecessary `any`.
> - Naming/file placement follows [PROJECT_RULES.md].
>
> Run:
>
> - `npm run lint`
> - `npm run typecheck`
> - `npm run build`
> - `npm run prepush:check` (optional full gate)
>
> Report:
>
> - Files created/modified/deleted
> - Check results
> - Residual risks (if any)

---

## Quick prompt (single full-flow run)

> Implement screen from Figma `[FIGMA_LINK]` for repo `d:/DATN/danangtrip-admin`.
>
> Follow this sequence:
>
> 1. Read `.agent/rules/PROJECT_RULES.md`, `DESIGN.md`, `package.json`.
> 2. Analyze Figma + map to existing components/api/hooks.
> 3. Propose scaffold `[NEW|MOD]` and wait for confirmation.
> 4. Implement after confirmation.
> 5. Run `npm run lint`, `npm run typecheck`, `npm run build`.
> 6. Summarize with `DONE | DOING | NEXT`.

## Review code
Review screen `[SCREEN_NAME]` in repo `d:/DATN/danangtrip-admin` (no Figma tasks).

Context:
- Route/file: `[D:\DATN\danangtrip-admin\src]`
- Scope: only review and fix this screen + directly related files.

Do this sequence:
1) Read `.agent/rules/PROJECT_RULES.md`, `DESIGN.md`, `package.json`.
2) Audit this screen by checklist:
   - Validate route conventions (React Router v7) and app shell integration.
   - i18n: no hardcoded user-facing text; keep vi/en keys synchronized.
   - Complete UI states: loading / empty / error / success.
   - Reuse components appropriately (`src/components`, `src/layouts`).
   - Type safety: avoid unnecessary `any`.
   - Correct data flow: api -> hook (TanStack Query) -> UI.
   - Basic accessibility: semantic HTML, focus states, aria, keyboard support.
   - Design consistency with current tokens/rules.
3) List findings by severity: Critical / Major / Minor, with file path + line.
4) Fix all issues within scope.
5) Run `npm run lint`, `npm run typecheck`, `npm run build`; fix until all pass.
6) Final report:
   - Files changed
   - What was fixed
   - Command results
   - Residual risks (if any)

Output format: `DONE | DOING | NEXT`.
