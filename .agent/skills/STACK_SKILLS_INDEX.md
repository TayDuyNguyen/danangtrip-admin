# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_landing_pages`.

## Current Decision Snapshot

Date locked: `2026-06-02`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Document repo: `D:\DATN\DATN_Tài liệu`
- Selected screen: `Quan ly landing pages`
- Feature slug: `admin_landing_pages`
- Main route: `/admin/landing-pages`
- Target page path: create under `src/pages/LandingPages` following the established admin naming convention.
- Target component folder: create under `src/pages/LandingPages/components`.
- Primary doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_landing_pages.md`
- Related docs:
  - `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
  - API docs under `D:\DATN\DATN_Tài liệu\docs\api` if available.
- Primary APIs: no landing pages API was found in current codegraph/repo scan. Step 01 must confirm whether this feature needs backend CRUD or can reuse existing content/config APIs.
- Status: selected after codegraph refresh showed `admin_promotions` already has route/page/API/backend code and `admin_landing_pages` is the remaining admin code-level gap.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.
- Previous codegraph-confirmed improvement: `admin_promotions` exists with frontend page/API hook/types/validation and backend promotion routes/controllers/service/repository/model.

## Why This Is Next

- The 2026-06-02 progress report section `0.0.20` marks `admin_promotions` as no longer missing.
- Admin codegraph snapshot:
  - `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
  - Modified: `2026-06-02 10:36:53`
  - Files: `380`
  - Nodes: `3789`
  - Edges: `9282`
  - Unresolved refs: `0`
- Current repo/codegraph findings:
  - Promotions exists: `src/pages/Promotions/index.tsx`, components, `promotionsApi`, `usePromotionQueries`, `promotion.types.ts`, `promotion.schema.ts`.
  - No `landing-pages`, `landing_pages`, `LandingPages`, or `admin/landing` route/page/API match was found.
- Therefore `admin_landing_pages` is the only remaining admin screen gap identified by the latest progress report and codegraph scan.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, route constants in `src/routes/routes.ts`, lazy route wiring in `src/routes/index.tsx`.
- Existing reference patterns to reuse:
  - Table + filter pattern: `src/pages/Ratings/index.tsx`, `src/pages/Users/UserList`, `src/pages/Promotions/index.tsx`.
  - Form/drawer pattern: `src/pages/Promotions/components/PromotionFormDrawer.tsx`, `src/pages/Locations/components/LocationForm.tsx`.
  - CRUD + status toggle: `src/pages/Promotions`, `src/pages/Blog/BlogPostList`.
  - Modal dialogs: `DeleteConfirmDialog`, `BookingCancelDialog`.
- This task should implement landing page management only. Do not drift back into promotions, settings, reports, or web tasks.

## Goals

- Deliver `/admin/landing-pages` through the 10-step pipeline.
- Build the landing pages list, create/edit workflow, status/publish controls, preview/link actions, and professional loading/empty/error states based on `admin_landing_pages.md`.
- Confirm backend requirement in Step 01 and Step 03. If no backend exists, create the minimum required API contract in `danangtrip-api` only after documenting it.
- Produce artifacts for every step and update memory after each step.
- Use docs root `D:\DATN\DATN_Tài liệu`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant admin artifacts
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Tài liệu\docs\page\admin_landing_pages.md`
14. Real repo sources and backend routes/controllers/services/repositories discovered by Step 01

If sources conflict, follow repo reality and record stale facts in the artifact.

## Memory Continuity Rules

- At the start of each step, update `.agent/memory/WORKING_STATE.md`.
- After each completed step, update `.agent/memory/WORKING_STATE.md` and append `.agent/memory/SESSION_LOG.md`.
- Update `.agent/memory/HANDOFF.md` if paused, blocked, waiting for approval, or incomplete.
- Do not claim a step is complete until the artifact and memory updates are complete.

## Coding Responsibility By Skill

| Skill | Execution mode | Code expectation |
| --- | --- | --- |
| `01-screen-analysis` | Analysis only | Do not edit product code; document route/doc/API gaps and implementation plan. |
| `02-project-setup` | Audit/setup | Verify route constants, lazy route conventions, i18n, artifact paths and package scripts. |
| `03-types-api-contract` | Contract/code foundation | Define or confirm landing page request/response types, validation and API endpoints. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route, page shell and navigation for `/admin/landing-pages`. |
| `05-ui-components` | Code-producing | Implement landing page list, filters, editor entry points, preview/status states and responsive layout. |
| `06-data-integration` | Code-producing | Wire query/mutation, form hydration, create/update/delete/status flows and cache invalidation. |
| `07-interactions` | Code-producing | Implement publish/unpublish, preview, duplicate/delete confirmation, validation UX and accessibility states. |
| `08-auth-permissions` | Review/fix | Verify protected admin route, authenticated API calls and forbidden handling. |
| `09-testing` | Validation/fix loop | Run checks/tests and fix feature-caused failures. |
| `10-optimization-deploy` | Finalization/fix loop | Final review, deploy readiness artifacts, validation evidence, memory handoff. |

