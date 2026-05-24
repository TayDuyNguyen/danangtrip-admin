# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_notifications_list`.

## Current Decision Snapshot

Date locked: `2026-05-24`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Danh sach thong bao`
- Feature slug: `admin_notifications_list`
- Main route: `/admin/notifications`
- Target page path: `src/pages/Notifications/NotificationList/index.tsx`
- Target component folder: `src/pages/Notifications/NotificationList/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_notifications_list.md`
- Primary API: `GET /admin/notifications`
- Delete API: `DELETE /admin/notifications/{id}`
- Related future screen/API: `/admin/notifications/send`, `POST /admin/notifications/send`, `POST /admin/notifications/send-all`
- Status: selected next screen after `admin_contacts` Step 10 completion and merge to `dev`.
- Implementation reality: `admin_contacts` is implemented and validated with deploy/review artifacts. Admin notifications backend routes exist, but no admin notifications page/module is registered yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: choose a documented screen that still lacks route/page/component code in the admin repo.
- Codegraph/repo contains `src/pages/Contacts` and `/admin/contacts`; do not rebuild contacts.
- Repo sidebar already has a conceptual `/admin/notifications` menu entry, but no `src/pages/Notifications` route/page module.
- Backend has admin notifications list/delete/send routes mapped to `Admin\NotificationController`.
- `admin_notifications_list.md` defines a support/communication list workflow that is independent and API-ready.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph was refreshed on `2026-05-24 13:21`; verify with `rg --files` because generated indexes can lag.
- Existing sidebar path seed: `src/components/common/Sidebar.tsx` contains `/admin/notifications`.
- Existing endpoint constants do not yet include admin notifications.
- Backend `AdminListNotificationRequest` supports `user_id`, `type`, `page`, and `per_page`.
- Backend repository eager-loads `user:id,full_name,email` and orders by `created_at desc`.
- Backend does not currently support `search`, `is_read`, `status`, or bulk delete for admin notifications list.
- Use existing admin list/table patterns, `CustomSelect` where available, `LoadingReact`, `sonner`, React Query, and i18n.

## Goals

- Deliver the missing `/admin/notifications` screen through the 10-step pipeline.
- Build an admin notifications list: header, stats row from available data, filter bar, table, pagination, delete confirmation, and send-notification CTA behavior.
- Support backend-safe filters: `user_id`, `type`, `page`, `per_page`.
- Do not send unsupported `search`, `is_read`, `status`, or bulk delete unless backend is extended first.
- Add route constant, lazy route, endpoint constants, API layer, data types, mapper and React Query hooks.
- Keep send notification as navigation/CTA only if route exists or is intentionally added for the future screen; do not implement `admin_notifications_send` in this screen unless explicitly requested.
- Do not implement contacts, CMS/blog, promotions, settings, reports, users, web screens, or backend-only work.
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
7. Latest relevant `admin_notifications_list` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align notification endpoints, request/response types, API methods, hooks and mapper. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route, page shell, sidebar/menu alignment and i18n namespace/files. |
| `05-ui-components` | Code-producing | Implement header, stats row, filter bar, notifications table, pagination, delete dialog, loading/empty/error states. |
| `06-data-integration` | Code-producing | Wire list/delete queries/mutations, backend validation errors, toasts and cache invalidation. |
| `07-interactions` | Code-producing | Implement supported filters, pagination, per-page, row selection if safe, delete confirm, send CTA and responsive behavior. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected route, admin-only API calls, forbidden/validation handling and no public leakage. |
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
- Feature slug: `admin_notifications_list`
- Screen name: `Danh sach thong bao`
- Main route: `/admin/notifications`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Notifications\NotificationList\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Notifications\NotificationList\components`
- Feature type: authenticated admin/staff notifications list screen.
- Do not switch to notification send, contacts, CMS/blog, promotions, settings, reports, users, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_contacts` completed Step 10 and exists in repo.
- `/admin/notifications` has sidebar seed but no registered route/page/component code.
- Backend has admin notifications list and delete routes.
- Screen doc exists: `D:\DATN\DATN_Document\docs\page\admin_notifications_list.md`.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_notifications_list` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_notifications_list.md`
- Related docs: `admin_notifications_send.md`, `admin_contacts.md`, `admin_dashboard.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\NotificationController.php`
- Backend request: `D:\DATN\danangtrip-api\app\Http\Requests\Notification\AdminListNotificationRequest.php`
- Backend service/repository: `D:\DATN\danangtrip-api\app\Services\NotificationService.php`, `D:\DATN\danangtrip-api\app\Repositories\Eloquent\NotificationRepository.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- Existing API modules under `D:\DATN\danangtrip-admin\src\api`
- Existing hooks under `D:\DATN\danangtrip-admin\src\hooks`
- Existing list/table pages: `Contacts`, `Users`, `Bookings`, `Payments`, `Reports`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `GET /admin/notifications` supports `user_id`, `type`, `page`, `per_page`.
- Backend response is paginated notifications with related `user:id,full_name,email`.
- `DELETE /admin/notifications/{id}` deletes selected notification.
- `POST /admin/notifications/send` and `POST /admin/notifications/send-all` are for the future send screen, not required for this list screen.
- Do not send unsupported `search`, `status`, `is_read`, or bulk delete params until backend request/repository supports them.
- If stats are needed, derive safely from loaded page or extend backend intentionally in Step 03; do not fabricate global read/unread totals.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_notifications_list` except shared endpoint/API/types/hooks needed by notifications.
- Prefer existing admin list/table patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_notifications_list`.
Read mandatory context, codegraph, `admin_notifications_list.md`, backend notification routes/request/controller/service/repository, and existing admin list/table patterns.
Work: document screen purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-24__admin_notifications_list__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_notifications_list`.
Inspect route conventions, sidebar/menu patterns, i18n loader, list/table test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-24__admin_notifications_list__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_notifications_list`.
Inspect endpoints, existing API modules, hooks, data helpers/mappers, backend notification requests and `NotificationService`.
Work: add/align notification list/delete endpoints, request/response types, API methods, hooks and mapper. Keep filters backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-24__admin_notifications_list__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_notifications_list`.
Target route: `/admin/notifications`.
Work: add route constant, lazy route, page shell, sidebar/menu entry alignment, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-24__admin_notifications_list__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_notifications_list`.
Work: implement page header, stats row, filter bar, notifications table, pagination, delete dialog, loading/empty/error states.
Output: `.agent/artifacts/ui-specs/2026-05-24__admin_notifications_list__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_notifications_list`.
Work: wire notifications list/delete, backend validation errors, toast feedback, query invalidation and supported filters.
Output: `.agent/artifacts/integration/2026-05-24__admin_notifications_list__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_notifications_list`.
Work: implement type/user filters, pagination, per-page, delete confirm, send CTA behavior, responsive table behavior, disabled/loading states.
Output: `.agent/artifacts/interaction-specs/2026-05-24__admin_notifications_list__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_notifications_list`.
Work: verify protected admin route, authenticated API calls, forbidden/validation handling, and no public leakage of notification data.
Output: `.agent/artifacts/auth/2026-05-24__admin_notifications_list__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_notifications_list`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-24__admin_notifications_list__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_notifications_list`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-24__admin_notifications_list__deploy-report.md` and `.agent/artifacts/review/2026-05-24__admin_notifications_list__review.md`
```
