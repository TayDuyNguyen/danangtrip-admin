# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Use this file to decide which skill to activate, what context must be read first, and what artifact each step should produce.

  - 01-screen-analysis: phân tích, chưa code
  - 02-project-setup: audit/setup, thường chưa code feature
  - 03-types-api-contract: tài liệu + type/schema/service plan, có thể có code nền dữ liệu
    nhưng chưa phải UI
  - 04-layout-routing: route/layout plan, có thể scaffold nhẹ cấu trúc route
  - 05-ui-components: bắt đầu thực hiện code giao diện
  - 06-data-integration: nối data vào UI
  - 07-interactions: làm form, filter, search, pagination, mutation
  - 08-auth-permissions: gate quyền trên UI/route
  - 09-testing: test
  - 10-optimization-deploy: tối ưu, review, deploy readiness

## Goals

- Stay aligned with the real `danangtrip-admin` repository.
- Keep one execution model across Claude, Gemini, OpenCode, and manual runs.
- Produce reusable project artifacts, not one-off answers.
- Prevent template drift by checking repo reality before following a skill.

## Canonical Read Order

Before every skill step, read in this order. Do this again at the start of each step, even if the same files were read in a previous step:

1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. `.agent/memory/WORKING_STATE.md`
4. `.agent/memory/HANDOFF.md`
5. Relevant recent files in `.agent/memory/decisions/` and `.agent/artifacts/`
6. Real repo sources: `package.json`, `src/`, `vite.config.ts`, `tsconfig.app.json`
7. The specific `SKILL.md` that matches the task

If these sources conflict, follow the earlier item in the list.

## Memory Continuity Rules

- Before every skill step, reread `.agent/memory/WORKING_STATE.md`, `.agent/memory/HANDOFF.md`, `.agent/memory/SESSION_LOG.md`, and the latest relevant artifact for the active feature.
- At the start of a step, update `WORKING_STATE.md` with `Current step`, objective, expected artifact, and whether the step is planning-only or code-producing.
- After finishing every skill step, update `WORKING_STATE.md` with what changed, the produced artifact, files changed, current risks, and the next step.
- After finishing every skill step, append one concise entry to `SESSION_LOG.md`.
- If the work is paused, blocked, waiting for approval, or incomplete, update `HANDOFF.md` before stopping.
- Do not claim a step is complete until the artifact and memory updates for that step are also complete.

## Coding Responsibility By Skill

| Skill | Execution mode | Code expectation |
| --- | --- | --- |
| `01-screen-analysis` | Analysis only | Do not edit product code; create/update analysis artifact and memory. |
| `02-project-setup` | Audit/setup | Usually no feature code; config/script fixes are allowed only when required by the audit. |
| `03-types-api-contract` | Contract/code foundation | If implementing a feature, add/update types, validation schemas, endpoint constants, API modules, or mappers when missing. |
| `04-layout-routing` | Routing/code scaffold | Add/update route constants, lazy imports, route registration, page shells, sidebar/menu entries, and i18n keys when missing. |
| `05-ui-components` | Code-producing | Implement or update UI components immediately; do not stop at a UI spec when the user has asked to build the screen. |
| `06-data-integration` | Code-producing | Wire queries, mutations, API modules, mapper flows, loading, empty, and error states into the UI. |
| `07-interactions` | Code-producing | Implement forms, validation, filters, pagination, mutations, exports, toasts, and confirmation flows. |
| `08-auth-permissions` | Code-producing when guards are missing | Implement route guards, role gates, or sensitive action gating if the review finds gaps. |
| `09-testing` | Validation/fix loop | Run checks, write/update focused tests when appropriate, and fix issues caused by the feature. |
| `10-optimization-deploy` | Finalization/fix loop | Do final review, optimize only relevant issues, update handoff/review artifacts, and leave memory complete. |

## How To Run Skills

### Preferred

Use the platform adapter already installed at the repo root:

- `AGENTS.md` for the shared operating contract
- `.claude/commands/` for Claude-style entry points
- `.gemini/commands/` for Gemini-style entry points
- `.opencode/skills` for OpenCode skill discovery

In this mode, the adapter should route back to `.agent/` and keep working memory and artifacts current.

### Fallback

If the platform cannot use the root adapters, manually activate the skill by:

