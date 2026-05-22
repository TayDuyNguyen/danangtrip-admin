# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_reports_locations`.

## Current Decision Snapshot

Date locked: `2026-05-22`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Bao cao Dia diem`
- Feature slug: `admin_reports_locations`
- Main route: `/admin/reports/locations`
- Actual page path: `src/pages/Reports/LocationReport/index.tsx`
- Actual component folder: `src/pages/Reports/LocationReport/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_reports_locations.md`
- API: `GET /admin/reports/locations`, `GET /admin/locations/export`
- Status: Step 10 completed; feature-specific deploy/review artifacts now exist.
- Validation status: `npm.cmd run typecheck` PASS; `npm.cmd run lint` PASS; `npm.cmd run build` PASS; `npm.cmd run prepush:check` PASS on 2026-05-22.
- Important distinction: `admin_reports_locations` now has its own Step 10 artifacts; repo-level audit artifacts are no longer needed for this feature closeout.
- Cross-project order: this admin feature is closed; select the next admin feature independently from web.

## Codegraph Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature.

- Current `.codegraph` is useful for this admin feature and resolves the real `LocationReport` files, hooks, mapper, and Playwright spec.
- `src/pages/Reports/LocationReport/index.tsx` is the actual page. It contains `LocationReport`, `getFirstDayOfMonth`, `getToday`, `getMockLocationReportData`, and `TAB_SORT_MAP`.
- `LocationReport` calls `useLocationsReportQuery`, `useReportMutations`, and `getMockLocationReportData`.
- The page imports local components: `LocationReportFilterBar`, `LocationStatsCards`, `LocationReportCharts`, `LocationReportTables`.
- `src/hooks/useReportQueries.ts` defines `reportKeys`, `useLocationsReportQuery`, and `useReportMutations`; it calls `reportApi`, `locationApi`, `mapLocationsReport`, `refreshAccessToken`, and spreadsheet export helpers.
- `src/dataHelper/report.mapper.ts` defines `mapLocationsReport`.
- `src/dataHelper/report.dataHelper.ts` owns `LocationReportFilters`, `RawLocationReportItem`, `LocationReportItemViewModel`, and `LocationReportViewModel`.
- `tests/admin-reports-locations.spec.ts` exists and must be considered in Step 09 and Step 10.
- Do not create `src/pages/Reports/LocationsReport`; codegraph resolves the real feature through `LocationReport`.

## Goals

- Stay aligned with the real `danangtrip-admin` repository.
- Treat `.agent` memory/artifacts and repo reality as source of truth.
- Close the active report feature before switching to users, contacts, CMS, or settings.
- Do not use legacy `DATN_T...` document paths; current docs root is `D:\DATN\DATN_Document`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant artifacts for `admin_reports_locations`
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Real repo sources and docs listed in the prompt

If these sources conflict, follow the earlier item unless repo reality proves the earlier item stale; record stale facts in the artifact.

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
| `03-types-api-contract` | Contract/code foundation | Add/update types, validation schemas, endpoint constants, API modules, mappers when missing. |
| `04-layout-routing` | Routing/code scaffold | Add/update route constants, lazy imports, route registration, page shells, sidebar/menu, i18n keys. |
| `05-ui-components` | Code-producing | Implement/update UI components immediately. |
| `06-data-integration` | Code-producing | Wire queries, mutations, API modules, mappers, loading, empty, error states. |
| `07-interactions` | Code-producing | Implement filters, URL sync, pagination, exports, toasts, confirmation/retry flows. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify route guards, role gates, authenticated export. |
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
- Feature slug: `admin_reports_locations`
- Screen name: `Bao cao Dia diem`
- Main route: `/admin/reports/locations`
- Actual page path: `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\index.tsx`
- Actual component folder: `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\components`
- Feature type: authenticated admin report screen for location distribution, category/district breakdown, engagement/ranking tables, filters, pagination, mock fallback, and export.
- Do not switch to `admin_reports_users`, users CRUD, contacts, notifications, CMS, settings, or web features.

WHY THIS IS NEXT
- Progress report marks `admin_reports_locations` as the next admin report after ratings, bookings, and revenue.
- Repo reality already contains implementation under `src/pages/Reports/LocationReport`.
- Feature-specific deploy/review artifacts are still missing, so close this feature before opening a new one.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_reports_locations` artifacts
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_reports_locations.md`
- Related docs: `D:\DATN\DATN_Document\docs\page\admin_dashboard.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_revenue.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_bookings.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_ratings.md`; `D:\DATN\DATN_Document\docs\page\admin_locations_list.md`; `D:\DATN\DATN_Document\docs\page\admin_locations_detail.md`; `D:\DATN\DATN_Document\docs\page\admin_location_categories.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend schema note: `D:\DATN\danangtrip-api\SCHEMA_CURRENT_ANNOTATED.md`

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
- `D:\DATN\danangtrip-admin\src\api\locationApi.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useReportQueries.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useLocationQueries.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\report.dataHelper.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\report.mapper.ts`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\components\LocationReportFilterBar.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\components\LocationStatsCards.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\components\LocationReportCharts.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Reports\LocationReport\components\LocationReportTables.tsx`
- `D:\DATN\danangtrip-admin\public\lang\vi\location_report.json`
- `D:\DATN\danangtrip-admin\public\lang\en\location_report.json`
- `D:\DATN\danangtrip-admin\tests\admin-reports-locations.spec.ts`

CODEGRAPH FINDINGS TO HONOR
- Actual page is `LocationReport`, not `LocationsReport`.
- `LocationReport` imports `useLocationsReportQuery`, `useReportMutations`, four local components, `sonner`, and `react-i18next`.
- `useReportQueries.ts` owns `reportKeys`, locations query, and report export mutations.
- `mapLocationsReport` is the mapper boundary.
- `LocationReportFilters`, `RawLocationReportItem`, `LocationReportItemViewModel`, and `LocationReportViewModel` are the feature data contracts.
- Include `tests/admin-reports-locations.spec.ts` in validation/finalization when environment allows.

REALITY CHECKS BEFORE EDITING
- Confirm `LocationReport` compiles.
- Confirm `/admin/reports/locations` route constant and lazy import exist.
- Confirm route is inside `PrivateRoute` and `MainLayout`.
- Confirm report API, query hooks, mapper/view-models, i18n, and tests align.
- Do not create duplicate `LocationsReport`.

REQUIRED API FLOW
- Primary report endpoint: `GET /admin/reports/locations`.
- Export endpoint: `GET /admin/locations/export`.
- If backend supports only `from` and `to`, keep category/district/status filters client-side and document mismatch.
- Keep explicit loading, fetching, empty, API-error, mock-mode, retry, export-loading, export-error, and success states.

EXPECTED UX
- KPI cards for total locations, active locations, featured locations, and total views/engagement.
- Category and district charts.
- Ranking tables switchable by views, favorites, and ratings.
- Filters for date range, category, district, status where supported.
- Pagination and URL query sync.
- Export using current filters when backend supports it.
- Vietnamese and English i18n must not expose raw keys.

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

CURRENT RESUME RULE
- First verify existing memory, artifacts, route, code, i18n, tests, and validation evidence.
- If steps 01-09 are valid, execute `10-optimization-deploy` and create the feature-specific deploy/review artifacts for `admin_reports_locations`.
- Do not mark complete using `repo-screen-alignment-audit` artifacts; Step 10 must write `2026-05-22__admin_reports_locations__deploy-report.md` and `2026-05-22__admin_reports_locations__review.md`.
- If a previous step is wrong, repair that step only, update artifact/memory, then continue forward.

ARTIFACT TARGETS
- Analysis: `.agent/artifacts/analysis/2026-05-22__admin_reports_locations__screen-analysis.md`
- Project audit: `.agent/artifacts/audits/2026-05-22__admin_reports_locations__project-audit.md`
- API contract: `.agent/artifacts/api-contracts/2026-05-22__admin_reports_locations__api-contract.md`
- Routing: `.agent/artifacts/routing/2026-05-22__admin_reports_locations__route-plan.md`
- UI spec: `.agent/artifacts/ui-specs/2026-05-22__admin_reports_locations__ui-spec.md`
- Data integration: `.agent/artifacts/integration/2026-05-22__admin_reports_locations__data-integration.md`
- Interaction spec: `.agent/artifacts/interaction-specs/2026-05-22__admin_reports_locations__interaction-spec.md`
- Auth review: `.agent/artifacts/auth/2026-05-22__admin_reports_locations__auth-permissions-review.md`
- Test report: `.agent/artifacts/test-cases/2026-05-22__admin_reports_locations__test-report.md`
- Deploy report: `.agent/artifacts/deploy/2026-05-22__admin_reports_locations__deploy-report.md`
- Final review: `.agent/artifacts/review/2026-05-22__admin_reports_locations__review.md`

VALIDATION COMMANDS
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run prepush:check` if available and feasible

