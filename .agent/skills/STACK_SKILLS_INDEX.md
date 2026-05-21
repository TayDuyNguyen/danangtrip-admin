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

Date locked for this index: `2026-05-20`

### Single Chosen Screen Only

- Repo: `danangtrip-admin`
- Only screen to implement now: `Chi tiết Đơn hàng`
- Feature slug: `admin-bookings-detail`
- Main route: `/admin/bookings/:id`
- Main file: `src/pages/Bookings/BookingDetail/index.tsx`
- Rule: do not switch to payments detail, reports, users detail, or any other screen until this screen is finished through `10-optimization-deploy`.

### Candidate Screens Reviewed

| Candidate | Priority | Why it is relevant now | Why it is not the current first pick |
| --- | --- | --- | --- |
| `admin-bookings-detail` | High | API exists, list screen already exists, but detail is still missing as a real route/page. This is the clearest operational gap after booking and payment flow work. | Selected as the current first pick. |
| `admin-payments-detail` | High | API and docs exist, and payment list is already implemented. | Better after booking detail because booking becomes the primary operator entry point. |
| `admin-users-detail` | Medium | Useful for support context. | Less directly tied to the post-booking operations gap. |
| `admin-tour-schedule-list hardening` | Medium | Existing page may still benefit from improvements. | Lower priority than the missing booking-detail route. |
| `admin-promotions` | Low | Planned business feature. | API is still planned and does not beat order-operations visibility. |

### Selected Next Screen

- Screen: `Chi tiết Đơn hàng`
- Feature slug: `admin-bookings-detail`
- Main route: `/admin/bookings/:id`
- Main file: `src/pages/Bookings/BookingDetail/index.tsx`
- Decision basis:
  - The booking and payment funnel is now much more complete, so operator visibility into each order is the next highest-value gap.
  - The repo already has booking list UI, badges, dialogs, and API foundations that can be reused into a dedicated detail page.
  - The API has real `GET /admin/bookings/{id}` and `PATCH /admin/bookings/{id}/status`, while planned passengers and timeline endpoints can be recorded as gaps instead of blocking the screen.

### Known Detail Gaps To Close

- No real route/page yet; only list dialog exists
- Need reusable booking summary, status history, and action panels
- Need clear handling for planned passengers or timeline endpoints that may not exist yet
- Need explicit status-action mapping for confirm, cancel, and complete flows
- Need invoice/open-linked-user handling based on real route availability

### Cross-Project Rollout Order

1. `danangtrip-admin` implements `admin-bookings-detail`
2. `danangtrip-web` implements `user-bookings-list`
3. `danangtrip-web` then implements `user-booking-detail`

Dependency rule:
- This admin screen is the current system-first implementation target because it defines the operational view of booking status changes that web bookings history must reflect.

## Recommended Current Screen Prompt

Use this ready prompt for the next recommended `danangtrip-admin` screen: booking detail operations.