1. Reading the canonical read order above
2. Opening the target skill folder
3. Supplying the required context fields shown in this file
4. Writing the output artifact to `.agent/artifacts/...`
5. Updating `WORKING_STATE.md` or `HANDOFF.md` if task state changed

Do not treat manual prompt injection as the primary mode anymore. It is only the fallback mode.

## Full Pipeline Approval Prompt

Use this prompt when you want the AI to execute the entire local pipeline from start to finish, but only one approved step at a time.
This is the strictest execution mode and is the recommended choice for large feature work.

```text
SYSTEM EXECUTION CONTRACT

Act as the execution agent for repository: `[REPO_PATH]`

Your job is to run the local `.agent` pipeline step by step, with strict user approval gates.
You MUST NOT skip, merge, reorder, or auto-complete any step unless I explicitly approve the current step and tell you to continue.

MANDATORY READ ORDER BEFORE ANY WORK
1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. relevant recent files in `.agent/memory/decisions/` and `.agent/artifacts/`
7. `.agent/skills/STACK_SKILLS_INDEX.md`
8. the current step's `SKILL.md`

GLOBAL RULES
- You MUST follow the local `.agent` system only.
- You MUST treat `.agent` as the single source of truth.
- You MUST execute all steps in order.
- You MUST NOT skip any step.
- You MUST NOT combine multiple steps into one response.
- You MUST stop after each step and wait for my approval.
- You MUST reread `.agent/memory/WORKING_STATE.md`, `.agent/memory/HANDOFF.md`, `.agent/memory/SESSION_LOG.md`, and relevant latest artifacts before every step.
- You MUST update `.agent/memory/WORKING_STATE.md` at the start and end of every step.
- You MUST append a concise entry to `.agent/memory/SESSION_LOG.md` after every completed step.
- You MUST update `.agent/memory/HANDOFF.md` if work is paused, blocked, waiting for approval, or incomplete.
- You MUST create or update the required artifact for each step under `.agent/artifacts/`.
- You MUST write code starting at `05-ui-components` for feature implementation. Steps `03` and `04` must also write code when types, API modules, routes, page shells, or menu entries are missing.
- If repo reality conflicts with a template, follow repo reality and record the mismatch in the artifact.
- If information is missing, state the missing input inside the current step output, but do NOT jump ahead.

APPROVAL GATE
After finishing each step, STOP and wait.
Only continue when I reply with one of:
- `duyệt`
- `ok bước này`
- `tiếp tục`
- `next`

If I give feedback, revise the SAME current step first.
Do not start the next step until I explicitly approve.

PIPELINE ORDER
Execute in this exact order:

1. `01-screen-analysis`
2. `02-project-setup`
3. `03-types-api-contract`
4. `04-layout-routing`
5. `05-ui-components`
6. `06-data-integration`
7. `07-interactions`
8. `08-auth-permissions`
9. `09-testing`
10. `10-optimization-deploy`

STEP-BY-STEP EXECUTION RULE
For each step:
1. Reread memory files and latest relevant artifacts.
2. Read the step's `SKILL.md`.
3. Update `.agent/memory/WORKING_STATE.md` to mark the active step.
4. Restate the goal of the step in repository terms.
5. List required inputs for that step.
6. Perform only that step, including code edits when the skill's execution mode requires code.
7. Produce or update the step artifact.
8. Update `.agent/memory/WORKING_STATE.md`, append `SESSION_LOG.md`, and update `HANDOFF.md` when needed.
9. Report exactly what was done.
10. Report what is still unknown or risky.
11. STOP for approval.

RESPONSE FORMAT FOR EVERY STEP

`CURRENT STEP`
- Skill: `[skill-name]`
- Goal: `[what this step is trying to achieve]`

`INPUTS USED`
- `[file / artifact / repo source / memory source]`

`WORK COMPLETED`
- `[flat bullet list of concrete work done in this step only]`

`ARTIFACT`
- Path: `[artifact path]`
- Status: `[created | updated | blocked]`

`FILES READ`
- `[paths]`

`FILES CHANGED`
- `[paths or NONE]`

`RISKS OR OPEN QUESTIONS`
- `[flat bullet list or NONE]`

`GATE`
- Reply `duyệt` to move to `[next-skill-name]`
- Reply with feedback if this step must be revised

TASK CONTEXT
- Repo: `[REPO_PATH]`
- Feature slug: `[FEATURE_SLUG]`
- Feature/screen name: `[FEATURE_NAME]`
- Figma: `[FIGMA_LINK or NONE]`
- API docs: `[API_DOC_PATH or NONE]`
- PRD/SRS: `[PRD_PATH or NONE]`
- Extra constraints: `[ANY SPECIAL RULES or NONE]`

BEGIN NOW
Start with step `01-screen-analysis`.
Do not preview future steps.
Do not implement code for later steps.
Do not skip the approval gate.
```

