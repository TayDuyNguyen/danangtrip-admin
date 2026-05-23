# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_reports_users`.

## Current Decision Snapshot

Date locked: `2026-05-23`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Bao cao nguoi dung`
- Feature slug: `admin_reports_users`
- Main route: `/admin/reports/users`
- Target page path: `src/pages/Reports/UsersReport/index.tsx`
- Target component folder: `src/pages/Reports/UsersReport/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_reports_users.md`
- Primary API: `GET /admin/reports/users`
- Export API: `GET /admin/users/export`
- Status: selected next screen after `admin_reports_locations`; Step 01 is pending.
- Implementation reality: backend report endpoint exists, but admin route/page/API hook/mapper are not implemented in the current admin repo.
- Cross-project order: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- Progress override marks `admin_reports_locations` as completed.
- The report cluster already has ratings, bookings, revenue, and locations completed.
- `admin_reports_users` is the remaining high-priority report screen in the near admin backlog.
- Backend route `GET /admin/reports/users` exists.
- Codegraph and repo search show no current `UsersReport` page, route registration, report hook, mapper, or endpoint constants.

## Codegraph Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature.

- Codegraph has no `UsersReport`, `userReports`, or `/admin/reports/users` admin UI nodes; this confirms the screen is not implemented in the admin frontend.
- Existing report patterns to reuse: `RatingsReport`, `BookingsReport`, `RevenueReport`, and `LocationReport`.
- `src/routes/routes.ts` currently has report routes for ratings/bookings/revenue/locations, but not users.
- `src/routes/index.tsx` currently lazy-loads existing report pages, but not users.
- `src/constants/endpoints.ts` has report/export constants for existing report screens, but lacks `REPORTS.USERS` and likely lacks `EXPORT.USERS`.
- `src/api/reportApi.ts` lacks `getUsersReport` and `exportUsersReport`.
- `src/hooks/useReportQueries.ts` owns `reportKeys`, report queries, and report export mutations. Extend it; do not create a parallel query architecture.
- `src/dataHelper/report.dataHelper.ts` and `src/dataHelper/report.mapper.ts` own report contracts and mapping. Add users report types/mappers there.
- Backend reality: `UserReportsDashboardRequest` only validates `year`; the report endpoint does not currently support `from`, `to`, `role`, or `status` filters even if the doc mentions them.
- Backend reality: `DashboardService::getUserReports` returns `{ year, stats }`, where `stats` comes from monthly new-user data.
- Export reality: `GET /admin/users/export` exists separately and may support user-list filters through its own request class. Inspect before wiring filters.

## Goals

- Deliver `admin_reports_users` through the same 10-step feature pipeline used by previous admin report screens.
- Reuse the existing admin report architecture and visual language.
- Implement only what the real backend can support; document mismatches instead of faking data.
- Produce artifacts for every step and update memory after each step.
- Do not switch to admin users CRUD, contacts, CMS, promotions, or web screens.
- Do not use legacy `DATN_T...` document paths; current docs root is `D:\DATN\DATN_Document`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant artifacts for `admin_reports_users` if any
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Real repo sources and docs listed in this prompt

If these sources conflict, follow the earlier item unless repo reality proves it stale. Record stale facts in the artifact.

## Memory Continuity Rules

- At the start of each step, update `.agent/memory/WORKING_STATE.md`.
- After each completed step, update `.agent/memory/WORKING_STATE.md` and append `.agent/memory/SESSION_LOG.md`.
- Update `.agent/memory/HANDOFF.md` if paused, blocked, waiting for approval, or incomplete.
- Do not claim a step is complete until the artifact and memory updates are complete.

## Coding Responsibility By Skill

| Skill | Execution mode | Code expectation |
| --- | --- | --- |
| `01-screen-analysis` | Analysis only | Do not edit product code; create/update analysis artifact and memory. |
| `02-project-setup` | Audit/setup | Usually no feature code; config/script fixes only if required. |
| `03-types-api-contract` | Contract/code foundation | Add/update report types, validation schemas, endpoint constants, API methods, hooks, mappers. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy import, route registration, page shell, sidebar/menu, i18n keys if missing. |
| `05-ui-components` | Code-producing | Implement KPI cards, charts, tables, filters, empty/error/loading states. |
| `06-data-integration` | Code-producing | Wire users report query, mapper, mock fallback if project pattern requires it, export flow. |
| `07-interactions` | Code-producing | Implement year filter, URL sync, export, retry, toasts, disabled states. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin/staff access reality, authenticated export. |
| `09-testing` | Validation/fix loop | Run checks/tests and fix feature-caused failures. |
| `10-optimization-deploy` | Finalization/fix loop | Final review, deploy readiness artifacts, memory handoff. |

## Repository Reality

| Area | Reality |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server state | @tanstack/react-query |
| Client state | zustand |
| HTTP | axios + axiosClient interceptor |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + yup in current standard pattern |
| i18n | react-i18next |
| Icons | lucide-react, react-icons |
| Notifications | sonner |
| Charts | recharts |
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
- Feature slug: `admin_reports_users`
- Screen name: `Bao cao nguoi dung`
- Main route: `/admin/reports/users`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Reports\UsersReport\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Reports\UsersReport\components`
- Feature type: authenticated admin analytics report for user growth, role/status distribution if data exists, monthly stats, filters, and export.
- Do not switch to admin users CRUD, contacts, notifications, CMS, settings, promotions, or web features.

