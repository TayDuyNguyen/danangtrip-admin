# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_notifications_send`.

## Current Decision Snapshot

Date locked: `2026-05-24`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Gui thong bao`
- Feature slug: `admin_notifications_send`
- Main route: `/admin/notifications/send`
- Target page path: `src/pages/Notifications/NotificationSend/index.tsx`
- Target component folder: `src/pages/Notifications/NotificationSend/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_notifications_send.md`
- Primary API: `POST /admin/notifications/send`
- Bulk API: `POST /admin/notifications/send-all`
- Supporting API: `GET /admin/users` for recipient search/selection.
- Status: selected next screen after `admin_notifications_list` Step 10 completion and merge to `dev`.
- Implementation reality: `admin_notifications_list` is implemented and validated with deploy/review artifacts. The list screen has a CTA to `/admin/notifications/send`; endpoint constants already expose `SEND` and `SEND_ALL`, but there is no send page/route/API method/form yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: choose a documented screen that still lacks route/page/component code in the admin repo.
- Progress report `0.0.10` locks admin next screen as `admin_notifications_send`.
- Codegraph was refreshed on `2026-05-24 16:05`; verify with `rg --files` because generated indexes can lag.
- Repo contains `src/pages/Notifications/NotificationList` and route `/admin/notifications`; do not rebuild notification list.
- Backend has `POST /admin/notifications/send` and `POST /admin/notifications/send-all` mapped to `Admin\NotificationController`.
- Existing endpoint constants include `API_ENDPOINTS.NOTIFICATIONS.SEND` and `SEND_ALL`, but `notificationApi` currently exposes only list/delete.
- Existing routes constants include `NOTIFICATIONS` only; add a send route constant/lazy route for this screen.
- This screen completes the notifications communication workflow after list/delete.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph file timestamp: `2026-05-24 16:05`.
- Existing list page: `src/pages/Notifications/NotificationList/index.tsx`.
- Existing list components: filter bar, stats row, table, delete dialog.
- Existing notification API module: `src/api/notificationApi.ts`.
- Existing notification hook: `src/hooks/useNotificationQueries.ts`.
- Existing notification types: `src/types/notification.ts`.
- Existing notification i18n: `public/lang/vi/notification.json`, `public/lang/en/notification.json`.
- Existing route constant: `ROUTES.NOTIFICATIONS = '/admin/notifications'`.
- Missing route/page: `/admin/notifications/send`, `src/pages/Notifications/NotificationSend`.
- Backend request reality:
  - `SendNotificationRequest`: `user_id` required integer existing user, `type` required string max 30, `title` required string max 255, `content` required string, `data` optional array.
  - `SendAllNotificationRequest`: same minus `user_id`.
- Backend service sends individual notification by create, and bulk notification by chunking users in batches of 500.

## Goals

- Deliver the missing `/admin/notifications/send` screen through the 10-step pipeline.
- Add route constant, lazy route, API send/sendAll methods, request/response types, mutation hook(s), page shell, i18n keys, and form UI.
- Support two modes: individual recipient and send-all.
- Individual mode must require a selected user and submit `POST /admin/notifications/send`.
- Bulk mode must confirm before submit and call `POST /admin/notifications/send-all`.
- Validate title/content/type and optional JSON data before sending.
- Use backend-safe payload shape: `user_id`, `type`, `title`, `content`, `data`.
- Reuse existing notification API/types/hooks/i18n patterns and existing admin form/list design.
- Do not implement notification list again, contacts, CMS/blog, promotions, settings, reports, users CRUD, web screens, or backend-only work unless a small frontend contract gap requires it.
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
7. Latest relevant `admin_notifications_send` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align send/sendAll endpoints, payload types, response types, API methods, hooks and user search contract. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route, page shell, sidebar/CTA alignment and i18n namespace/files. |
| `05-ui-components` | Code-producing | Implement header, mode toggle, recipient selector, form card, preview card, guide card, confirm dialog, loading/empty/error states. |
| `06-data-integration` | Code-producing | Wire send/sendAll mutations, user search/selection, backend validation errors, toasts and navigation. |
| `07-interactions` | Code-producing | Implement mode switching, JSON validation, char counters, confirm bulk send, cancel, disabled/loading states, responsive behavior. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected admin route, authenticated API calls, forbidden/validation handling and no public leakage. |
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
- Feature slug: `admin_notifications_send`
- Screen name: `Gui thong bao`
- Main route: `/admin/notifications/send`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Notifications\NotificationSend\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Notifications\NotificationSend\components`
- Feature type: authenticated admin/staff notification send form.
- Do not switch to notification list, contacts, CMS/blog, promotions, settings, reports, users CRUD, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_notifications_list` completed Step 10 and exists in repo.
- Progress report `0.0.10` locks `admin_notifications_send` as the next admin screen.
- `/admin/notifications/send` has backend send/send-all APIs and a CTA from the list screen.
- Repo lacks the send route/page/component and API methods.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_notifications_send` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_notifications_send.md`
- Related docs: `admin_notifications_list.md`, `admin_contacts.md`, `admin_users_list.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\NotificationController.php`
- Backend requests: `D:\DATN\danangtrip-api\app\Http\Requests\Notification\SendNotificationRequest.php`, `D:\DATN\danangtrip-api\app\Http\Requests\Notification\SendAllNotificationRequest.php`
- Backend service/repository: `D:\DATN\danangtrip-api\app\Services\NotificationService.php`, `D:\DATN\danangtrip-api\app\Repositories\Eloquent\NotificationRepository.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\notificationApi.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useNotificationQueries.ts`
- `D:\DATN\danangtrip-admin\src\types\notification.ts`
- Existing user search/list API and hooks under `src/api`, `src/hooks`, `src/types`
- Existing forms/pages: `Users`, `Contacts`, `Notifications/NotificationList`
- `D:\DATN\danangtrip-admin\public\lang\vi\notification.json`
- `D:\DATN\danangtrip-admin\public\lang\en\notification.json`

CONTRACT DETAILS
- Individual send API: `POST /admin/notifications/send`.
- Individual payload: `user_id` required integer, `type` required string max 30, `title` required string max 255, `content` required string, `data` optional object/array.
- Bulk send API: `POST /admin/notifications/send-all`.
- Bulk payload: same as individual minus `user_id`.
- Recipient search should use an existing admin users endpoint/hook if available; keep query params backend-safe.
- Notification types can include `booking`, `rating`, `system`, `promotion` unless docs/backend restrict otherwise.
- Validate optional data as JSON object before sending.
- Bulk mode must ask for confirmation before calling send-all.
- On success, show toast and navigate back to `/admin/notifications`.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_notifications_send` except shared endpoint/API/types/hooks needed by notifications/user search.
- Prefer existing admin form, table, i18n, React Query and toast patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_notifications_send`.
Read mandatory context, codegraph, `admin_notifications_send.md`, backend send/send-all routes/requests/controller/service/repository, and existing admin notification/user patterns.
Work: document screen purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-24__admin_notifications_send__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_notifications_send`.
Inspect route conventions, sidebar/menu patterns, i18n loader, form/test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-24__admin_notifications_send__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_notifications_send`.
Inspect notification endpoints, `notificationApi`, hooks, types, backend send requests and `NotificationService`.
Work: add/align send/sendAll request/response types, API methods, mutation hooks, and user search contract. Keep payload backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-24__admin_notifications_send__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_notifications_send`.
Target route: `/admin/notifications/send`.
Work: add route constant, lazy route, page shell, back navigation to list, and i18n keys/files.
Output: `.agent/artifacts/routing/2026-05-24__admin_notifications_send__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_notifications_send`.
Work: implement page header, mode toggle, recipient selector, notification form, preview card, guide card, confirm dialog, loading/error states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-24__admin_notifications_send__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_notifications_send`.
Work: wire user search/selection, send/sendAll mutations, backend validation errors, toast feedback, cache invalidation and navigation.
Output: `.agent/artifacts/integration/2026-05-24__admin_notifications_send__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_notifications_send`.
Work: implement mode switching, JSON validation, char counters, bulk confirm, cancel/back, disabled/loading states, keyboard/accessibility and responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-24__admin_notifications_send__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_notifications_send`.
Work: verify protected admin route, authenticated admin API calls, forbidden/validation handling, and no public leakage of notification data.
Output: `.agent/artifacts/auth/2026-05-24__admin_notifications_send__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_notifications_send`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-24__admin_notifications_send__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_notifications_send`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-24__admin_notifications_send__deploy-report.md` and `.agent/artifacts/review/2026-05-24__admin_notifications_send__review.md`
```