## Artifact Standard

Artifact naming:

```text
.agent/artifacts/<group>/YYYY-MM-DD__<feature-slug>__<artifact-name>.md
```

Artifact quality rules:

- UTF-8
- One `#` H1 only
- Include feature slug, date, and sources used
- Mark uncertainty with `[ASSUMPTION]`
- No broken encoding or placeholder junk

A good artifact answers:

- What feature or task is being worked on?
- Which sources were used?
- Which files are affected?
- Which technical or business rules apply?
- What risks, blockers, or open questions remain?

Final-phase artifacts such as `test-report`, `deploy-report`, and `review.md` must also include:

- clear verdict
- concrete evidence
- `not run`, `skipped`, or `pending` sections when needed
- next actions or residual risks

## Repository Reality

| Area | Reality |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Server state | @tanstack/react-query |
| Client state | zustand |
| HTTP | axios + axiosClient interceptor |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + yup in the current standard pattern |
| i18n | react-i18next |
| Icons | lucide-react, react-icons |
| Notifications | sonner |
| Charts | recharts |
| Build gate | `npm run prepush:check` |

Reality check note:

- Before following any skill template, compare it against `.agent/rules/REPO_FACTS.md`.
- If a template and repo diverge, follow the repo and record the mismatch in the artifact.

## Pipeline Map

| # | Skill | Use When | Primary Artifact | Can Skip When |
| --- | --- | --- | --- | --- |
| 01 | `01-screen-analysis` | New screen, flow, Figma, or requirement analysis | `analysis/...__screen-analysis.md` | Tiny bug fix with no UI or flow change |
| 02 | `02-project-setup` | Base audit, config check, stack drift, runtime readiness | `audits/...__project-audit.md` | Recent audit still reflects current repo state |
| 03 | `03-types-api-contract` | New or changed fields, schemas, API contracts, mappers | `api-contracts/...__api-contract.md` | Pure copy or style change with no data impact |
| 04 | `04-layout-routing` | New routes, page shells, breadcrumbs, menu impact | `routing/...__route-plan.md` | Only editing a child component inside an existing page |
| 05 | `05-ui-components` | New UI build or component refactor | `ui-specs/...__ui-spec.md` | Logic-only change with no UI structure impact |
| 06 | `06-data-integration` | Wiring API, query flows, and invalidation into UI | `integration/...__data-integration.md` | Static UI with no real data flow |
| 07 | `07-interactions` | CRUD flows, forms, filters, search, pagination | `interaction-specs/...__interaction-spec.md` | Read-only page with no meaningful interaction |
| 08 | `08-auth-permissions` | Role checks, guards, gated actions, sensitive flows | `auth/...__auth-permissions-review.md` | Public or unchanged permission model |
| 09 | `09-testing` | Validation before handoff | `test-cases/...__test-report.md` | Should not be skipped |
| 10 | `10-optimization-deploy` | Final readiness, handoff, push, deploy | `deploy/...__deploy-report.md`, `review/...__review.md` | Should not be skipped |

## Fast Activation By Task Type

### New Screen Or Feature

1. `01-screen-analysis`
2. `03-types-api-contract`
3. `04-layout-routing`
4. `05-ui-components`
5. `06-data-integration`
6. `07-interactions`
7. `08-auth-permissions` if needed
8. `09-testing`
9. `10-optimization-deploy`

### Project Audit

1. `02-project-setup`
2. `09-testing`
3. `10-optimization-deploy` if a final readiness summary is needed

### Small UI Change

1. Lightweight `01-screen-analysis` if scope is unclear
2. `05-ui-components`
3. `09-testing`

## Current Decision Snapshot

Date locked for this index: `2026-05-21`

### Single Chosen Screen Only

