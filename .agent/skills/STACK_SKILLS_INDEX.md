# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_contacts`.

## Current Decision Snapshot

Date locked: `2026-05-24`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Lien he`
- Feature slug: `admin_contacts`
- Main route: `/admin/contacts`
- Optional detail state: `/admin/contacts?id={id}` or in-page selected contact state; do not create a separate detail route unless repo patterns require it.
- Target page path: `src/pages/Contacts/index.tsx`
- Target component folder: `src/pages/Contacts/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_contacts.md`
- Primary APIs: `GET /admin/contacts`, `GET /admin/contacts/{id}`, `POST /admin/contacts/{id}/reply`, `DELETE /admin/contacts/{id}`
- Export API: `GET /admin/contacts/export`
- Status: selected next screen after `admin_users_edit` Step 10 completion.
- Implementation reality: `admin_users_list`, `admin_users_detail`, `admin_users_create`, and `admin_users_edit` now have route/page/component code. `admin_contacts` has backend API and endpoint constant seed, but no page/route/module yet.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Current selection rule: only choose screens that do not yet have route/page/component code in the admin repo.
- Codegraph/repo contains the users cluster and reports cluster; do not rebuild them.
- Repo has no `src/pages/Contacts` module and no `/admin/contacts` route registration.
- Backend has contacts list/detail/reply/delete/export routes mapped to `Admin\ContactController`.
- `admin_contacts.md` defines a master-detail support workflow that is independent and API-ready.
- Existing dashboard code already references `API_ENDPOINTS.CONTACTS.LIST` for new-contact fallback counts, so contacts are part of current product scope.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Codegraph was refreshed on `2026-05-24`; verify with `rg --files` because generated indexes can lag.
- Existing endpoint seed: `src/constants/endpoints.ts` has `CONTACTS.LIST: '/admin/contacts'`.
- Existing dashboard fallback uses `API_ENDPOINTS.CONTACTS.LIST`, but there is no full contacts API module/hook/page yet.
- Backend `IndexContactRequest` supports `status`, `page`, `per_page`; it does not currently validate `search`.
- Backend contact routes also support `GET /admin/contacts/{id}`, `POST /admin/contacts/{id}/reply`, `DELETE /admin/contacts/{id}`, and `GET /admin/contacts/export`.
- Use existing admin list/detail/report patterns for layout, loading, empty/error states, `CustomSelect`, `LoadingReact`, `sonner`, and i18n.

## Goals

- Deliver the missing `/admin/contacts` screen through the 10-step pipeline.
- Build a master-detail admin support interface: list panel, selected detail panel, reply form, delete confirmation, export action.
- Support backend-safe filters: `status`, `page`, `per_page`. Do not send unsupported `search` unless backend is extended first.
- Show stats row based on list metadata/status counts if available; otherwise derive from loaded data or use safe placeholders with clear loading.
- Add route constant, lazy route, sidebar/navigation link if consistent with existing admin IA.
- Add contacts API layer, data types, mapper and React Query hooks.
- Do not implement notifications, CMS/blog, promotions, settings, web screens, or rebuild users/reports/bookings.
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
7. Latest relevant `admin_contacts` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align contact endpoints, request/response types, API methods, hooks and mapper. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route, page shell, sidebar/menu alignment and i18n namespace/files. |
| `05-ui-components` | Code-producing | Implement header, stats row, master list, detail panel, reply form, delete dialog, loading/empty/error states. |
| `06-data-integration` | Code-producing | Wire list/detail/reply/delete/export queries/mutations, backend validation errors, toasts and cache invalidation. |
| `07-interactions` | Code-producing | Implement status filters, pagination, selected item sync, reply submit, delete flow, export and responsive behavior. |
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
- Feature slug: `admin_contacts`
- Screen name: `Lien he`
- Main route: `/admin/contacts`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Contacts\index.tsx`
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Contacts\components`
- Feature type: authenticated admin/staff support contact master-detail screen.
- Do not switch to notifications, CMS/blog, promotions, settings, reports, users, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_users_edit` completed Step 10 and exists in repo.
- `/admin/contacts` has no registered route/page/component code.
- Backend has contacts list/detail/reply/delete/export routes.
- Screen doc exists: `D:\DATN\DATN_Document\docs\page\admin_contacts.md`.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_contacts` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_contacts.md`
- Related docs: `admin_notifications_list.md`, `admin_notifications_send.md`, `admin_dashboard.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller: `D:\DATN\danangtrip-api\app\Http\Controllers\Api\Admin\ContactController.php`
- Backend requests: `D:\DATN\danangtrip-api\app\Http\Requests\Contact`
- Backend service/repository: `D:\DATN\danangtrip-api\app\Services\ContactService.php`, `D:\DATN\danangtrip-api\app\Repositories\Eloquent\ContactRepository.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- Existing API modules under `D:\DATN\danangtrip-admin\src\api`
- Existing hooks under `D:\DATN\danangtrip-admin\src\hooks`
- Existing list/detail pages: `Bookings`, `Payments`, `Users`, `Reports`
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- `GET /admin/contacts` supports `status`, `page`, `per_page`.
- Backend status values: `new`, `read`, `replied`.
- `GET /admin/contacts/{id}` loads detail and may mark a contact as read according to backend behavior.
- `POST /admin/contacts/{id}/reply` body uses `reply`.
- `DELETE /admin/contacts/{id}` deletes selected contact.
- `GET /admin/contacts/export` exports the filtered contacts list.
- Do not send unsupported `search` until backend request/repository supports it.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_contacts` except shared endpoint/API/types/hooks needed by contacts.
- Prefer existing admin list/detail/report patterns over creating a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_contacts`.
Read mandatory context, codegraph, `admin_contacts.md`, backend contact routes/requests/controller/service, and existing admin list/detail patterns.
Work: document screen purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-24__admin_contacts__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_contacts`.
Inspect route conventions, sidebar/menu patterns, i18n loader, list/detail test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-24__admin_contacts__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_contacts`.
Inspect endpoints, existing API modules, hooks, data helpers/mappers, backend contact requests and `ContactService`.
Work: add/align contact list/detail/reply/delete/export endpoints, request/response types, API methods, hooks and mapper. Keep filters backend-safe.
Output: `.agent/artifacts/api-contracts/2026-05-24__admin_contacts__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_contacts`.
Target route: `/admin/contacts`.
Work: add route constant, lazy route, page shell, sidebar/menu entry if consistent, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-24__admin_contacts__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_contacts`.
Work: implement page header, stats row, master list panel, detail panel, reply form, replied view, delete dialog, loading/empty/error states.
Output: `.agent/artifacts/ui-specs/2026-05-24__admin_contacts__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_contacts`.
Work: wire contacts list/detail/reply/delete/export, backend validation errors, toast feedback, query invalidation and selected-contact refresh.
Output: `.agent/artifacts/integration/2026-05-24__admin_contacts__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_contacts`.
Work: implement status tabs, pagination, selected item sync, reply submit, delete confirm, export, responsive behavior, disabled/loading states.
Output: `.agent/artifacts/interaction-specs/2026-05-24__admin_contacts__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_contacts`.
Work: verify protected admin route, authenticated API calls, forbidden/validation handling, and no public leakage of contact data.
Output: `.agent/artifacts/auth/2026-05-24__admin_contacts__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_contacts`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-24__admin_contacts__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_contacts`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-24__admin_contacts__deploy-report.md` and `.agent/artifacts/review/2026-05-24__admin_contacts__review.md`
```
