# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_users_create`.

## Current Decision Snapshot

Date locked: `2026-05-23`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Tao nguoi dung moi`
- Feature slug: `admin_users_create`
- Main route: `/admin/users/create`
- Target page path: `src/pages/Users/UserCreate/index.tsx`
- Target component folder: `src/pages/Users/UserCreate/components`
- Shared form folder if useful: `src/pages/Users/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_users_create.md`
- Primary API: `POST /admin/users`
- Status: selected next screen after `admin_users_detail` code implementation and verification.
- Implementation reality: `admin_users_list` and `admin_users_detail` now have route/page/component code. `admin_users_create` has a list-page navigation target (`/admin/users/create`) and backend API, but no route/page/component yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- Codegraph/repo contains `src/pages/Users/UserList` and `src/pages/Users/UserDetail`; do not rebuild list/detail.
- Codegraph/repo has no `src/pages/Users/UserCreate`.
- `src/pages/Users/UserList/index.tsx` already navigates to `/admin/users/create`, so the missing create route is a visible broken workflow.
- Backend has `POST /admin/users` mapped to `Admin\UserController@store`.
- `admin_users_create.md` defines the required form, validation, sidebar settings, success redirect and API payload.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph confirms `Users/UserDetail` files exist; treat `admin_users_detail` as completed/hardening-only unless explicitly asked to backfill a Step 10 deploy artifact.
- Codegraph has no file path matching `Users/UserCreate` or `USERS_CREATE`.
- `src/routes/routes.ts` has `USERS_LIST` and `USERS_DETAIL`, but no `USERS_CREATE`.
- `src/routes/index.tsx` lazy-loads user list/detail, but not create.
- Existing reusable form patterns: `Locations/LocationCreate`, `Tours/TourCreate`, `Tours/TourScheduleCreate`, and user list dialogs.
- Existing user data/API layer lives in `src/api/userApi.ts`, `src/hooks/useUserQueries.ts`, `src/dataHelper/user.dataHelper.ts`, and `src/dataHelper/user.mapper.ts`.
- Backend roles/status must be verified from requests/service before exposing options. Docs mention `staff`; previous backend reality may only allow `admin` and `user`.

## Goals

- Deliver the missing `/admin/users/create` screen through the 10-step pipeline.
- Add route constant, lazy route registration, page shell, form UI, validation, mutation and success redirect.
- Create a user with username, email, password, password confirmation, full name, optional profile fields, role and status if backend supports them.
- Redirect to `/admin/users/{id}` on successful create when the response returns an id; otherwise fall back to `/admin/users`.
- Reuse existing admin form/page patterns and i18n conventions.
- Do not implement edit screen, contacts, notifications, CMS, promotions, settings, web screens, or rebuild user list/detail.
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
7. Latest relevant `admin_users_create` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align create-user request/response types, endpoint, API method, mutation hook and mapper if needed. |
| `04-layout-routing` | Routing/code scaffold | Add `USERS_CREATE` route constant, lazy route, page shell, list button alignment and i18n namespace/files. |
| `05-ui-components` | Code-producing | Implement header, account form, password fields, role/status sidebar, helper card, validation errors, skeleton/submit states. |
| `06-data-integration` | Code-producing | Wire create mutation, backend validation errors, success redirect, cache invalidation and toast states. |
| `07-interactions` | Code-producing | Implement cancel/back, submit, show/hide password, role/status selection, dirty form behavior if pattern exists, disabled/loading behavior. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin/staff access reality, role creation limits, authenticated API calls, forbidden/validation handling. |
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
- Feature slug: `admin_users_create`
- Screen name: `Tao nguoi dung moi`
- Main route: `/admin/users/create`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Users\UserCreate\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Users\UserCreate\components`
- Feature type: authenticated admin user-management create form.
- Do not switch to users edit, contacts, notifications, CMS, promotions, settings, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_users_list` and `admin_users_detail` now have route/page/component code.
- `/admin/users/create` is already linked from the users list but has no registered route/page.
- Backend has `POST /admin/users`.
- Screen doc exists: `D:\DATN\DATN_Document\docs\page\admin_users_create.md`.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_users_create` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_users_create.md`
- Related docs: `admin_users_list.md`, `admin_users_detail.md`, `admin_users_edit.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\UserController.php`
- Backend request: `D:\DATN\danangtrip-api\app\Http\Requests\Admin\User\StoreUserRequest.php`
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
- `D:\DATN\danangtrip-admin\src\pages\Users\UserDetail`
- Existing form references: `src/pages/Locations/LocationCreate`, `src/pages/Tours/TourCreate`, `src/pages/Tours/TourScheduleCreate`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `POST /admin/users` creates a user.
- Minimum body from API docs: `username`, `email`, `password`, `full_name`, optional `role`, optional `status`.
- Verify whether backend requires `password_confirmation` and supports optional `phone`, `birthdate`, `gender`, `city`.
- Role options must match backend request/service. Do not expose `staff` unless backend supports it.
- Status options must match backend request/service; default to active only if backend accepts it.
- On success, redirect to `/admin/users/{id}` if id is returned; otherwise redirect to `/admin/users`.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_users_create` except shared user API/types/hooks needed by create.
- Prefer existing form/list/detail patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_users_create`.
Read mandatory context, codegraph, `admin_users_create.md`, backend user controller/request/service, and existing form pages.
Work: document screen purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-23__admin_users_create__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_users_create`.
Inspect route conventions, i18n loader, existing form test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-23__admin_users_create__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_users_create`.
Inspect endpoints, `userApi`, `useUserQueries`, `user.dataHelper`, `user.mapper`, backend `StoreUserRequest` and `UserService`.
Work: add/align create request/response types, API method, mutation hook, validation shape and mapper. Keep role/status values backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-23__admin_users_create__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_users_create`.
Target route: `/admin/users/create`.
Work: add `USERS_CREATE` route constant, lazy route, page shell, list create-button alignment and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-23__admin_users_create__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_users_create`.
Work: implement header, account info form, password fields, optional profile fields, role/status sidebar, helper card, validation messages, loading/submitting states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-23__admin_users_create__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_users_create`.
Work: wire create-user mutation, backend validation errors, toast feedback, users-list invalidation, and success redirect to detail/list.
Output: `.agent/artifacts/integration/2026-05-23__admin_users_create__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_users_create`.
Work: implement cancel/back navigation, submit behavior, show/hide passwords, role/status controls, validation focus, disabled/loading behavior, and dirty form prompt only if project already has a pattern.
Output: `.agent/artifacts/interaction-specs/2026-05-23__admin_users_create__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_users_create`.
Work: verify protected route, admin/staff access reality, role creation limits, authenticated API calls, forbidden/unauthorized/validation behavior and token refresh handling.
Output: `.agent/artifacts/auth/2026-05-23__admin_users_create__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_users_create`.
Run as feasible: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, focused route/console tests if available, and `npm.cmd run prepush:check`.
Work: fix feature-caused failures and document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-23__admin_users_create__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_users_create`.
Inputs: artifacts 01-09, validation output, final git diff.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and review, update memory files.
Outputs: `.agent/artifacts/deploy/2026-05-23__admin_users_create__deploy-report.md`; `.agent/artifacts/review/2026-05-23__admin_users_create__review.md`
```