- Repo: `danangtrip-admin`
- Only screen to implement now: `Dashboard`
- Feature slug: `admin-dashboard`
- Main route: `/dashboard`
- Main file: `src/pages/Dashboard/index.tsx`
- Route note: project docs may mention `/admin/dashboard`, but repo reality uses `/dashboard` behind the admin app shell.
- Rule: do not switch to reports, users, contacts, promotions, settings, or any other admin page until this screen is finished through `10-optimization-deploy`.

### Candidate Screens Reviewed

| Candidate | Priority | Why it is relevant now | Why it is not the current first pick |
| --- | --- | --- | --- |
| `admin-dashboard` | High | The progress report marks it as `Làm ngay` and the current largest gap; repo already has route/page/API/hook foundations but no dedicated delivery artifact. | Selected as the current first pick. |
| `admin_reports_ratings` | High | Report backlog lists it as a near report screen and full list marks it high priority. | It is part of the reports group after dashboard; dashboard is the broader operational landing surface and already has stronger repo foundation. |
| `admin_reports_locations` | High | Same reports group and useful for catalog insight. | Should follow dashboard or report-group sequencing, not precede the dashboard delivery artifact. |
| `admin_reports_users` | High | Same reports group and useful for growth/account insight. | Better after dashboard because dashboard already includes user-growth widgets and establishes metric semantics. |
| `admin-users-list` | High | Core admin management screen. | Less directly tied to the current report's "Làm ngay" dashboard recommendation. |

### Selected Next Screen

- Screen: `Dashboard`
- Feature slug: `admin-dashboard`
- Main route: `/dashboard`
- Main file: `src/pages/Dashboard/index.tsx`
- Decision basis:
  - `project_delivery_progress_report.md` lists `admin-dashboard` under `Làm ngay`.
  - The same report states the biggest current admin gap is dashboard delivery because route/page/API/hook foundations already exist but no dedicated pipeline artifact exists.
  - `admin-payments-detail` is complete through Step 10, so the admin booking/payment operations path is ready to feed dashboard metrics.
  - The dashboard is the right place to normalize booking, revenue, user-growth, top-tour, pending-rating, and contact summary semantics before implementing individual report pages.

### Cross-Project Rollout Order

1. `danangtrip-web` implements `user-booking-by-code`
2. `danangtrip-admin` implements `admin-dashboard`
3. `danangtrip-admin` follows with `admin_reports_ratings` or the report group based on the next report update

Dependency rule:
- Keep dashboard metric labels, booking status groupings, revenue definitions, and payment/refund effects aligned with completed booking/payment admin screens and the real dashboard API contract.

## Recommended Current Screen Prompt

Use this ready prompt for the next recommended `danangtrip-admin` screen: dashboard delivery.