```text
SYSTEM EXECUTION CONTRACT

Act as the execution agent for repository: `D:\DATN\danangtrip-admin`

Your job is to implement the recommended admin screen: `Chi tiết Đơn hàng`
Feature slug: `admin-bookings-detail`
Primary target route: `/admin/bookings/:id`
Primary React Router file target: `src/pages/Bookings/BookingDetail/index.tsx`
Related files: `src/pages/Bookings/BookingList/index.tsx`, `src/pages/Payments/PaymentList/index.tsx`
Feature type: authenticated admin/staff operations screen for viewing a booking in depth and performing status actions safely.

SINGLE-SCREEN LOCK
- You are working on exactly one screen only: `Chi tiết Đơn hàng`.
- You MUST NOT switch to payments detail, promotions, reports, settings, or any unrelated admin screen in this run.
- If you discover an adjacent issue in list or payment flows, record it as dependency or follow-up and continue only with the booking-detail scope.

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
- Primary detail doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_detail.md`
- Related list doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_list.md`
- Related payment doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_payments_detail.md`
- Admin page list: `D:\DATN\DATN_Tài liệu\docs\reference\list_page.md`
- Flow priority note: `D:\DATN\DATN_Tài liệu\docs\reference\travel_com_benchmark_flow.md`
- Gap analysis: `D:\DATN\DATN_Tài liệu\docs\reference\screen_gap_analysis.md`
- API list: `D:\DATN\DATN_Tài liệu\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend API repo: `D:\DATN\danangtrip-api`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend booking docs: `D:\DATN\danangtrip-api\api-doc\bookings.js`
- Backend payment docs: `D:\DATN\danangtrip-api\api-doc\payments.js`
- Backend schema note: `D:\DATN\danangtrip-api\SCHEMA_CURRENT_ANNOTATED.md`

SKILL PATHS
- `01-screen-analysis`: `D:\DATN\danangtrip-admin\.agent\skills\01-screen-analysis\SKILL.md`
- `02-project-setup`: `D:\DATN\danangtrip-admin\.agent\skills\02-project-setup\SKILL.md`
- `03-types-api-contract`: `D:\DATN\danangtrip-admin\.agent\skills\03-types-api-contract\SKILL.md`
- `04-layout-routing`: `D:\DATN\danangtrip-admin\.agent\skills\04-layout-routing\SKILL.md`
- `05-ui-components`: `D:\DATN\danangtrip-admin\.agent\skills\05-ui-components\SKILL.md`
- `06-data-integration`: `D:\DATN\danangtrip-admin\.agent\skills\06-data-integration\SKILL.md`
- `07-interactions`: `D:\DATN\danangtrip-admin\.agent\skills\07-interactions\SKILL.md`
- `08-auth-permissions`: `D:\DATN\danangtrip-admin\.agent\skills\08-auth-permissions\SKILL.md`
- `09-testing`: `D:\DATN\danangtrip-admin\.agent\skills\09-testing\SKILL.md`
- `10-optimization-deploy`: `D:\DATN\danangtrip-admin\.agent\skills\10-optimization-deploy\SKILL.md`

PROTOTYPE REFERENCES
- Prototype mapping: `D:\DATN\DATN_Tài liệu\screen\4_Others\01-Screen_To_Docs_Mapping.md`
- Prototype classification: `D:\DATN\DATN_Tài liệu\screen\4_Others\00-Bang_Phan_Loai_Man_Hinh.md`
- Schedule edit image: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.7-Chinh_Sua_Lich_Khoi_Hanh.png`
- Schedule edit HTML/code: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.7-Chinh_Sua_Lich_Khoi_Hanh.html`
- Related schedule create image: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.6-Them_Lich_Khoi_Hanh.png`
- Related schedule create HTML/code: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.6-Them_Lich_Khoi_Hanh.html`
- Related schedule list image: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.5-Lich_Khoi_Hanh.png`
- Related schedule list HTML/code: `D:\DATN\DATN_Tài liệu\screen\3_Admin_Flows\09.5-Lich_Khoi_Hanh.html`

PROTOTYPE USAGE RULES
- Treat the `.png` files as the visual reference and the `.html` files as implementation reference only.
- Adapt prototype markup to this repo's React Router, Vite, Tailwind v4, component, i18n, and API patterns.
- Prefer `09.7-Chinh_Sua_Lich_Khoi_Hanh` as the primary reference for the target screen.
- Use `09.6-Them_Lich_Khoi_Hanh` and `09.5-Lich_Khoi_Hanh` only to preserve create-flow parity and list navigation context.
- Reuse current edit and create form code where possible instead of rebuilding the whole flow.
- Do not copy external image URLs blindly from prototype HTML if local/public assets or API images are available.

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- `D:\DATN\danangtrip-admin\src\api\scheduleApi.ts`
- `D:\DATN\danangtrip-admin\src\api\tourApi.ts`
- `D:\DATN\danangtrip-admin\src\types\schedule.ts`
- `D:\DATN\danangtrip-admin\src\validations\schedule.schema.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useScheduleQueries.ts`
- `D:\DATN\danangtrip-admin\src\hooks\useTourQueries.ts`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourSchedules\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourScheduleCreate\components\ScheduleForm.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourScheduleEdit\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourSchedules\components\StatsSummary.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourSchedules\components\ScheduleDeleteDialog.tsx`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`

REQUIRED API FLOW
- Load the existing schedule detail and related tour context from the current admin API contracts.
- Edit schedule: use the existing admin update schedule endpoint and contract from `scheduleApi`.
- Preserve compatibility with existing create flow; reuse its shape as the comparison baseline instead of redesigning both screens together.
- Standardize and expose the operational fields called out in the benchmark docs: `departure_code`, `departure_place`, `booking_deadline`, status, capacity, sold or remaining seats, and price overrides when applicable.
- Cross-check actual payload keys against the current repo types because the UI already uses `startDate`, `endDate`, `totalSlots`, and `bookedSlots`; preserve repo reality and record any server-client naming mismatch in the artifact.

