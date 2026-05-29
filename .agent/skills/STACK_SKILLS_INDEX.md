# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_ratings_list`.

## Current Decision Snapshot

Date locked: `2026-05-29`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Document repo: `D:\DATN\DATN_Tài liệu`
- Selected screen: `Quan ly danh gia`
- Feature slug: `admin_ratings_list`
- Main route: `/admin/ratings`
- Target page path: create under `src/pages/Ratings` using the closest established local admin naming convention discovered by Step 01.
- Target component folder: create under `src/pages/Ratings/components` if Step 01 confirms this is the cleanest local pattern.
- Primary doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_ratings_list.md`
- Related docs:
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_reports_ratings.md`
  - `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
- Primary APIs:
  - `GET /admin/ratings`
  - `PATCH /admin/ratings/{id}/approve`
  - `PATCH /admin/ratings/{id}/reject`
  - `DELETE /admin/ratings/{id}`
  - `GET /admin/ratings/export`
- Status: selected after progress report `0.0.17` confirmed `admin_blog_categories` now has real code, while admin still has `6` documented screens without real page/route code and `admin_ratings_list` is now the clearest next gap.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.17` selects `admin_ratings_list` as the next admin screen.
- Repo reality confirms `admin_blog_categories` is no longer a missing-code screen:
  - `src/pages/Blog/BlogCategories/index.tsx`
  - route wiring exists
  - category drag-and-drop and reorder support now exist
- Backend/admin API support for ratings is already present:
  - endpoint constants in `src/constants/endpoints.ts`
  - action methods in `src/api/reportApi.ts`
  - dashboard fallback already queries `/admin/ratings`
- Repo reality now includes a dedicated `/admin/ratings` page/route module under `src/pages/Ratings`, and the screen should follow a management workflow rather than a pre-publication approval queue.
- Admin screens still missing real page/route code are:
  - `admin_landing_pages`
  - `admin_promotions`
  - `admin_ratings_list`
  - `admin_site_settings`
  - `admin_subcategories`
  - `admin_tags_amenities`

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing ratings/report modules to inspect and reuse:
  - `src/pages/Reports/RatingsReport`
  - `src/api/reportApi.ts`
  - `src/hooks/useReportQueries.ts`
  - `src/constants/endpoints.ts`
  - dashboard fallback ratings access in `src/api/dashboardApi.ts`
  - `public/lang/vi` and `public/lang/en` report/common namespaces
- Existing router reality:
  - ratings report route exists at `/admin/reports/ratings`
  - no standalone moderation/list route exists yet at `/admin/ratings`
- This task should maintain the admin ratings management screen, not rework the existing ratings report page unless Step 01 proves a small shared dependency is needed.

## Goals

- Deliver `/admin/ratings` through the 10-step pipeline.
- Build and maintain a dedicated admin ratings management screen based on `admin_ratings_list.md`.
- Reuse existing report/ratings API support instead of inventing a parallel backend contract.
- Cover list, filter, hide, delete, export and bulk-selection behavior as far as the real API safely allows.
- Preserve loading, empty, forbidden and backend validation behavior.
- Keep unrelated admin modules out of scope.
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
7. Latest relevant ratings/report/category artifacts
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Tài liệu\docs\page\admin_ratings_list.md`
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
| `03-types-api-contract` | Contract/code foundation | Confirm ratings list/filter/action response shapes, export path, hide/delete actions and validation contract. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route and page shell for `/admin/ratings`. |
| `05-ui-components` | Code-producing | Implement header, stats row, filters, card list, empty/loading states and responsive layout. |
| `06-data-integration` | Code-producing | Wire list query, filters, bulk state, hide/delete/export flows and cache invalidation. |
| `07-interactions` | Code-producing | Implement management interactions, inline hide form, bulk actions, confirm dialogs and accessibility/responsive states. |
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
- Feature slug: `admin_ratings_list`
- Screen name: `Danh sach danh gia`
- Main route: `/admin/ratings`
- Target page area: create under `D:\DATN\danangtrip-admin\src\pages\Ratings` using the closest established admin naming convention discovered in Step 01.
- Feature type: authenticated admin/staff rating management screen.
- Do not switch to reports, blog, users, contacts, notifications, web, or backend-only tasks.

WHY THIS IS NEXT
- Progress report `0.0.17` selects `admin_ratings_list` as the next admin screen.
- `admin_blog_categories` is no longer a missing-code screen.
- Backend/API support for ratings management already exists.
- Repo reality includes a dedicated `/admin/ratings` page/route module and should be kept aligned with the real business rule: ratings are visible immediately and only need management actions later.
- Admin currently still has `6` documented screens without real page/route code, and `admin_ratings_list` is the clearest next missing screen.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant ratings/report artifacts
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
13. `D:\DATN\DATN_Tài liệu\docs\page\admin_ratings_list.md`

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
- Existing ratings/report modules: `src/pages/Reports/RatingsReport`, `src/api/reportApi.ts`, `src/hooks/useReportQueries.ts`
- Endpoint constants: `src/constants/endpoints.ts`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend request/controller/service/repository: admin ratings routes and management handlers

CONTRACT DETAILS
- Ratings APIs:
  - `GET /admin/ratings`
  - `PATCH /admin/ratings/{id}/reject`
  - `DELETE /admin/ratings/{id}`
  - `GET /admin/ratings/export`
- Verify actual backend response shape before coding; use backend-safe params only.
- Keep scope centered on the ratings management screen unless Step 01 proves a small shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_ratings_list` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing report and ratings management patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_ratings_list`.
Read mandatory context, codegraph, progress report, `admin_ratings_list.md`, existing ratings/report modules and backend ratings moderation contract.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-29__admin_ratings_list__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_ratings_list`.
Inspect route conventions, i18n loader, API/hook/type patterns, artifact/memory paths and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-29__admin_ratings_list__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_ratings_list`.
Inspect backend ratings response shape, existing report API module, hooks and moderation action patterns.
Work: add or align list/filter/action types, query/mutation hooks and validation contract.
Output: `.agent/artifacts/api-contracts/2026-05-29__admin_ratings_list__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_ratings_list`.
Target route: `/admin/ratings`.
Work: add route constant if missing, lazy route, page shell, breadcrumb/nav path and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-29__admin_ratings_list__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_ratings_list`.
Work: implement moderation header, stats row, filter bar, card list, empty/loading states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-29__admin_ratings_list__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_ratings_list`.
Work: wire list query, filters, approve/reject/delete actions, export flow, cache invalidation and backend error handling.
Output: `.agent/artifacts/integration/2026-05-29__admin_ratings_list__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_ratings_list`.
Work: implement moderation interactions, inline reject form, bulk-selection behavior, confirm dialogs and responsive/accessibility behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-29__admin_ratings_list__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_ratings_list`.
Work: verify protected admin route, authenticated admin API calls, role assumptions and forbidden handling.
Output: `.agent/artifacts/auth/2026-05-29__admin_ratings_list__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_ratings_list`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-29__admin_ratings_list__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_ratings_list`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-29__admin_ratings_list__deploy-report.md` and `.agent/artifacts/review/2026-05-29__admin_ratings_list__review.md`
```