```text
SYSTEM EXECUTION CONTRACT

Act as the execution agent for repository: `D:\DATN\danangtrip-admin`

Your job is to implement or harden the recommended admin screen: `Dashboard`
Feature slug: `admin-dashboard`
Primary target route: `/dashboard`
Primary React Router file target: `src/pages/Dashboard/index.tsx`
Feature type: authenticated admin operations dashboard for business metrics, booking trends, revenue, top tours, recent bookings, pending ratings, and contacts.

SINGLE-SCREEN LOCK
- You are working on exactly one screen only: `Dashboard`.
- You MUST NOT switch to reports, users, contacts, promotions, settings, or unrelated admin pages in this run.
- If you discover an adjacent report API or widget issue, record it as dependency or follow-up and continue only with the dashboard scope.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
7. Current step `SKILL.md`
8. Screen and API references listed below

SCREEN REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_dashboard.md`
- Admin page list: `D:\DATN\DATN_Document\docs\reference\list_page.md`
- Flow priority note: `D:\DATN\DATN_Document\docs\reference\travel_com_benchmark_flow.md`
- Gap analysis: `D:\DATN\DATN_Document\docs\reference\screen_gap_analysis.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend API repo: `D:\DATN\danangtrip-api`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend schema note: `D:\DATN\danangtrip-api\SCHEMA_CURRENT_ANNOTATED.md`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\dashboardApi.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useDashboardQueries.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\dashboard.mapper.ts`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\StatsCards.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\DashboardCharts.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\RecentOrdersTable.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\TopToursTable.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\ReviewsTable.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\RecentActivities.tsx`

REQUIRED API FLOW
- Load dashboard stats from `GET /admin/dashboard/stats`.
- Load booking status counts, revenue, booking trend, user growth, top tours, and recent bookings through existing `dashboardApi` and `useDashboardQueries`.
- Preserve fallback behavior for pending ratings and new contacts if the stats payload omits those fields.
- Treat `/dashboard` as repo reality even if docs mention `/admin/dashboard`.
- If docs and repo differ on metric names, filter params, or response envelopes, follow repo reality and record the mismatch in the API-contract artifact.

EXPECTED UX
- Admin can scan revenue, bookings, users, tours, pending ratings, contacts, trends, top tours, and recent bookings from one operational surface.
- Loading, empty, partial-data, and API-error states are explicit per widget.
- Date/period filters and export actions remain aligned with existing hooks and API support.
- Dashboard remains protected by the existing `PrivateRoute` and current admin-only reality.
- Add or update i18n keys if touched UI text is translated in this repo.

PIPELINE ORDER
Execute in this exact order, stopping after each step for approval:
1. `01-screen-analysis`
2. `03-types-api-contract`
3. `04-layout-routing`
4. `05-ui-components`
5. `06-data-integration`
6. `07-interactions`
7. `08-auth-permissions`
8. `09-testing`
9. `10-optimization-deploy`

ARTIFACT TARGETS
- Analysis: `.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md`
- API contract: `.agent/artifacts/api-contracts/YYYY-MM-DD__admin-dashboard__api-contract.md`
- Routing: `.agent/artifacts/routing/YYYY-MM-DD__admin-dashboard__route-plan.md`
- UI spec: `.agent/artifacts/ui-specs/YYYY-MM-DD__admin-dashboard__ui-spec.md`
- Data integration: `.agent/artifacts/integration/YYYY-MM-DD__admin-dashboard__data-integration.md`
- Interaction spec: `.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-dashboard__interaction-spec.md`
- Auth review: `.agent/artifacts/auth/YYYY-MM-DD__admin-dashboard__auth-permissions-review.md`
- Test report: `.agent/artifacts/test-cases/YYYY-MM-DD__admin-dashboard__test-report.md`
- Deploy report: `.agent/artifacts/deploy/YYYY-MM-DD__admin-dashboard__deploy-report.md`
- Final review: `.agent/artifacts/review/YYYY-MM-DD__admin-dashboard__review.md`

BEGIN NOW
Start with step `01-screen-analysis`.
Do not implement code for later steps until the current step is approved.
```

## Project Kickoff Prompt

Use this when you want the AI to start the currently recommended admin work from zero context and still stay aligned with the system-level rollout order.

```text
SYSTEM ROLE

You are the execution planner and implementation agent for `D:\DATN\danangtrip-admin`.

CURRENT PRIORITY

- Repo: `D:\DATN\danangtrip-admin`
- Screen: `Dashboard`
- Feature slug: `admin-dashboard`
- Main route: `/dashboard`
- Main file target: `D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx`
- System role: this work follows completed booking and payment operations screens and creates a dedicated delivery artifact for the existing dashboard foundation.

SCOPE LOCK

- Only build or harden `Dashboard`.
- Do not expand scope into reports, users, contacts, promotions, settings, or unrelated admin pages.
- If another screen is needed, write it down as the next recommendation instead of implementing it now.

GOAL

Stabilize the dashboard so admins can:
1. scan key operational metrics safely
2. inspect revenue, booking status, booking trend, user growth, top tours, recent bookings, pending ratings, and contacts
3. recover cleanly from partial payloads and widget-level API failures
4. use existing dashboard API and query hooks without inventing a parallel data layer
5. establish metric semantics before the individual report screens are implemented

MANDATORY READ ORDER

1. `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
2. `D:\DATN\DATN_Document\docs\reference\travel_com_benchmark_flow.md`
3. `D:\DATN\DATN_Document\docs\reference\screen_gap_analysis.md`
4. `D:\DATN\DATN_Document\docs\reference\list_page.md`
5. `D:\DATN\DATN_Document\docs\page\admin_dashboard.md`
6. `D:\DATN\DATN_Document\docs\api\api_list.md`
7. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
8. `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
9. `D:\DATN\danangtrip-admin\src\routes\routes.ts`
10. `D:\DATN\danangtrip-admin\src\routes\index.tsx`
11. `D:\DATN\danangtrip-admin\src\api\dashboardApi.ts`
12. `D:\DATN\danangtrip-admin\src\hooks\useDashboardQueries.ts`
13. `D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts`
14. `D:\DATN\danangtrip-admin\src\dataHelper\dashboard.mapper.ts`
15. `D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx`
16. `D:\DATN\danangtrip-admin\src\pages\Dashboard\components\`

EXECUTION MODE

- Run the local `.agent` pipeline.
- Default step order for this feature:
  - `01-screen-analysis`
  - `03-types-api-contract`
  - `04-layout-routing`
  - `05-ui-components`
  - `06-data-integration`
  - `07-interactions`
  - `08-auth-permissions`
  - `09-testing`
  - `10-optimization-deploy`
- Stop after each step for approval.
- If docs and repo differ, follow repo reality and record the mismatch.
- If dashboard already has implementation, harden it through the pipeline instead of rebuilding it from scratch.

SUCCESS CRITERIA

- Dashboard route `/dashboard` remains registered and protected.
- Dashboard widgets use the real dashboard API/query foundation.
- Widget loading, empty, error, partial-data, and fallback states are documented and implemented where missing.
- Artifacts and memory files are updated for every completed step.

BEGIN

Start with `01-screen-analysis`.
```