EXPECTED UX
- The edit screen must support existing schedule context, core schedule dates, booking deadline, departure place, departure code, capacity, booked or remaining seat visibility, adult-child-infant pricing, status, validation, submit success, submit failure, delete or deactivate flow if supported by repo reality, unsaved-change protection, and clear back navigation to the schedules list.
- Pull in missing operational context blocks from the docs and related list screen where helpful, especially stats/info blocks and destructive-action affordances.
- Use the existing admin visual language from `TourSchedules`, `TourScheduleEdit`, `TourScheduleCreate`, and `TourCreate`.
- Keep the routes protected by the existing `PrivateRoute`.
- Add or update i18n keys if the touched UI text is translated in this repo.
- Preserve compatibility with the downstream web booking funnel, especially the fields used for availability and booking calculations.

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
- Analysis: `.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md`
- API contract: `.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-detail__api-contract.md`
- Routing: `.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-detail__route-plan.md`
- UI spec: `.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-detail__ui-spec.md`
- Data integration: `.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-detail__data-integration.md`
- Interaction spec: `.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-detail__interaction-spec.md`
- Auth review: `.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-detail__auth-permissions-review.md`
- Test report: `.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-detail__test-report.md`
- Deploy report: `.agent/artifacts/deploy/YYYY-MM-DD__admin-bookings-detail__deploy-report.md`
- Final review: `.agent/artifacts/review/YYYY-MM-DD__admin-bookings-detail__review.md`

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
- Screen: `Chi tiết Đơn hàng`
- Feature slug: `admin-bookings-detail`
- Main route: `/admin/bookings/:id`
- Main file target: `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingDetail\index.tsx`
- System role: this is the first implementation target before `danangtrip-web` finalizes user bookings history

SCOPE LOCK

- Only build `Chi tiết Đơn hàng`.
- Do not expand scope into payments detail, users detail, reports, promotions, or settings.
- If another screen is needed, write it down as the next recommendation instead of implementing it now.

GOAL

Stabilize the booking-detail flow so operators can:
1. load current booking data safely
2. inspect customer, tour, schedule, and payment context in one place
3. review booking status and payment status clearly
4. perform confirm, cancel, or complete actions with the real API contract
5. degrade safely when planned passengers or timeline endpoints are not available
6. navigate back to list and related entities without losing operational context

MANDATORY READ ORDER

1. `D:\DATN\DATN_Tài liệu\docs\reference\travel_com_benchmark_flow.md`
2. `D:\DATN\DATN_Tài liệu\docs\reference\screen_gap_analysis.md`
3. `D:\DATN\DATN_Tài liệu\docs\reference\list_page.md`
4. `D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_detail.md`
5. `D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_list.md`
6. `D:\DATN\DATN_Tài liệu\docs\page\admin_payments_detail.md`
7. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
8. `D:\DATN\danangtrip-admin\src\routes\routes.ts`
9. `D:\DATN\danangtrip-admin\src\api\bookingApi.ts`
10. `D:\DATN\danangtrip-admin\src\types\booking.ts`
11. `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\index.tsx`
12. `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingDetailDialog.tsx`
13. `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingTimeline.tsx`
14. `D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingCancelDialog.tsx`
15. `D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\components\RefundPaymentDialog.tsx`

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
- If route naming differs between docs and repo, preserve repo reality and record the route mismatch explicitly in the routing artifact.

SUCCESS CRITERIA

- The detail page exposes the operational fields needed by booking support and status management.
- The UI clearly shows customer, tour, schedule, and payment context.
- The action buttons use the real admin status API.
- Planned passenger or timeline sections are either implemented from real APIs or clearly marked as unavailable by repo reality.
- Artifacts and memory files are updated for every completed step.

BEGIN

Start with `01-screen-analysis`.
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

## Manual Activation Templates

The examples below are fallback templates.
Dates and slugs are examples only; replace them with the current task values.

### Current Recommended Screen - Admin Bookings Detail

Use this prompt when manually activating the local skill pipeline for the recommended admin screen.