WHY THIS IS NEXT
- `admin_reports_locations` is completed.
- The admin report cluster needs the users report to close the current analytics group.
- Backend route `GET /admin/reports/users` exists.
- Admin frontend has no page/route/API hook/mapper for this screen yet.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_reports_users` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_reports_users.md`
- Related docs: `D:\DATN\DATN_Document\docs\page\admin_dashboard.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_locations.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_revenue.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_bookings.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_ratings.md`; `D:\DATN\DATN_Document\docs\page\admin_users_list.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller/service/request: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\DashboardController.php`; `D:\DATN\danangtrip-api\app\Services\DashboardService.php`; `D:\DATN\danangtrip-api\app\Http\Requests\Admin\Dashboard\UserReportsDashboardRequest.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\vite.config.ts`
- `D:\DATN\danangtrip-admin\tsconfig.app.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- `D:\DATN\danangtrip-admin\src\api\reportApi.ts`
- `D:\DATN\danangtrip-admin\src\api\userApi.ts` if present
- `D:\DATN\danangtrip-admin\src\hooks\useReportQueries.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useUserQueries.ts` if present
- `D:\DATN\danangtrip-admin\src\dataHelper\report.dataHelper.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\report.mapper.ts`
- `D:\DATN\danangtrip-admin\src\pages\Reports\RatingsReport\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\BookingsReport\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\index.tsx`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CODEGRAPH FINDINGS TO HONOR
- There is no existing `UsersReport`; create one path only: `src/pages/Reports/UsersReport`, not both `UserReport` and `UsersReport`.
- Extend existing report endpoints/API/hooks/mappers instead of adding a separate reporting architecture.
- Existing report pages are the implementation pattern for page shell, filters, cards, charts, tables, export, mock fallback, i18n, and loading/error states.
- Backend report endpoint supports `year` only. Do not send unsupported filters to `/admin/reports/users`.
- User export is a separate endpoint and may support different filters; inspect before wiring role/status/status-date filters.

REQUIRED API FLOW
- Primary report endpoint: `GET /admin/reports/users?year=YYYY`.
- Expected backend payload reality: `{ year, stats }`.
- `stats` is monthly new-user data from the backend repository/service.
- Export endpoint: `GET /admin/users/export`.
- If docs ask for KPIs/charts that backend does not provide, derive only defensible values from real payload or show documented unavailable/empty states. Do not fabricate active users, role distribution, or status distribution unless a real API source exists.
- Keep explicit loading, fetching, empty, API-error, retry, export-loading, export-error, and success states.

EXPECTED UX
- Report header with title, description, year filter, refresh, and export action.
- KPI cards for total/new users only if values can be derived or sourced reliably.
- Monthly user growth chart from `stats`.
- Role/status distribution charts only if a real source exists; otherwise document backend gap and omit or mark unavailable.
- Monthly stats table.
- Year filter with validation and URL query sync.
- Vietnamese and English i18n must not expose raw keys.
- Responsive layout consistent with existing report screens.

PIPELINE ORDER
1. `01-screen-analysis`
2. `02-project-setup` if required by repo rules or stale audit
3. `03-types-api-contract`
4. `04-layout-routing`
5. `05-ui-components`
6. `06-data-integration`
7. `07-interactions`
8. `08-auth-permissions`
9. `09-testing`
10. `10-optimization-deploy`

ARTIFACT TARGETS
- Analysis: `.agent/artifacts/analysis/2026-05-23__admin_reports_users__screen-analysis.md`
- Project audit: `.agent/artifacts/audits/2026-05-23__admin_reports_users__project-audit.md`
- API contract: `.agent/artifacts/api-contracts/2026-05-23__admin_reports_users__api-contract.md`
- Routing: `.agent/artifacts/routing/2026-05-23__admin_reports_users__route-plan.md`
- UI spec: `.agent/artifacts/ui-specs/2026-05-23__admin_reports_users__ui-spec.md`
- Data integration: `.agent/artifacts/integration/2026-05-23__admin_reports_users__data-integration.md`
- Interaction spec: `.agent/artifacts/interaction-specs/2026-05-23__admin_reports_users__interaction-spec.md`
- Auth review: `.agent/artifacts/auth/2026-05-23__admin_reports_users__auth-permissions-review.md`
- Test report: `.agent/artifacts/test-cases/2026-05-23__admin_reports_users__test-report.md`
- Deploy report: `.agent/artifacts/deploy/2026-05-23__admin_reports_users__deploy-report.md`
- Final review: `.agent/artifacts/review/2026-05-23__admin_reports_users__review.md`

VALIDATION COMMANDS
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run prepush:check` if available and feasible