## Manual Activation Templates - Current Recommended Screen

### Current Recommended Screen - Admin Dashboard

```text
Activate full pipeline for current recommended screen

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Screen name: [Dashboard]
- Primary target route: [/dashboard]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx]
- Route registration: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- Auth requirement: [Admin only; protected by existing PrivateRoute]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- Primary doc: [D:\DATN\DATN_Document\docs\page\admin_dashboard.md]
- Related docs: [D:\DATN\DATN_Document\docs\reference\list_page.md; D:\DATN\DATN_Document\docs\reference\travel_com_benchmark_flow.md; D:\DATN\DATN_Document\docs\reference\screen_gap_analysis.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Backend API repo: [D:\DATN\danangtrip-api]
- Backend routes: [D:\DATN\danangtrip-api\routes\api.php]
- Existing implementation references: [D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx; D:\DATN\danangtrip-admin\src\pages\Dashboard\components\StatsCards.tsx; D:\DATN\danangtrip-admin\src\pages\Dashboard\components\DashboardCharts.tsx; D:\DATN\danangtrip-admin\src\pages\Dashboard\components\RecentOrdersTable.tsx; D:\DATN\danangtrip-admin\src\pages\Dashboard\components\TopToursTable.tsx]
- API/context files to inspect: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\dashboardApi.ts; D:\DATN\danangtrip-admin\src\hooks\useDashboardQueries.ts; D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts; D:\DATN\danangtrip-admin\src\dataHelper\dashboard.mapper.ts]
- Main endpoints: [GET /admin/dashboard/stats; GET /admin/dashboard/booking-status-counts; GET /admin/dashboard/revenue; GET /admin/dashboard/booking-trend; GET /admin/dashboard/user-growth; GET /admin/dashboard/top-tours; GET /admin/dashboard/bookings]
- Contract note: [docs may call route `/admin/dashboard`, but repo reality is `/dashboard`; preserve repo route and record mismatch]
- Candidate follow-up note: [`admin_reports_ratings` is high-priority backlog after dashboard, not the current locked screen]
- Output prefix: [.agent/artifacts/<group>/YYYY-MM-DD__admin-dashboard__...md]

Execution:
- Start with `01-screen-analysis`.
- Before each step, read the matching `SKILL.md`.
- Use the dashboard doc as the main UX reference and adapt to the current implemented dashboard.
- During API-contract step, separate real metric fields from fallback/derived widget fields.
- Stop after each pipeline step for approval.
```

### Skill 01 - Screen Analysis

```text
Activate 01-screen-analysis

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Screen name: [Dashboard]
- Figma/Stitch: [NONE]
- Input source: [D:\DATN\DATN_Document\docs\page\admin_dashboard.md]
- Related sources: [D:\DATN\DATN_Document\docs\reference\list_page.md; D:\DATN\DATN_Document\docs\reference\travel_com_benchmark_flow.md; D:\DATN\DATN_Document\docs\reference\screen_gap_analysis.md]
- Prototype note: [Use screen doc and current Dashboard implementation as main references]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Output: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
```

