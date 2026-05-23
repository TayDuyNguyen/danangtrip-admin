# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_users_edit`.

## Current Decision Snapshot

Date locked: `2026-05-23`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Chinh sua nguoi dung`
- Feature slug: `admin_users_edit`
- Main route: `/admin/users/:id/edit`
- Target page path: `src/pages/Users/UserEdit/index.tsx`
- Target component folder: `src/pages/Users/UserEdit/components`
- Shared form folder if useful: `src/pages/Users/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_users_edit.md`
- Primary API: `PUT /admin/users/{id}`
- Supporting APIs: `GET /admin/users/{id}`, `PATCH /admin/users/{id}/status`, `DELETE /admin/users/{id}`
- Status: selected next screen after `admin_users_create` Step 10 completion.
- Implementation reality: `admin_users_list`, `admin_users_detail`, and `admin_users_create` now have route/page/component code. `admin_users_edit` has backend API and doc, but no route/page/component yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- Codegraph/repo contains `src/pages/Users/UserCreate` and `src/pages/Users/UserDetail`; do not rebuild them.
- Codegraph/repo has no `src/pages/Users/UserEdit`.
- Backend has `PUT /admin/users/{id}` mapped to `Admin\UserController@update`.
- `admin_users_edit.md` explicitly reuses the create form layout and is the natural completion of the users management cluster.
- Existing list/detail docs and UI already expose conceptual edit actions, so missing edit route is the next workflow gap.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph confirms `Users/UserCreate` files exist; treat `admin_users_create` as completed/hardening-only.
- Codegraph has no file path matching `Users/UserEdit` or `USERS_EDIT`.
- `src/routes/routes.ts` has `USERS_LIST`, `USERS_CREATE`, `USERS_DETAIL`, but no `USERS_EDIT`.
- `src/routes/index.tsx` lazy-loads list/create/detail, but not edit.
- Existing reusable form patterns: `Users/UserCreate`, `Locations/LocationEdit`, `Tours/TourEdit`, and `UserDetail` action cards/dialogs.
- Existing user data/API layer lives in `src/api/userApi.ts`, `src/hooks/useUserQueries.ts`, `src/dataHelper/user.dataHelper.ts`, and `src/dataHelper/user.mapper.ts`.
- Backend `UpdateUserRequest` allows optional `username`, `email`, `password`, `full_name`, `phone`, `birthdate`, `gender`, `city`, `role`; role is `admin|user`. It does not list `status` in `PUT`, so use status PATCH for status changes.

## Goals

- Deliver the missing `/admin/users/:id/edit` screen through the 10-step pipeline.
- Add route constant, lazy route registration, page shell, form UI, validation, detail query and update mutation.
- Reuse/create-align with `UserCreateForm` where practical while respecting edit differences: no password required, readonly username unless backend-safe, prefilled values, quick actions.
- Support role update through `PUT` only if contract-safe; status changes should use the existing status mutation.
- Redirect/cancel back to `/admin/users/:id` when possible, or `/admin/users` if detail id is invalid.
- Do not implement contacts, notifications, CMS, promotions, settings, web screens, or rebuild list/detail/create.
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
7. Latest relevant `admin_users_edit` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align update-user request/response types, API method, mutation hook, validation shape and mapper if needed. |
| `04-layout-routing` | Routing/code scaffold | Add `USERS_EDIT` route constant, lazy route, page shell, detail/list edit-button alignment and i18n namespace/files. |
| `05-ui-components` | Code-producing | Implement header, edit form, readonly username, account settings sidebar, quick actions, validation errors, skeleton/submit states. |
| `06-data-integration` | Code-producing | Wire detail query, update mutation, backend validation errors, toast feedback, user cache invalidation and status/delete quick actions if included. |
| `07-interactions` | Code-producing | Implement cancel/back, profile link, submit, dirty form behavior if pattern exists, status/delete dialogs, disabled/loading behavior. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin-only access, self role/status/delete protection, authenticated API calls, forbidden/validation handling. |
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
- Feature slug: `admin_users_edit`
- Screen name: `Chinh sua nguoi dung`
- Main route: `/admin/users/:id/edit`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Users\UserEdit\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Users\UserEdit\components`
- Feature type: authenticated admin user-management edit form.
- Do not switch to contacts, notifications, CMS, promotions, settings, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_users_create` completed Step 10 and exists in repo.
- `/admin/users/:id/edit` has no registered route/page/component code.
- Backend has `GET /admin/users/{id}` and `PUT /admin/users/{id}`.
- Screen doc exists: `D:\DATN\DATN_Document\docs\page\admin_users_edit.md`.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_users_edit` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_users_edit.md`
- Related docs: `admin_users_list.md`, `admin_users_detail.md`, `admin_users_create.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\UserController.php`
- Backend request: `D:\DATN\danangtrip-api\app\Http\Requests\User\UpdateUserRequest.php`
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
- `D:\DATN\danangtrip-admin\src\pages\Users\UserCreate`
- `D:\DATN\danangtrip-admin\src\pages\Users\UserDetail`
- `D:\DATN\danangtrip-admin\src\pages\Users\UserList`
- Existing edit references: `src/pages/Locations/LocationEdit`, `src/pages/Tours/TourEdit`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `GET /admin/users/{id}` loads the existing user before editing.
- `PUT /admin/users/{id}` updates optional fields. Backend allows role `admin|user`; do not expose `staff`.
- Backend `UpdateUserRequest` does not include `status`; use `PATCH /admin/users/{id}/status` for status if included.
- Self-protection: do not allow admin to change their own role/status/delete; preserve backend forbidden behavior and clear UI messages.
- Cancel/profile actions should return to `/admin/users/{id}` when id is valid.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_users_edit` except shared user API/types/hooks needed by edit.
- Prefer existing user create/detail/list patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_users_edit`.
Read mandatory context, codegraph, `admin_users_edit.md`, backend user controller/request/service, and existing create/edit pages.
Work: document screen purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-23__admin_users_edit__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_users_edit`.
Inspect route conventions, i18n loader, existing edit/form test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-23__admin_users_edit__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_users_edit`.
Inspect endpoints, `userApi`, `useUserQueries`, `user.dataHelper`, `user.mapper`, backend `UpdateUserRequest` and `UserService`.
Work: add/align update request/response types, API method, mutation hook, validation shape and mapper. Keep role/status values backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-23__admin_users_edit__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_users_edit`.
Target route: `/admin/users/:id/edit`.
Work: add `USERS_EDIT` route constant, lazy route, page shell, edit navigation from list/detail if safe, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-23__admin_users_edit__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_users_edit`.
Work: implement header, prefilled edit form, readonly username/info boxes, account settings sidebar, quick actions, validation messages, loading/submitting states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-23__admin_users_edit__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_users_edit`.
Work: wire detail query, update-user mutation, backend validation errors, toast feedback, users/detail cache invalidation, and optional status/delete quick actions.
Output: `.agent/artifacts/integration/2026-05-23__admin_users_edit__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_users_edit`.
Work: implement cancel/back navigation, view-profile link, submit behavior, role/status controls, dirty form prompt if project has pattern, validation focus, disabled/loading behavior and dialogs.
Output: `.agent/artifacts/interaction-specs/2026-05-23__admin_users_edit__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_users_edit`.
Work: verify protected route, admin/staff access reality, self-role/status/delete protection, authenticated API calls, forbidden/unauthorized/validation behavior and token refresh handling.
Output: `.agent/artifacts/auth/2026-05-23__admin_users_edit__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_users_edit`.
Run as feasible: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, focused route/console tests if available, and `npm.cmd run prepush:check`.
Work: fix feature-caused failures and document pass/fail/skipped commands.
Output: `.agent/artifacts/test-cases/2026-05-23__admin_users_edit__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_users_edit`.
Inputs: artifacts 01-09, validation output, final git diff.
Work: final review for route/API/i18n/UI/interactions/auth/tests, run or cite final validation, create deploy report and review, update memory files.
Outputs: `.agent/artifacts/deploy/2026-05-23__admin_users_edit__deploy-report.md`; `.agent/artifacts/review/2026-05-23__admin_users_edit__review.md`
```