```text
Activate full pipeline for current recommended screen

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Screen name: [Chi tiết Đơn hàng]
- Primary target route: [/admin/bookings/:id]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingDetail\index.tsx]
- Related files: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\index.tsx; D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\index.tsx]
- Route registration: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- Auth requirement: [Admin or staff; protected by existing PrivateRoute]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- Primary doc: [D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_detail.md]
- Related docs: [D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_list.md; D:\DATN\DATN_Tài liệu\docs\page\admin_payments_detail.md; D:\DATN\DATN_Tài liệu\docs\reference\travel_com_benchmark_flow.md; D:\DATN\DATN_Tài liệu\docs\reference\screen_gap_analysis.md]
- API docs: [D:\DATN\DATN_Tài liệu\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Backend API repo: [D:\DATN\danangtrip-api]
- Backend routes: [D:\DATN\danangtrip-api\routes\api.php]
- Backend booking docs: [D:\DATN\danangtrip-api\api-doc\bookings.js]
- Backend payment docs: [D:\DATN\danangtrip-api\api-doc\payments.js]
- Backend schema note: [D:\DATN\danangtrip-api\SCHEMA_CURRENT_ANNOTATED.md]
- Prototype mapping: [D:\DATN\DATN_Tài liệu\screen\4_Others\01-Screen_To_Docs_Mapping.md]
- Prototype classification: [D:\DATN\DATN_Tài liệu\screen\4_Others\00-Bang_Phan_Loai_Man_Hinh.md]
- Primary prototype image: [Use doc-driven layout if a dedicated image is missing in repo reality]
- Existing implementation references: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\index.tsx; D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingDetailDialog.tsx; D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingTimeline.tsx; D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\components\RefundPaymentDialog.tsx]
- API/context files to inspect: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\bookingApi.ts; D:\DATN\danangtrip-admin\src\types\booking.ts; D:\DATN\danangtrip-admin\src\hooks\useBookingQueries.ts]
- Main fields to standardize: [booking_status; payment_status; booking_code; booked_at; customer info; schedule info; totals]
- Contract note: [passengers and timeline are documented but may still be planned; confirm real route support before implementing those sections]
- Compatibility note: [this screen should align operator-visible status semantics with the user bookings history screen]
- Detail-gap note: [priority gaps are real route/page creation, action sidebar, status timeline, and handling of planned sub-sections]
- Skill paths: [D:\DATN\danangtrip-admin\.agent\skills\01-screen-analysis\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\03-types-api-contract\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\04-layout-routing\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\05-ui-components\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\06-data-integration\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\07-interactions\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\08-auth-permissions\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\09-testing\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\10-optimization-deploy\SKILL.md]
- Output prefix: [.agent/artifacts/<group>/YYYY-MM-DD__admin-bookings-detail__...md]

Execution:
- Start with `01-screen-analysis`.
- Before each step, read the matching `SKILL.md` from `Skill paths`.
- Use the booking-detail doc as the main UX reference and adapt it to repo layout patterns; do not paste prototype HTML directly.
- During API-contract step, separate real endpoints from planned endpoints and record the gap explicitly.
- Reuse the existing booking list dialog and status components where possible, but prioritize creating a real route/page.
- Stop after each pipeline step for approval.
```

### Skill 01 - Screen Analysis

```text
Activate 01-screen-analysis

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Screen name: [Chi tiết Đơn hàng]
- Figma/Stitch: [NONE]
- Input source: [D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_detail.md]
- Related sources: [D:\DATN\DATN_Tài liệu\docs\page\admin_bookings_list.md; D:\DATN\DATN_Tài liệu\docs\page\admin_payments_detail.md; D:\DATN\DATN_Tài liệu\docs\reference\travel_com_benchmark_flow.md]
- Prototype note: [Use screen doc and current booking list dialog as main references]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- API docs: [D:\DATN\DATN_Tài liệu\docs\api\api_list.md]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\01-screen-analysis\SKILL.md]
- Output: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
```

Expected output:

- design token audit against `DESIGN.md`
- `[REUSE]`, `[NEW]`, `[MOD]` component breakdown
- per-section UI states
- data and API mapping
- business rules and edge cases

### Skill 02 - Project Setup Audit

```text
Activate 02-project-setup

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [project-base | tour-list]
- Audit reason: [new sprint | stack drift suspicion | onboarding]
- Output: [.agent/artifacts/audits/YYYY-MM-DD__project-base__project-audit.md]
```

Expected output:

- ready or not-ready verdict
- dependency, config, auth bootstrap, HTTP, and scripts checks

### Skill 03 - Types And API Contract