### Skill 02 - Project Setup Audit

```text
Activate 02-project-setup

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Audit reason: [dashboard delivery artifact and existing implementation hardening]
- Output: [.agent/artifacts/audits/YYYY-MM-DD__admin-dashboard__project-audit.md]
```

### Skill 03 - Types And API Contract

```text
Activate 03-types-api-contract

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Relevant endpoints: [dashboard stats, booking-status-counts, revenue, booking-trend, user-growth, top-tours, bookings, bookings export]
- Existing API foundation: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\dashboardApi.ts]
- Existing types/mappers: [D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts; D:\DATN\danangtrip-admin\src\dataHelper\dashboard.mapper.ts]
- Contract check: [route mismatch `/admin/dashboard` docs vs `/dashboard` repo, API param support, fallback fields for pending ratings/new contacts]
- Output: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-dashboard__api-contract.md]
```

### Skill 04 - Layout And Routing

```text
Activate 04-layout-routing

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
- Target route path: [/dashboard]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Dashboard\index.tsx]
- Route files: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- New routes: [no unless repo reality changed]
- Menu impact: [preserve sidebar dashboard entry]
- Output: [.agent/artifacts/routing/YYYY-MM-DD__admin-dashboard__route-plan.md]
```

### Skill 05 - UI Components

```text
Activate 05-ui-components

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
- Components to focus on: [DashboardPage, StatsCards, DashboardCharts, RecentOrdersTable, TopToursTable, ReviewsTable, RecentActivities, widget empty/error states]
- Existing UI references: [D:\DATN\danangtrip-admin\src\pages\Dashboard\components\]
- Output: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-dashboard__ui-spec.md]
```

### Skill 06 - Data Integration

```text
Activate 06-data-integration

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- API contract: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-dashboard__api-contract.md]
- UI spec: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-dashboard__ui-spec.md]
- Queries: [stats, booking status counts, revenue, booking trend, user growth, top tours, recent bookings]
- Mutations: [bookings export if currently exposed by dashboard hooks]
- Invalidations: [dashboard query keys after booking/payment/refund changes already used by related modules]
- Output: [.agent/artifacts/integration/YYYY-MM-DD__admin-dashboard__data-integration.md]
```

### Skill 07 - Interactions

```text
Activate 07-interactions

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
- Data integration: [.agent/artifacts/integration/YYYY-MM-DD__admin-dashboard__data-integration.md]
- Main actions: [change period/filter, refresh dashboard, open booking rows, export bookings if supported, navigate to related modules]
- Forms present: [filters only]
- Output: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-dashboard__interaction-spec.md]
```

### Skill 08 - Auth And Permissions

```text
Activate 08-auth-permissions

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Route plan: [.agent/artifacts/routing/YYYY-MM-DD__admin-dashboard__route-plan.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-dashboard__interaction-spec.md]
- Feature type: [authenticated-only | role-based]
- Relevant roles: [admin]
- Output: [.agent/artifacts/auth/YYYY-MM-DD__admin-dashboard__auth-permissions-review.md]
```

### Skill 09 - Testing

```text
Activate 09-testing

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-dashboard__screen-analysis.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-dashboard__interaction-spec.md]
- Auth review: [.agent/artifacts/auth/YYYY-MM-DD__admin-dashboard__auth-permissions-review.md]
- Output: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-dashboard__test-report.md]
```

### Skill 10 - Optimization And Deploy

```text
Activate 10-optimization-deploy

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-dashboard]
- Test report: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-dashboard__test-report.md]
- Test verdict: [READY | READY WITH RISKS | NOT READY]
- Existing artifacts: [analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report]
- Output deploy: [.agent/artifacts/deploy/YYYY-MM-DD__admin-dashboard__deploy-report.md]
- Output review: [.agent/artifacts/review/YYYY-MM-DD__admin-dashboard__review.md]
```
## Files Commonly Read Before Most Tasks

- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `package.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `src/constants/endpoints.ts`
- `src/api/axiosClient.ts`
- `src/providers/index.tsx`
- `src/routes/`
- `src/api/dashboardApi.ts`
- `src/hooks/useDashboardQueries.ts`
- `src/dataHelper/dashboard.dataHelper.ts`
- `src/dataHelper/dashboard.mapper.ts`
- `src/pages/Dashboard/`

