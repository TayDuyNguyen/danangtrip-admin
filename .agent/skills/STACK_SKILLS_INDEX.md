# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_users_detail`.

## Current Decision Snapshot

Date locked: `2026-05-23`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Chi tiết người dùng`
- Feature slug: `admin_users_detail`
- Main route: `/admin/users/:id`
- Target page path: `src/pages/Users/UserDetail/index.tsx`
- Target component folder: `src/pages/Users/UserDetail/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_users_detail.md`
- Primary API: `GET /admin/users/{id}`
- Supporting APIs: `GET /admin/users/{id}/bookings`, `GET /admin/users/{id}/ratings`, `PATCH /admin/users/{id}/status`, `PATCH /admin/users/{id}/role`, `DELETE /admin/users/{id}`
- Status: selected next screen after `admin_users_list` Step 10 completion.
- Implementation reality: `admin_users_list` is implemented and validated. `admin_users_detail` has backend APIs but no admin route/page/component yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- `admin_users_list` is complete and registered at `/admin/users`.
- User detail is the natural next screen in the users management cluster.
- Backend has detail, bookings, ratings, role/status and delete APIs.
- Repo has no `src/pages/Users/UserDetail`.
- `src/routes/routes.ts` has `USERS_LIST` but no `USERS_DETAIL` yet.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph/repo contains `src/pages/Users/UserList` and user API/hook/mapper files; do not rebuild the list screen.
- Codegraph/repo has no `UserDetail` page.
- Existing detail patterns to reuse: `Bookings/BookingDetail`, `Payments/PaymentDetail`, `Locations/LocationDetail`.
- Existing users list components include role/status badges and role/status/delete dialogs; reuse or extract only if safe.
- Backend supports `GET /admin/users/{id}`, `/bookings`, `/ratings`, `PATCH /status`, `PATCH /role`, `DELETE`.
- Backend role reality is currently `admin` and `user`; do not expose `staff` unless backend request allows it.

## Goals

- Deliver the missing `/admin/users/:id` detail screen through the 10-step pipeline.
- Show personal info, account status, stats, recent bookings, recent ratings, and action panel.
- Wire safe actions: edit navigation placeholder, lock/unlock, role change if contract-safe, delete with confirmation.
- Add route constant and lazy route registration.
- Reuse existing admin detail/list UI patterns and i18n conventions.
- Do not implement create/edit screens, contacts, notifications, CMS, promotions, settings, web screens, or rebuild user list.
- Produce artifacts for every step and update memory after each step.
- Use current docs root `D:\DATN\DATN_Document`; do not use legacy document paths.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant `admin_users_detail` artifacts if any
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Real repo sources and docs listed in this prompt

If sources conflict, follow repo reality and record stale facts in the artifact.

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
| `03-types-api-contract` | Contract/code foundation | Add/align detail/bookings/ratings endpoints, raw/view types, mapper, hooks and mutations. |
| `04-layout-routing` | Routing/code scaffold | Add `USERS_DETAIL` route constant, lazy route, page shell, list row navigation alignment and i18n namespace. |
| `05-ui-components` | Code-producing | Implement header, personal info card, bookings table, ratings list, stats/account/action cards, dialogs, skeletons, empty/error states. |
| `06-data-integration` | Code-producing | Wire detail query, bookings query, ratings query, status/role/delete mutations, invalidation and loading/error states. |
| `07-interactions` | Code-producing | Implement back/list navigation, edit placeholder navigation, lock/unlock, role dialog, delete dialog, toasts and disabled states. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin/staff access reality, self-protection behavior, unauthorized/forbidden handling. |
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
- Feature slug: `admin_users_detail`
- Screen name: `Chi tiết người dùng`
- Main route: `/admin/users/:id`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Users\UserDetail\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Users\UserDetail\components`
- Feature type: authenticated admin user-management detail screen.
- Do not switch to users create/edit, contacts, notifications, CMS, promotions, settings, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_users_list` completed Step 10 and exists in repo.
- User detail is not implemented yet.
- Backend APIs exist for user detail, bookings, ratings, role/status and delete actions.
- Screen doc exists: `D:\DATN\DATN_Document\docs\page\admin_users_detail.md`.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_users_detail` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_users_detail.md`
- Related docs: `admin_users_list.md`, `admin_users_edit.md`, `admin_users_create.md`, `admin_bookings_detail.md`, `admin_ratings_list.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\UserController.php`
- Backend requests: `ShowUserRequest.php`, `UserBookingsRequest.php`, `UserRatingsRequest.php`, `UpdateStatusUserRequest.php`, `UpdateRoleUserRequest.php`, `DeleteUserRequest.php`
- Backend service: `D:\DATN\danangtrip-api\app\Services\UserService.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- `D:\DATN\danangtrip-admin\src\api\userApi.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useUserQueries.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\user.dataHelper.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\user.mapper.ts`
- `D:\DATN\danangtrip-admin\src\pages\Users\UserList`
- Existing detail references: `src/pages/Bookings/BookingDetail`, `src/pages/Payments/PaymentDetail`, `src/pages/Locations/LocationDetail`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `GET /admin/users/{id}` loads personal/account/stat detail.
- `GET /admin/users/{id}/bookings?page=1&per_page=5` loads recent bookings.
- `GET /admin/users/{id}/ratings?page=1&per_page=3` loads recent ratings.
- `PATCH /admin/users/{id}/status` accepts backend-supported status values.
- `PATCH /admin/users/{id}/role` accepts backend-supported role values. Do not expose `staff` unless backend supports it.
- `DELETE /admin/users/{id}` must use confirmation and handle forbidden/not-found.
- Preserve backend self-protection behavior and surface clear UI messages.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_users_detail` except shared user API/types/hooks needed by detail.
- Prefer existing detail/list patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_users_detail`.
Read mandatory context, codegraph, `admin_users_detail.md`, backend user controller/requests/service, and existing detail pages.
Work: document screen purpose, route, API contracts, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-23__admin_users_detail__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_users_detail`.
Inspect route conventions, i18n loader, existing detail page test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-23__admin_users_detail__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_users_detail`.
Inspect endpoints, `userApi`, `useUserQueries`, `user.dataHelper`, `user.mapper`, backend requests/service.
Work: add/align detail, bookings, ratings response types, API methods, query keys, hooks, mutations and mappers. Keep role/status values backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-23__admin_users_detail__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_users_detail`.
Target route: `/admin/users/:id`.
Work: add `USERS_DETAIL` route constant, lazy route, page shell, navigation from list row/view action if safe, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-23__admin_users_detail__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_users_detail`.
Work: implement header, badges, personal info card, bookings table preview, ratings list preview, stats sidebar, account card, action card, dialogs, skeletons, empty/error states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-23__admin_users_detail__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_users_detail`.
Work: wire detail/bookings/ratings queries, status/role/delete mutations, cache invalidation, loading/error/empty/retry states, and navigation after delete.
Output: `.agent/artifacts/integration/2026-05-23__admin_users_detail__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_users_detail`.
Work: implement back-to-list, edit navigation placeholder, bookings/ratings links, lock/unlock confirmation, role dialog, delete confirmation, toasts, disabled states, keyboard/accessibility behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-23__admin_users_detail__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_users_detail`.
Work: verify protected route, admin/staff access reality, self-role/status/delete protection, authenticated API calls, forbidden/unauthorized/not-found behavior and token refresh handling.
Output: `.agent/artifacts/auth/2026-05-23__admin_users_detail__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_users_detail`.
Run as feasible: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, focused route/console tests if available, and `npm.cmd run prepush:check`.
Work: fix feature-caused failures and document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-23__admin_users_detail__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_users_detail`.
Inputs: artifacts 01-09, validation output, final git diff.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and review, update memory files.
Outputs: `.agent/artifacts/deploy/2026-05-23__admin_users_detail__deploy-report.md`; `.agent/artifacts/review/2026-05-23__admin_users_detail__review.md`
```
