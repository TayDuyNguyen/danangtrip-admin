# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_promotions`.

## Current Decision Snapshot

Date locked: `2026-05-30`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Document repo: `D:\DATN\DATN_Document`
- Selected screen: `Quan ly khuyen mai`
- Feature slug: `admin_promotions`
- Main route: `/admin/promotions`
- Target page path: create under `src/pages/Promotions` following the established admin naming convention.
- Target component folder: create under `src/pages/Promotions/components`.
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_promotions.md`
- Related docs:
  - `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
  - `D:\DATN\DATN_Document\docs\api\api_list.md`
- Primary APIs:
  - `GET /admin/promotions`
  - `POST /admin/promotions`
  - `GET /admin/promotions/{id}`
  - `PUT /admin/promotions/{id}`
  - `PATCH /admin/promotions/{id}/status`
  - `DELETE /admin/promotions/{id}`
  - `GET /promotions` (public)
  - `POST /promotions/validate` (public)
- Status: selected after `admin_site_settings` completed with full deploy closeout on `2026-05-30`.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.
- Previous completed: `admin_site_settings` → deploy report `2026-05-30__admin_site_settings__deploy-report.md`.

## Why This Is Next

- `admin_site_settings` was completed on `2026-05-30` with full deploy/closeout artifacts and `prepush:check` PASS (7/7 Playwright).
- Admin screens still missing real page/route code: `admin_promotions`, `admin_landing_pages`.
- `admin_promotions` is the highest-value next admin screen:
  - It has a complete doc spec (`admin_promotions.md`).
  - No backend API or frontend page exists yet.
  - Promotions/coupons are a critical e-commerce feature that directly affects booking conversion.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- No existing promotions-related code found in admin frontend or API routes.
- Existing reference patterns to reuse:
  - Table + filter pattern: `src/pages/Ratings/index.tsx`, `src/pages/Users/UserList`.
  - Form pattern: `src/pages/Locations/components/LocationForm.tsx`, `src/pages/Blog/BlogPostCreate`.
  - CRUD + status toggle: `src/pages/Blog/BlogPostList` (status toggle pattern).
  - Modal dialogs: `DeleteConfirmDialog`, `BookingCancelDialog`.
- This task should create the promotions management screen and all required backend. Do not drift into landing pages.

## Goals

- Deliver `/admin/promotions` through the 10-step pipeline.
- Build the promotions list, create/edit form, and status toggle based on `admin_promotions.md`.
- Add full backend contract: migration, model, repository, service, controller, requests.
- Cover CRUD, status management, validation, loading/empty/error states.
- Produce artifacts for every step and update memory after each step.
- Use docs root `D:\DATN\DATN_Document`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant settings/config/public-shell artifacts
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Document\docs\page\admin_promotions.md`
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
| `03-types-api-contract` | Contract/code foundation | Confirm settings/config response shapes, validation rules and save/fallback contract. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route and page shell for `/admin/promotions`. |
| `05-ui-components` | Code-producing | Implement grouped settings form, section cards, save states, empty/loading states and responsive layout. |
| `06-data-integration` | Code-producing | Wire settings query/mutation, form hydration, fallback behavior and cache invalidation. |
| `07-interactions` | Code-producing | Implement save/reset interactions, validation UX, unsaved-change handling and accessibility/responsive states. |
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
- Feature slug: `admin_promotions`
- Screen name: `Quan ly khuyen mai`
- Main route: `/admin/promotions`
- Target page area: create under `D:\DATN\danangtrip-admin\src\pages\Promotions`.
- Feature type: authenticated admin promotion/coupon management screen.
- Do not switch to settings, blog, users, contacts, notifications, web, landing pages, or backend-only tasks.

WHY THIS IS NEXT
- `admin_site_settings` completed on `2026-05-30` with deploy closeout and prepush PASS.
- Admin screens still missing real page/route code: `admin_promotions`, `admin_landing_pages`.
- `admin_promotions` is the next highest-value admin screen with a complete doc spec.

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
12. `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Document\docs\page\admin_promotions.md`

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Existing admin patterns: `src/pages/Ratings/index.tsx`, `src/pages/Users/UserList`, `src/pages/Blog/BlogPostCreate`
- Endpoint constants: `src/constants/endpoints.ts`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend contract: No existing promotions API — must be created from scratch.

CONTRACT DETAILS
- Promotions APIs:
  - `GET /admin/promotions` (list with search/filter/pagination)
  - `POST /admin/promotions` (create)
  - `GET /admin/promotions/{id}` (detail)
  - `PUT /admin/promotions/{id}` (update)
  - `PATCH /admin/promotions/{id}/status` (toggle active/inactive)
  - `DELETE /admin/promotions/{id}` (delete)
  - `GET /promotions` (public — list active promotions)
  - `POST /promotions/validate` (public — validate coupon code)
- Verify backend route registration before coding frontend.
- Keep scope centered on promotions unless Step 01 proves a shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_promotions` except shared types/endpoints/hooks.
- Prefer existing admin CRUD patterns over inventing new architecture.
- Run validation in Step 09 and Step 10.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_promotions`.
Read mandatory context, codegraph, progress report, `admin_promotions.md`, existing admin route/form/table patterns and backend API inventory.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-30__admin_promotions__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_promotions`.
Inspect route conventions, i18n loader, API/hook/type patterns, artifact/memory paths and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-30__admin_promotions__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_promotions`.
Inspect backend promotions API (must create), existing admin API modules, hooks and form patterns.
Work: define promotion types, create query/mutation hooks and validation schema.
Output: `.agent/artifacts/api-contracts/2026-05-30__admin_promotions__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_promotions`.
Target route: `/admin/promotions`.
Work: add route constant, lazy route, page shell, sidebar link, breadcrumb/nav path and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-30__admin_promotions__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_promotions`.
Work: implement promotions list with search/filter/status toggle, create/edit modal or dedicated form page, delete dialog, stats row, loading/empty/error states.
Output: `.agent/artifacts/ui-specs/2026-05-30__admin_promotions__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_promotions`.
Work: wire promotions query/mutation, form hydration, save/create/update/delete flows and cache invalidation.
Output: `.agent/artifacts/integration/2026-05-30__admin_promotions__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_promotions`.
Work: implement filter interactions, form validation UX, status toggle, delete confirmation and unsaved-change handling.
Output: `.agent/artifacts/interaction-specs/2026-05-30__admin_promotions__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_promotions`.
Work: verify protected admin route, authenticated API calls, role assumptions and forbidden handling.
Output: `.agent/artifacts/auth/2026-05-30__admin_promotions__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_promotions`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-30__admin_promotions__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_promotions`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-30__admin_promotions__deploy-report.md` and `.agent/artifacts/review/2026-05-30__admin_promotions__review.md`
```