```text
Activate 03-types-api-contract

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
- API docs: [D:\DATN\DATN_Tài liệu\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Relevant endpoints: [GET /admin/bookings/{id}, PATCH /admin/bookings/{id}/status, GET /user/bookings/{id}/invoice]
- Existing API foundation: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\bookingApi.ts; D:\DATN\danangtrip-admin\src\api\paymentApi.ts]
- Existing types/validation: [D:\DATN\danangtrip-admin\src\types\api.ts; create or extend booking view-models in repo reality]
- Standardization focus: [booking_status, payment_status, booking_code, amount fields, customer block, route params]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\03-types-api-contract\SKILL.md]
- Output: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-detail__api-contract.md]
```

Expected output:

- raw types and view models
- validation schema plan
- API module plan
- mapper plan
- files expected to change

### Skill 04 - Layout And Routing

```text
Activate 04-layout-routing

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
- Target route path: [/admin/bookings/:id]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingDetail\index.tsx]
- Route files: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- New routes: [yes]
- Menu impact: [preserve booking-list navigation and breadcrumb path]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\04-layout-routing\SKILL.md]
- Output: [.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-detail__route-plan.md]
```

Expected output:

- route registration plan
- page skeleton files
- breadcrumb and menu impact
- i18n key impact

### Skill 05 - UI Components

```text
Activate 05-ui-components

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
- Components to focus on: [BookingDetailPageShell, BookingHeader, BookingInfoCard, CustomerInfoCard, TourBookingCard, BookingActionsSidebar, BookingStatusTimeline]
- Existing UI references: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingDetailDialog.tsx; D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\components\BookingTimeline.tsx; D:\DATN\danangtrip-admin\src\pages\Payments\PaymentList\components\RefundPaymentDialog.tsx]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\05-ui-components\SKILL.md]
- Output: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-detail__ui-spec.md]
```

Expected output:

- `[REUSE]`, `[NEW]`, `[MOD]` breakdown
- component layering
- per-component states
- placement strategy
- build order

### Skill 06 - Data Integration

```text
Activate 06-data-integration

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- API contract: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-detail__api-contract.md]
- UI spec: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-detail__ui-spec.md]
- Queries: [booking detail]
- Mutations: [update booking status]
- Invalidations: [bookings list and affected booking detail]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\06-data-integration\SKILL.md]
- Output: [.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-detail__data-integration.md]
```

Expected output:

- query key hierarchy
- stale time assumptions
- invalidation strategy
- per-section UI state handling

### Skill 07 - Interactions

```text
Activate 07-interactions

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
- Data integration: [.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-detail__data-integration.md]
- Main actions: [load booking, confirm, cancel, complete, open invoice, navigate to related user or list]
- Destructive actions: [cancel booking]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\07-interactions\SKILL.md]
- Output: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-detail__interaction-spec.md]
```

Expected output:

- action breakdown
- form flow
- URL or local state ownership
- confirm dialog behavior
- i18n keys to add

### Skill 08 - Auth And Permissions

```text
Activate 08-auth-permissions

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Route plan: [.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-detail__route-plan.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-detail__interaction-spec.md]
- Feature type: [authenticated-only | role-based]
- Relevant roles: [admin, staff]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\08-auth-permissions\SKILL.md]
- Output: [.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-detail__auth-permissions-review.md]
```

Expected output:

- protected route review
- permission matrix
- guarded UI actions
- redirect behavior
- risks and assumptions

### Skill 09 - Testing

```text
Activate 09-testing

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-detail__screen-analysis.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-detail__interaction-spec.md]
- Auth review: [.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-detail__auth-permissions-review.md]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\09-testing\SKILL.md]
- Output: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-detail__test-report.md]
```

Expected output:

- lint, typecheck, build, and prepush checks
- UI visual validation
- interaction validation
- i18n validation
- role and permission validation
- explicit PASS, FAIL, SKIPPED evidence

### Skill 10 - Optimization And Deploy

```text
Activate 10-optimization-deploy

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-detail]
- Test report: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-detail__test-report.md]
- Test verdict: [READY | READY WITH RISKS | NOT READY]
- Existing artifacts: [analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\10-optimization-deploy\SKILL.md]
- Output deploy: [.agent/artifacts/deploy/YYYY-MM-DD__admin-bookings-detail__deploy-report.md]
- Output review: [.agent/artifacts/review/YYYY-MM-DD__admin-bookings-detail__review.md]
```

Expected output:

- deploy-readiness verdict
- build and runtime constraints
- quality gate summary
- final review summary
- residual risks and next actions