## Repository Reality

| Area | Reality |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server state | @tanstack/react-query |
| Client state | zustand |
| HTTP | axios + axiosClient interceptor |
| Styling | Tailwind CSS v4 |
| i18n | react-i18next |
| Forms | react-hook-form + yup where existing forms use it |
| Notifications | sonner |
| Build gate | `npm run prepush:check` |

## Pipeline Map

| # | Skill | Primary artifact |
| --- | --- | --- |
| 01 | `01-screen-analysis` | `analysis/...__screen-analysis.md` |
| 02 | `02-project-setup` | `audits/...__project-audit.md` |
| 03 | `03-types-api-contract` | `api-contracts/...__api-contract.md` |
| 04 | `04-layout-routing` | `routing/...__route-plan.md` |
| 05 | `05-ui-components` | `ui-specs/...__ui-spec.md` |
| 06 | `06-data-integration` | `integration/...__data-integration.md` |
| 07 | `07-interactions` | `interaction-specs/...__interaction-spec.md` |
| 08 | `08-auth-permissions` | `auth/...__auth-permissions-review.md` |
| 09 | `09-testing` | `test-cases/...__test-report.md` |
| 10 | `10-optimization-deploy` | `deploy/...__deploy-report.md`, `review/...__review.md` |

## Recommended Current Screen Prompt

```text
SYSTEM EXECUTION CONTRACT

Act as the execution agent for repository: `D:\DATN\danangtrip-admin`

CURRENT SCREEN LOCK
- Feature slug: `admin_landing_pages`
- Screen name: `Quan ly landing pages`
- Main route: `/admin/landing-pages`
- Target page area: create under `D:\DATN\danangtrip-admin\src\pages\LandingPages`.
- Feature type: authenticated admin landing page/content management screen.
- Do not switch to promotions, settings, blog, users, contacts, notifications, web, or backend-only tasks.

WHY THIS IS NEXT
- Codegraph refresh confirms `admin_promotions` already exists with frontend and backend code.
- Progress report `0.0.20` identifies `admin_landing_pages` as the only remaining admin code-level gap.
- No landing page route/page/API/module was found in the current admin/API repo scan.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant artifacts
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Tài liệu\docs\page\admin_landing_pages.md`

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
- Existing admin patterns: `src/pages/Promotions`, `src/pages/Blog`, `src/pages/Users/UserList`
- Endpoint constants: `src/constants/endpoints.ts`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend contract: no landing pages API found yet; Step 01/03 must define it if the doc requires persistence.

CONTRACT DETAILS
- Expected admin route: `/admin/landing-pages`
- Expected frontend area: `src/pages/LandingPages`
- Expected feature capabilities must be confirmed from `admin_landing_pages.md`.
- Keep scope centered on landing page management unless Step 01 proves a shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_landing_pages` except shared types/endpoints/hooks.
- Prefer existing admin CRUD patterns over inventing new architecture.
- Run validation in Step 09 and Step 10.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_landing_pages`.
Read mandatory context, codegraph, progress report, `admin_landing_pages.md`, existing admin route/form/table patterns and backend API inventory.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks and implementation plan.
Output: `.agent/artifacts/analysis/2026-06-02__admin_landing_pages__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_landing_pages`.
Inspect route conventions, i18n loader, API/hook/type patterns, artifact/memory paths and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-06-02__admin_landing_pages__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_landing_pages`.
Inspect backend landing pages API availability, existing admin API modules, hooks and form patterns.
Work: define landing page types, endpoint contract, query/mutation hooks and validation schema.
Output: `.agent/artifacts/api-contracts/2026-06-02__admin_landing_pages__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_landing_pages`.
Target route: `/admin/landing-pages`.
Work: add route constant, lazy route, page shell, sidebar link, breadcrumb/nav path and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-06-02__admin_landing_pages__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_landing_pages`.
Work: implement landing pages list with search/filter/status, create/edit entry, preview action, delete dialog, loading/empty/error states.
Output: `.agent/artifacts/ui-specs/2026-06-02__admin_landing_pages__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_landing_pages`.
Work: wire landing page query/mutation, form hydration, save/create/update/delete flows and cache invalidation.
Output: `.agent/artifacts/integration/2026-06-02__admin_landing_pages__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_landing_pages`.
Work: implement filter interactions, form validation UX, publish/status controls, preview, delete confirmation and unsaved-change handling.
Output: `.agent/artifacts/interaction-specs/2026-06-02__admin_landing_pages__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_landing_pages`.
Work: verify protected admin route, authenticated API calls, role assumptions and forbidden handling.
Output: `.agent/artifacts/auth/2026-06-02__admin_landing_pages__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_landing_pages`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-06-02__admin_landing_pages__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_landing_pages`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-06-02__admin_landing_pages__deploy-report.md` and `.agent/artifacts/review/2026-06-02__admin_landing_pages__review.md`
```
