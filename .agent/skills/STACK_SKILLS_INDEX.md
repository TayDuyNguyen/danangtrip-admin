# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_users_list`.

## Current Decision Snapshot

Date locked: `2026-05-23`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Danh sach nguoi dung`
- Feature slug: `admin_users_list`
- Main route: `/admin/users`
- Target page path: `src/pages/Users/UserList/index.tsx`
- Target component folder: `src/pages/Users/UserList/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_users_list.md`
- Primary API: `GET /admin/users`
- Supporting APIs: `GET /admin/users/export`, `PATCH /admin/users/{id}/status`, `PATCH /admin/users/{id}/role`, `DELETE /admin/users/{id}`
- Status: selected next screen after `admin_reports_users` Step 10 completion.
- Implementation reality: backend user management APIs exist; admin frontend has sidebar path `/admin/users` but no route constant, lazy route, page, user API module, hook, mapper, i18n namespace, or user-list tests.
- Cross-project order: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- `admin_reports_users` is completed and validated.
- Sidebar already exposes a Users menu item pointing to `/admin/users`, but the router has no matching route.
- Codegraph/repo search confirms no `src/pages/Users*`, no `UserList`, and no `UsersList`.
- Backend routes exist for list/detail/create/update/delete/status/role/export; this screen should start the users CRUD cluster with list management.

## Codegraph Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature.

- Codegraph contains no file under `src/pages/Users`.
- Codegraph contains no `UserList` or `UsersList` symbol.
- Codegraph contains completed `Reports/UsersReport` files; do not confuse the report screen with users CRUD.
- Codegraph/repo shows `src/components/common/Sidebar.tsx` has `{ icon: Users, label: 'sidebar.users', path: '/admin/users' }`.
- `src/routes/routes.ts` has no `USERS_LIST` route constant yet.
- `src/routes/index.tsx` has no lazy import/route for `/admin/users` yet.
- Existing list patterns to reuse: `Tours/TourList`, `Bookings/BookingList`, `Payments/PaymentList`, and location list patterns.
- Backend supports `GET /admin/users` filters: `q`, `role`, `status`, `page`, `per_page`, `sort_by`, `sort_order`.
- Backend list request currently allows `role` values `admin` and `user`; docs mention `staff`, so Step 03 must verify before exposing `staff`.

## Goals

- Deliver the missing `/admin/users` management list screen through the 10-step feature pipeline.
- Reuse existing admin list architecture, layout, table, filters, pagination, modal, toast, and i18n patterns.
- Implement only what backend supports; document mismatches instead of fabricating unsupported fields or actions.
- Add route constant and route registration so existing sidebar link resolves.
- Support list loading, search/filter, pagination, sorting if supported, export, inline role/status actions if contract-safe, delete confirmation if contract-safe.
- Produce artifacts for every step and update memory after each step.
- Do not switch to admin user detail/create/edit, reports users, contacts, notifications, CMS, promotions, settings, or web screens.
- Do not use legacy `DATN_T...` document paths; current docs root is `D:\DATN\DATN_Document`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant `admin_users_list` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add users endpoint constants, API methods, filters, response types, mappers, hooks, and mutations as needed. |
| `04-layout-routing` | Routing/code scaffold | Add `USERS_LIST` route constant, lazy route, page shell, sidebar route alignment, and i18n namespace registration. |
| `05-ui-components` | Code-producing | Implement page header, stats if data exists, filter bar, table, pagination, bulk/action UI, modals, skeletons, empty/error states. |
| `06-data-integration` | Code-producing | Wire list query, filters, pagination, export, role/status/delete mutations, invalidation, loading/error/empty/retry states. |
| `07-interactions` | Code-producing | Implement URL sync, debounce search, filter reset/apply, sorting, row actions, confirmations, toasts, disabled states, and accessibility. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin/staff access reality, self-role/status/delete guard behavior, authenticated API calls, unauthorized/forbidden states. |
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
| Tables/charts | Existing hand-built admin components plus recharts where needed |
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
- Feature slug: `admin_users_list`
- Screen name: `Danh sach nguoi dung`
- Main route: `/admin/users`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Users\UserList\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Users\UserList\components`
- Feature type: authenticated admin users-management list screen.
- Do not switch to admin user detail/create/edit, reports users, contacts, notifications, CMS, promotions, settings, or web features.