COMPLETION RULE
- Do not mark complete until deploy and review artifacts exist with validation evidence.

BEGIN NOW
Start by verifying `admin_reports_locations` repo reality. Current expected resume point is Step 10 unless new validation finds a regression.
```

## Step Prompts - admin_reports_locations

### Step 01

```text
Activate `01-screen-analysis` for `admin_reports_locations`.
Repo: `D:\DATN\danangtrip-admin`
Read canonical order plus `.agent/skills/01-screen-analysis/SKILL.md`.
Inputs: progress report, `admin_reports_locations.md`, related dashboard/report/location docs, API list, endpoint matrix, backend routes, codegraph findings.
Work: analyze KPIs, charts, filters, ranking tables, export, loading/empty/error/mock states; compare docs with repo reality. Do not edit product code.
Output: `.agent/artifacts/analysis/2026-05-22__admin_reports_locations__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_reports_locations`.
Repo: `D:\DATN\danangtrip-admin`
Inspect: `package.json`, `vite.config.ts`, `tsconfig.app.json`, route files, axios/provider setup, i18n setup, `LocationReport`.
Work: verify stack/scripts/route/i18n/test readiness; fix only setup blockers.
Output: `.agent/artifacts/audits/2026-05-22__admin_reports_locations__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_reports_locations`.
Inspect: `src/constants/endpoints.ts`, `src/api/reportApi.ts`, `src/hooks/useReportQueries.ts`, `src/dataHelper/report.dataHelper.ts`, `src/dataHelper/report.mapper.ts`.
Work: verify endpoints, params, `LocationReportFilters`, `RawLocationReportItem`, `LocationReportItemViewModel`, `LocationReportViewModel`, `mapLocationsReport`, query/export contracts; document backend filter mismatch.
Output: `.agent/artifacts/api-contracts/2026-05-22__admin_reports_locations__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_reports_locations`.
Target route: `/admin/reports/locations`
Target page: `src/pages/Reports/LocationReport/index.tsx`
Inspect: `src/routes/routes.ts`, `src/routes/index.tsx`, sidebar/menu files, i18n registration.
Work: verify route constant, lazy import, PrivateRoute/MainLayout placement, navigation, i18n registration. Do not create `LocationsReport`.
Output: `.agent/artifacts/routing/2026-05-22__admin_reports_locations__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_reports_locations`.
Files: `LocationReport/index.tsx` and components under `LocationReport/components`.
References: `DESIGN.md`, Revenue/Bookings/Ratings reports.
Work: implement/polish header, breadcrumb, filters, KPI cards, charts, ranking tables, export button, skeletons, error/mock states, responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-22__admin_reports_locations__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_reports_locations`.
Inspect: `reportApi.ts`, `locationApi.ts`, `useReportQueries.ts`, `report.mapper.ts`, `report.dataHelper.ts`, `LocationReport/index.tsx`.
Work: verify/wire `useLocationsReportQuery`, `useReportMutations`, `reportApi`, `locationApi`, `mapLocationsReport`, query keys, loading/error/mock/retry states, spreadsheet export helpers.
Output: `.agent/artifacts/integration/2026-05-22__admin_reports_locations__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_reports_locations`.
Files: `LocationReport/index.tsx`, `LocationReportFilterBar.tsx`, `LocationReportTables.tsx`, `public/lang/*/location_report.json`.
Work: implement/fix date validation, filters, apply/reset, URL sync, tabs, pagination, export, mock toggle, retry, toasts, disabled states.
Output: `.agent/artifacts/interaction-specs/2026-05-22__admin_reports_locations__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_reports_locations`.
Inspect: `src/routes/index.tsx`, `PrivateRoute`, layout/auth store, report/export API usage.
Work: verify protected route and authenticated export; document role reality; fix only real permission gaps.
Output: `.agent/artifacts/auth/2026-05-22__admin_reports_locations__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_reports_locations`.
Inputs: artifacts 01-08 and `tests/admin-reports-locations.spec.ts`.
Run as feasible: `npm run lint`, `npm run typecheck`, `npm run build`, focused Playwright test, `npm run prepush:check`.
Work: fix feature-caused failures, update focused tests if behavior changed, document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-22__admin_reports_locations__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_reports_locations`.
Inputs: test report and artifacts 01-09.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and final review, update `WORKING_STATE.md`, `SESSION_LOG.md`, and `HANDOFF.md`.
Completion rule: do not mark complete until deploy and review artifacts exist with validation evidence.
Outputs: `.agent/artifacts/deploy/2026-05-22__admin_reports_locations__deploy-report.md`; `.agent/artifacts/review/2026-05-22__admin_reports_locations__review.md`
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
- `src/api/locationApi.ts`
- `src/hooks/useReportQueries.ts`
- `src/hooks/useLocationQueries.ts`
- `src/dataHelper/report.dataHelper.ts`
- `src/dataHelper/report.mapper.ts`
- `src/pages/Reports/LocationReport/index.tsx`
- `tests/admin-reports-locations.spec.ts`