BEGIN NOW
Start Step 01 for `admin_reports_users`. Treat this as a new admin frontend report screen backed by an existing but narrow backend report endpoint.
```

## Step Prompts - admin_reports_users

### Step 01

```text
Activate `01-screen-analysis` for `admin_reports_users`.
Repo: `D:\DATN\danangtrip-admin`
Read canonical order plus `.agent/skills/01-screen-analysis/SKILL.md`.
Inputs: progress report, `admin_reports_users.md`, related dashboard/report/user docs, API list, endpoint matrix, backend routes/controller/service/request, codegraph findings, existing report pages/hooks/mappers.
Work: analyze KPIs, supported filters, backend contract gap, charts, table, export, route, i18n, loading/empty/error/mock states. Do not edit product code.
Output: `.agent/artifacts/analysis/2026-05-23__admin_reports_users__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_reports_users`.
Repo: `D:\DATN\danangtrip-admin`
Inspect: `package.json`, `vite.config.ts`, `tsconfig.app.json`, route files, axios/provider setup, i18n setup, existing report screens.
Work: verify stack/scripts/route/i18n/test readiness; fix only setup blockers.
Output: `.agent/artifacts/audits/2026-05-23__admin_reports_users__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_reports_users`.
Inspect: `src/constants/endpoints.ts`, `src/api/reportApi.ts`, `src/hooks/useReportQueries.ts`, `src/dataHelper/report.dataHelper.ts`, `src/dataHelper/report.mapper.ts`, backend `UserReportsDashboardRequest`, `DashboardService::getUserReports`.
Work: add/verify `REPORTS.USERS`, export endpoint, `UsersReportFilters`, raw payload types, view model, mapper, query key, query hook, and export method. Respect backend `year`-only filter reality.
Output: `.agent/artifacts/api-contracts/2026-05-23__admin_reports_users__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_reports_users`.
Target route: `/admin/reports/users`
Target page: `src/pages/Reports/UsersReport/index.tsx`
Inspect: `src/routes/routes.ts`, `src/routes/index.tsx`, sidebar/menu files, i18n registration.
Work: add/verify route constant, lazy import, PrivateRoute/MainLayout placement, navigation/sidebar entry if project pattern requires it, and i18n namespace registration. Do not create duplicate `UserReport`.
Output: `.agent/artifacts/routing/2026-05-23__admin_reports_users__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_reports_users`.
Files: `src/pages/Reports/UsersReport/index.tsx` and components under `UsersReport/components`.
References: `DESIGN.md`, `LocationReport`, `RevenueReport`, `BookingsReport`, `RatingsReport`.
Work: implement page shell, header, year filter, KPI cards, monthly growth chart, optional unavailable cards for unsupported role/status distributions, monthly table, skeletons, empty/error states, and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-23__admin_reports_users__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_reports_users`.
Inspect: `reportApi.ts`, `useReportQueries.ts`, `report.mapper.ts`, `report.dataHelper.ts`, `UsersReport/index.tsx`.
Work: wire `useUsersReportQuery`, mapper, year filter params, loading/error/empty/retry states, export method, refresh behavior, and mock fallback only if existing report pattern requires fallback.
Output: `.agent/artifacts/integration/2026-05-23__admin_reports_users__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_reports_users`.
Files: `UsersReport/index.tsx`, local components, i18n files, route/query utilities.
Work: implement/fix year validation, apply/reset, URL query sync, refresh, export, retry, toasts, disabled states, and keyboard/accessibility behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-23__admin_reports_users__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_reports_users`.
Inspect: `src/routes/index.tsx`, `PrivateRoute`, layout/auth store, report/export API usage.
Work: verify protected route, role/admin-staff reality if implemented, authenticated report/export calls, token refresh handling, and unauthorized/forbidden states. Fix only real permission gaps.
Output: `.agent/artifacts/auth/2026-05-23__admin_reports_users__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_reports_users`.
Run as feasible: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, focused tests if available, `npm.cmd run prepush:check`.
Work: add/update focused tests only if repo pattern supports it, fix feature-caused failures, and document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-23__admin_reports_users__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_reports_users`.
Inputs: artifacts 01-09, validation output, final git diff.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and final review, update `WORKING_STATE.md`, `SESSION_LOG.md`, and `HANDOFF.md`.
Completion rule: do not mark complete until deploy and review artifacts exist with validation evidence.
Outputs: `.agent/artifacts/deploy/2026-05-23__admin_reports_users__deploy-report.md`; `.agent/artifacts/review/2026-05-23__admin_reports_users__review.md`
```

## Files Commonly Read Before Most Tasks

- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- `package.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `src/routes/routes.ts`
- `src/routes/index.tsx`
- `src/constants/endpoints.ts`
- `src/api/axiosClient.ts`
- `src/api/reportApi.ts`
- `src/hooks/useReportQueries.ts`
- `src/dataHelper/report.dataHelper.ts`
- `src/dataHelper/report.mapper.ts`
- `src/pages/Reports/LocationReport/index.tsx`
- `src/pages/Reports/RevenueReport/index.tsx`
- `public/lang/vi`
- `public/lang/en`
