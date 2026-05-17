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

## Recommended Current Screen Prompt

Use this ready prompt for the next recommended `danangtrip-admin` screen: booking management list.

```text
SYSTEM EXECUTION CONTRACT

Act as the execution agent for repository: `D:\DATN\danangtrip-admin`

Your job is to implement the recommended admin screen: `Danh sách Đơn hàng`
Feature slug: `admin-bookings-list`
Target route: `/admin/bookings`
React Router file target: `src/pages/Bookings/BookingList/index.tsx`
Route registration target: `src/routes/routes.ts` and `src/routes/index.tsx`
Sidebar target: `src/components/common/Sidebar.tsx`
Feature type: authenticated admin/staff operations screen.

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
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_bookings_list.md`
- Related detail doc: `D:\DATN\DATN_Document\docs\page\admin_bookings_detail.md`
- Admin page list: `D:\DATN\DATN_Document\docs\reference\list_page.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`

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
- Prototype mapping: `D:\DATN\DATN_Document\screen\4_Others\01-Screen_To_Docs_Mapping.md`
- Prototype classification: `D:\DATN\DATN_Document\screen\4_Others\00-Bang_Phan_Loai_Man_Hinh.md`
- Booking list image: `D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.png`
- Booking list HTML/code: `D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.html`
- Booking detail image: `D:\DATN\DATN_Document\screen\3_Admin_Flows\10.1-Chi_Tiet_Don_Hang.png`
- Booking detail HTML/code: `D:\DATN\DATN_Document\screen\3_Admin_Flows\10.1-Chi_Tiet_Don_Hang.html`
- Payment list image: `D:\DATN\DATN_Document\screen\3_Admin_Flows\06-Danh_Sach_Giao_Dich.png`
- Payment list HTML/code: `D:\DATN\DATN_Document\screen\3_Admin_Flows\06-Danh_Sach_Giao_Dich.html`
- Payment detail image: `D:\DATN\DATN_Document\screen\3_Admin_Flows\06.1-Chi_Tiet_Giao_Dich.png`
- Payment detail HTML/code: `D:\DATN\DATN_Document\screen\3_Admin_Flows\06.1-Chi_Tiet_Giao_Dich.html`
- Related dashboard image: `D:\DATN\DATN_Document\screen\3_Admin_Flows\01-Admin_Dashboard.png`
- Related dashboard HTML/code: `D:\DATN\DATN_Document\screen\3_Admin_Flows\01-Admin_Dashboard.html`

