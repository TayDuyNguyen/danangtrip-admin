# Feature Review: admin_reports_users

## Step 10 verification override - 2026-05-23

- Reviewed route registration, page shell, filters, KPI cards, charts, table, report API, query hook, mapper, i18n, and console test coverage.
- Fixed one data-flow issue: mock mode now disables the real users report query instead of continuing to call the API in the background.
- Refactored `UsersReportFilterBar` to replace raw HTML `<select>` elements with the project-standard `CustomSelect` component, ensuring full UI consistency with other lists (Bookings, Locations, Tours, etc.) and adding premium focus rings, smooth transitions, and standard disabled states.
- Re-ran `npm.cmd run prepush:check`; final result PASS.
- Gate result: lint PASS, typecheck PASS, build PASS, console tests PASS.
- Console test result: 5/5 routes passed, including `/admin/reports/users`.
- Remaining non-blocking warnings: `lottie-web` eval and large chunks from existing vendor bundles.
- Suggested branch: `feat/DATN-84/admin-reports-users`
- Suggested commit: `feat(reports): add users report screen`
- Recommendation: Ready for push after user approval.

Date: 2026-05-23
Repository: `D:\DATN\danangtrip-admin`
Recommendation: Ready for push after approval.

## Objective

Deliver the admin Users Report screen so administrators can inspect new users registration growth, KPI totals, user cumulative area charts, detailed monthly tables, filters, mock fallback, and export behavior from `/admin/reports/users`.

## What Changed

- Added and verified the real page implementation at `src/pages/Reports/UsersReport/index.tsx`.
- Added sub-components for filter bar, KPI cards, charts, and data tables.
- Wired `useUsersReportQuery`, `useReportMutations`, `reportApi`, and `mapUsersReport`.
- Added URL-synced filters (Year, Role, Status), mock mode, retry/error handling, and Excel/CSV export flow.
- Added/verified bilingual `users_report` i18n locales for Vietnamese and English.
- Registered endpoints, lazy page loading, router integration, and Sidebar layout updates.

## Artifact Trace

| Step | Artifact | Status |
|---|---|---|
| 01 | `analysis/2026-05-23__admin_reports_users__screen-analysis.md` | Complete |
| 02 | `audits/2026-05-23__admin_reports_users__project-audit.md` | Complete |
| 03 | `api-contracts/2026-05-23__admin_reports_users__api-contract.md` | Complete |
| 04 | `routing/2026-05-23__admin_reports_users__route-plan.md` | Complete |
| 05 | `ui-specs/2026-05-23__admin_reports_users__ui-spec.md` | Complete |
| 06 | `integration/2026-05-23__admin_reports_users__data-integration.md` | Complete |
| 07 | `interaction-specs/2026-05-23__admin_reports_users__interaction-spec.md` | Complete |
| 08 | `auth/2026-05-23__admin_reports_users__auth-permissions-review.md` | Complete |
| 09 | `test-cases/2026-05-23__admin_reports_users__test-report.md` | Complete, READY |
| 10 | `deploy/2026-05-23__admin_reports_users__deploy-report.md` | Complete |

## Technical Decisions

- **Parameter Isolation**: Report API filters by `year` only. Excel export API filters by `role`, `status`, and `search`. The filter parameters are isolated correctly to meet backend expectations and avoid Laravel validation payload rejection.
- **Continuous Calendar Mapper**: Backfilling mapper `mapUsersReport` checks month counts and automatically overlays months that MySQL grouping skipped, displaying empty months cleanly as `0` counts and calculating correct cumulative rollups.
- **Sparkles Fallback & UX Recovery**: Real API issues immediately alert the user and seamlessly activate a highly premium mock data sandbox so that layouts and visual features are functional and interactive even when the API endpoints are offline.

## Validation Summary

| Check | Status |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run prepush:check` | PASS |

## Risks And Follow-Ups

- Recharts bundle size has been split cleanly.
- Live APIs will need integration verification as the backend Laravel endpoint undergoes local database migrations.

## Git Handoff

Suggested branch: `feat/DATN-84/admin-reports-users`

Suggested commit:

```text
feat(reports): add users report screen
```