WHY THIS IS NEXT
- `admin_reports_users` completed Step 10.
- `/admin/users` has a sidebar entry but no registered route/page.
- Backend user management APIs exist.
- Codegraph confirms there is no `src/pages/Users`, `UserList`, or `UsersList` implementation.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_users_list` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_users_list.md`
- Related docs: `D:\DATN\DATN_Document\docs\page\admin_users_detail.md`; `D:\DATN\DATN_Document\docs\page\admin_users_create.md`; `D:\DATN\DATN_Document\docs\page\admin_users_edit.md`; `D:\DATN\DATN_Document\docs\page\admin_reports_users.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\UserController.php`
- Backend requests: `D:\DATN\danangtrip-api\app\Http\Requests\User\IndexUserRequest.php`; `ExportUserRequest.php`; `UpdateStatusUserRequest.php`; `UpdateRoleUserRequest.php`; `DeleteUserRequest.php`
- Backend service: `D:\DATN\danangtrip-api\app\Services\UserService.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\vite.config.ts`
- `D:\DATN\danangtrip-admin\tsconfig.app.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- Existing list references: `src/pages/Tours/TourList`, `src/pages/Bookings/BookingList`, `src/pages/Payments/PaymentList`, `src/pages/Locations/LocationList`
- `D:\DATN\danangtrip-admin\src\components\common\Sidebar.tsx`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `GET /admin/users` supports query: `q`, `role`, `status`, `page`, `per_page`, `sort_by`, `sort_order`.
- Valid `role` from backend request is currently `admin` or `user`; do not expose `staff` unless backend has been updated.
- Valid `status` is `active` or `banned`.
- Valid `sort_by` is `id`, `full_name`, `email`, `created_at`.
- Valid `sort_order` is `asc` or `desc`.
- `GET /admin/users/export` supports `role` and `status`.
- `PATCH /admin/users/{id}/status` and `PATCH /admin/users/{id}/role` include backend self-protection; UI should handle forbidden responses.
- `DELETE /admin/users/{id}` exists; use confirmation and handle forbidden/not-found responses.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_users_list`.
- Prefer existing admin list and table patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_users_list`.
Read mandatory context, codegraph findings, `admin_users_list.md`, backend user routes/controller/requests/service, and existing admin list pages.
Work: document screen purpose, route, API contracts, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-23__admin_users_list__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_users_list`.
Inspect package scripts, route conventions, i18n loader, existing list test patterns, artifact/memory paths, and console test setup.
Work: verify setup readiness and note required config or script changes only if blocking.
Output: `.agent/artifacts/audits/2026-05-23__admin_users_list__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_users_list`.
Inspect: `src/constants/endpoints.ts`, existing API modules, hooks, dataHelper patterns, backend `IndexUserRequest`, `ExportUserRequest`, status/role/delete requests.
Work: add/align endpoint constants, API methods, filters, raw/VM types, mapper, query keys, list query hook, export/status/role/delete mutations. Do not expose unsupported `staff` role unless backend supports it.
Output: `.agent/artifacts/api-contracts/2026-05-23__admin_users_list__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_users_list`.
Target route: `/admin/users`
Target page: `src/pages/Users/UserList/index.tsx`
Inspect: `src/routes/routes.ts`, `src/routes/index.tsx`, `Sidebar.tsx`, i18n loader/files.
Work: add route constant, lazy import, route registration, page shell, sidebar path alignment to route constant, and users-list i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-23__admin_users_list__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_users_list`.
Files: `src/pages/Users/UserList/index.tsx` and components under `Users/UserList/components`.
References: `DESIGN.md`, `TourList`, `BookingList`, `PaymentList`, `LocationList`, `admin_users_list.md`.
Work: implement header, export/create buttons, filter bar, table toolbar, user table, pagination, row action UI, role/status badges, confirmation dialogs, skeletons, empty/error states, responsive layout, and i18n strings.
Output: `.agent/artifacts/ui-specs/2026-05-23__admin_users_list__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_users_list`.
Inspect: new user API/hook/mapper files, `UserList/index.tsx`, axios client, existing mutation invalidation patterns.
Work: wire list query, search/filter/pagination/sort params, export request, role/status/delete mutations, cache invalidation, optimistic or refetch strategy, loading/error/empty/retry states.
Output: `.agent/artifacts/integration/2026-05-23__admin_users_list__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_users_list`.
Work: implement/fix debounce search, URL query sync, filter reset/apply, pagination, sorting, row action navigation to future detail/edit routes as placeholders only if route constants exist, role/status confirmations, delete confirmation, toasts, disabled states, keyboard/accessibility behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-23__admin_users_list__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_users_list`.
Inspect: `src/routes/index.tsx`, `PrivateRoute`, auth store, axios interceptors, backend self-protection behavior.
Work: verify protected route, admin/staff access reality if implemented, authenticated user APIs, forbidden/unauthorized handling, self role/status/delete guard messaging, and token refresh behavior. Fix only real permission gaps.
Output: `.agent/artifacts/auth/2026-05-23__admin_users_list__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_users_list`.
Run as feasible: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, focused tests if available, `npm.cmd run prepush:check`.
Work: add/update focused console route test for `/admin/users` if repo pattern supports it, fix feature-caused failures, and document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-23__admin_users_list__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_users_list`.
Inputs: artifacts 01-09, validation output, final git diff.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and final review, update `WORKING_STATE.md`, `SESSION_LOG.md`, and `HANDOFF.md`.
Completion rule: do not mark complete until deploy and review artifacts exist with validation evidence.
Outputs: `.agent/artifacts/deploy/2026-05-23__admin_users_list__deploy-report.md`; `.agent/artifacts/review/2026-05-23__admin_users_list__review.md`
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
- `src/components/common/Sidebar.tsx`
- `src/pages/Tours/TourList`
- `src/pages/Bookings/BookingList`
- `src/pages/Payments/PaymentList`
- `src/pages/Locations/LocationList`
- `public/lang/vi`
- `public/lang/en`