PROTOTYPE USAGE RULES
- Treat the `.png` files as the visual reference and the `.html` files as implementation reference only.
- Adapt prototype markup to this repo's React Router, Vite, Tailwind v4, component, i18n, and API patterns.
- If `screen\4_Others\01-Screen_To_Docs_Mapping.md` mentions `3_Admin_Flows/10.1`, use the actual current list files `3_Admin_Flows/10-Danh_Sach_Don_Hang.html` and `3_Admin_Flows/10-Danh_Sach_Don_Hang.png` for the list screen.
- Do not copy external image URLs blindly from prototype HTML if local/public assets or API images are available.

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- `D:\DATN\danangtrip-admin\src\api\axiosClient.ts`
- `D:\DATN\danangtrip-admin\src\providers\index.tsx`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\components\common\Sidebar.tsx`
- `D:\DATN\danangtrip-admin\src\components\ui\Button.tsx`
- `D:\DATN\danangtrip-admin\src\components\ui\CustomSelect.tsx`
- `D:\DATN\danangtrip-admin\src\components\pagination\DetailedPagination.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Tours\TourList\index.tsx`
- `D:\DATN\danangtrip-admin\src\pages\Locations\LocationList\index.tsx`
- `D:\DATN\danangtrip-admin\src\hooks\useDashboardQueries.ts`
- `D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts`
- `D:\DATN\danangtrip-admin\src\utils\spreadsheetExport.ts`

REQUIRED API FLOW
- Load list: `GET /admin/bookings?page=&per_page=&sort=&order=&search=&status=&payment_status=&date_from=&date_to=`.
- Export current filter: `GET /admin/bookings/export`.
- Update status: `PATCH /admin/bookings/{id}/status` with `booking_status=confirmed` or `booking_status=cancelled`.
- For cancellation, support optional `cancellation_reason`.
- Use TanStack Query patterns already present in admin hooks and invalidate list/stat data after mutations.

EXPECTED UX
- Booking list must support stats row, search debounce, booking status filter, payment status filter, date range filter, active filter tags, table, row selection, bulk confirm/cancel loop, export, pagination, empty state, loading state, error state, and cancel confirmation dialog.
- Use existing admin visual language from dashboard, tour list, and location list.
- Sidebar should expose the route under an order/payment management entry. Keep route protected by existing `PrivateRoute`.
- Add or update i18n keys if this repo uses keys for the touched menu/page text.

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
- Analysis: `.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md`
- API contract: `.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-list__api-contract.md`
- Routing: `.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-list__route-plan.md`
- UI spec: `.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-list__ui-spec.md`
- Data integration: `.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-list__data-integration.md`
- Interaction spec: `.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-list__interaction-spec.md`
- Auth review: `.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-list__auth-permissions-review.md`
- Test report: `.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-list__test-report.md`
- Deploy report: `.agent/artifacts/deploy/YYYY-MM-DD__admin-bookings-list__deploy-report.md`
- Final review: `.agent/artifacts/review/YYYY-MM-DD__admin-bookings-list__review.md`

BEGIN NOW
Start with step `01-screen-analysis`.
Do not implement code for later steps until the current step is approved.
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

### Current Recommended Screen - Admin Bookings List

Use this prompt when manually activating the local skill pipeline for the recommended admin screen.

```text
Activate full pipeline for current recommended screen

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-list]
- Screen name: [Danh sách Đơn hàng]
- Target route: [/admin/bookings]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\index.tsx]
- Route registration: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- Sidebar file: [D:\DATN\danangtrip-admin\src\components\common\Sidebar.tsx]
- Auth requirement: [Admin or staff; protected by existing PrivateRoute]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- Primary docs: [D:\DATN\DATN_Document\docs\page\admin_bookings_list.md]
- Related docs: [D:\DATN\DATN_Document\docs\page\admin_bookings_detail.md; D:\DATN\DATN_Document\docs\reference\list_page.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Prototype mapping: [D:\DATN\DATN_Document\screen\4_Others\01-Screen_To_Docs_Mapping.md]
- Prototype classification: [D:\DATN\DATN_Document\screen\4_Others\00-Bang_Phan_Loai_Man_Hinh.md]
- Prototype image: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.png]
- Prototype HTML/code: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.html]
- Related detail prototype: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10.1-Chi_Tiet_Don_Hang.html]
- Related payment prototype: [D:\DATN\DATN_Document\screen\3_Admin_Flows\06-Danh_Sach_Giao_Dich.html; D:\DATN\DATN_Document\screen\3_Admin_Flows\06.1-Chi_Tiet_Giao_Dich.html]
- Existing list references: [D:\DATN\danangtrip-admin\src\pages\Tours\TourList\index.tsx; D:\DATN\danangtrip-admin\src\pages\Locations\LocationList\index.tsx]
- API/context files to inspect: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\axiosClient.ts; D:\DATN\danangtrip-admin\src\hooks\useDashboardQueries.ts; D:\DATN\danangtrip-admin\src\dataHelper\dashboard.dataHelper.ts]
- Main endpoints: [GET /admin/bookings; GET /admin/bookings/export; PATCH /admin/bookings/{id}/status]
- Skill paths: [D:\DATN\danangtrip-admin\.agent\skills\01-screen-analysis\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\03-types-api-contract\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\04-layout-routing\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\05-ui-components\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\06-data-integration\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\07-interactions\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\08-auth-permissions\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\09-testing\SKILL.md; D:\DATN\danangtrip-admin\.agent\skills\10-optimization-deploy\SKILL.md]
- Output prefix: [.agent/artifacts/<group>/YYYY-MM-DD__admin-bookings-list__...md]

Execution:
- Start with `01-screen-analysis`.
- Before each step, read the matching `SKILL.md` from `Skill paths`.
- Read `.png` as the visual source and `.html` as implementation reference.
- Adapt prototype code to repo patterns; do not paste prototype HTML directly.
- Stop after each pipeline step for approval.
```

### Skill 01 - Screen Analysis

```text
Activate 01-screen-analysis

Context:
- Repo: [D:\DATN\danangtrip-admin]
- Feature slug: [admin-bookings-list]
- Screen name: [Danh sách Đơn hàng]
- Figma/Stitch: [NONE]
- Input source: [D:\DATN\DATN_Document\docs\page\admin_bookings_list.md]
- Prototype image: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.png]
- Prototype HTML/code: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.html]
- DESIGN.md: [D:\DATN\danangtrip-admin\DESIGN.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\01-screen-analysis\SKILL.md]
- Output: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
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
- Feature slug: [admin-bookings-list]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
- API docs: [D:\DATN\DATN_Document\docs\api\api_list.md]
- Endpoint matrix: [D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md]
- Relevant endpoints: [GET /admin/bookings, GET /admin/bookings/export, PATCH /admin/bookings/{id}/status]
- Existing API foundation: [D:\DATN\danangtrip-admin\src\constants\endpoints.ts; D:\DATN\danangtrip-admin\src\api\axiosClient.ts]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\03-types-api-contract\SKILL.md]
- Output: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-list__api-contract.md]
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
- Feature slug: [admin-bookings-list]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
- Target route path: [/admin/bookings]
- Target page file: [D:\DATN\danangtrip-admin\src\pages\Bookings\BookingList\index.tsx]
- Route files: [D:\DATN\danangtrip-admin\src\routes\routes.ts; D:\DATN\danangtrip-admin\src\routes\index.tsx]
- New routes: [yes]
- New menu item: [yes, update Sidebar order/payment entry]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\04-layout-routing\SKILL.md]
- Output: [.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-list__route-plan.md]
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
- Feature slug: [admin-bookings-list]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
- Prototype image: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.png]
- Prototype HTML/code: [D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.html]
- Components to focus on: [BookingStatsRow, BookingFilterBar, BookingTable, BookingStatusBadge, PaymentStatusBadge, CancelBookingDialog]
- Existing UI references: [D:\DATN\danangtrip-admin\src\pages\Tours\TourList\index.tsx; D:\DATN\danangtrip-admin\src\pages\Locations\LocationList\index.tsx]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\05-ui-components\SKILL.md]
- Output: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-list__ui-spec.md]
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
- Feature slug: [admin-bookings-list]
- API contract: [.agent/artifacts/api-contracts/YYYY-MM-DD__admin-bookings-list__api-contract.md]
- UI spec: [.agent/artifacts/ui-specs/YYYY-MM-DD__admin-bookings-list__ui-spec.md]
- Queries: [useAdminBookingsList, optional useAdminBookingStatusCounts if endpoint exists]
- Mutations: [useUpdateBookingStatus, useExportBookings]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\06-data-integration\SKILL.md]
- Output: [.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-list__data-integration.md]
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
- Feature slug: [admin-bookings-list]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
- Data integration: [.agent/artifacts/integration/YYYY-MM-DD__admin-bookings-list__data-integration.md]
- Main actions: [search, booking status filter, payment status filter, date range filter, pagination, row select, bulk confirm, bulk cancel, export, navigate detail]
- Destructive actions: [cancel booking, bulk cancel bookings]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\07-interactions\SKILL.md]
- Output: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-list__interaction-spec.md]
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
- Feature slug: [admin-bookings-list]
- Route plan: [.agent/artifacts/routing/YYYY-MM-DD__admin-bookings-list__route-plan.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-list__interaction-spec.md]
- Feature type: [authenticated-only | role-based]
- Relevant roles: [admin, staff]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\08-auth-permissions\SKILL.md]
- Output: [.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-list__auth-permissions-review.md]
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
- Feature slug: [admin-bookings-list]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__admin-bookings-list__screen-analysis.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__admin-bookings-list__interaction-spec.md]
- Auth review: [.agent/artifacts/auth/YYYY-MM-DD__admin-bookings-list__auth-permissions-review.md]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\09-testing\SKILL.md]
- Output: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-list__test-report.md]
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
- Feature slug: [admin-bookings-list]
- Test report: [.agent/artifacts/test-cases/YYYY-MM-DD__admin-bookings-list__test-report.md]
- Test verdict: [READY | READY WITH RISKS | NOT READY]
- Existing artifacts: [analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report]
- Skill path: [D:\DATN\danangtrip-admin\.agent\skills\10-optimization-deploy\SKILL.md]
- Output deploy: [.agent/artifacts/deploy/YYYY-MM-DD__admin-bookings-list__deploy-report.md]
- Output review: [.agent/artifacts/review/YYYY-MM-DD__admin-bookings-list__review.md]
```

Expected output:

- deploy-readiness verdict
- build and runtime constraints
- quality gate summary
- final review summary
- residual risks and next actions
