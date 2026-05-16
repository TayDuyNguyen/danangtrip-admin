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

Before non-trivial work, read in this order:

1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. `.agent/memory/WORKING_STATE.md`
4. `.agent/memory/HANDOFF.md`
5. Relevant recent files in `.agent/memory/decisions/` and `.agent/artifacts/`
6. Real repo sources: `package.json`, `src/`, `vite.config.ts`, `tsconfig.app.json`
7. The specific `SKILL.md` that matches the task

If these sources conflict, follow the earlier item in the list.

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
- You MUST update `.agent/memory/WORKING_STATE.md` when the active task state changes.
- You MUST update `.agent/memory/HANDOFF.md` if work is paused or blocked.
- You MUST create or update the required artifact for each step under `.agent/artifacts/`.
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
1. Read the step's `SKILL.md`
2. Restate the goal of the step in repository terms
3. List required inputs for that step
4. Perform only that step
5. Produce or update the step artifact
6. Report exactly what was done
7. Report what is still unknown or risky
8. STOP for approval

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

**Tài liệu tham chiếu cho mỗi màn hình:**
- Page doc: `d:/DATN/DATN_Tài liệu/docs/page/<admin_xxx>.md`
- Screen HTML: `d:/DATN/DATN_Tài liệu/screen/3_Admin_Flows/<xx-Ten_Man>.html`
- Screen PNG: `d:/DATN/DATN_Tài liệu/screen/3_Admin_Flows/<xx-Ten_Man>.png`
- API docs: `d:/DATN/DATN_Tài liệu/docs/api/api_list.md`

### Skill 01 - Screen Analysis

```text
Activate 01-screen-analysis [.agent/skills/01-screen-analysis/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Screen name: [Chi tiết Tour]
- Page doc: [d:/DATN/DATN_Tài liệu/docs/page/admin_tours_detail.md]
- Screen prototype: [d:/DATN/DATN_Tài liệu/screen/3_Admin_Flows/09.4-Chi_Tiet_Tour.html]
- Screen screenshot: [d:/DATN/DATN_Tài liệu/screen/3_Admin_Flows/09.4-Chi_Tiet_Tour.png]
- DESIGN.md: [d:/DATN/danangtrip-admin/DESIGN.md]
- API docs: [d:/DATN/DATN_Tài liệu/docs/api/api_list.md]
- Output: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
```

Expected output:

- design token audit against `DESIGN.md`
- `[REUSE]`, `[NEW]`, `[MOD]` component breakdown
- per-section UI states
- data and API mapping
- business rules and edge cases

### Skill 02 - Project Setup Audit

```text
Activate 02-project-setup [.agent/skills/02-project-setup/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Audit reason: [new sprint | stack drift suspicion | onboarding]
- Output: [.agent/artifacts/audits/YYYY-MM-DD__tour-detail__project-audit.md]
```

Expected output:

- ready or not-ready verdict
- dependency, config, auth bootstrap, HTTP, and scripts checks

### Skill 03 - Types And API Contract

```text
Activate 03-types-api-contract [.agent/skills/03-types-api-contract/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
- Page doc: [d:/DATN/DATN_Tài liệu/docs/page/admin_tours_detail.md]
- API docs: [d:/DATN/DATN_Tài liệu/docs/api/api_list.md]
- Relevant endpoints: [GET /admin/tours/:id, PATCH /admin/tours/:id/status, DELETE /admin/tours/:id]
- Output: [.agent/artifacts/api-contracts/YYYY-MM-DD__tour-detail__api-contract.md]
```

Expected output:

- raw types and view models
- validation schema plan
- API module plan
- mapper plan
- files expected to change

### Skill 04 - Layout And Routing

```text
Activate 04-layout-routing [.agent/skills/04-layout-routing/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
- Target route path: [/admin/tours/:id]
- New routes: [yes | no]
- New menu item: [no]
- Output: [.agent/artifacts/routing/YYYY-MM-DD__tour-detail__route-plan.md]
```

Expected output:

- route registration plan
- page skeleton files
- breadcrumb and menu impact
- i18n key impact

### Skill 05 - UI Components

```text
Activate 05-ui-components [.agent/skills/05-ui-components/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
- Screen prototype: [d:/DATN/DATN_Tài liệu/screen/3_Admin_Flows/09.4-Chi_Tiet_Tour.html]
- Components to focus on: [TourDetailHeader, TourInfoSection, TourScheduleTable, TourGallery | NONE]
- Output: [.agent/artifacts/ui-specs/YYYY-MM-DD__tour-detail__ui-spec.md]
```

Expected output:

- `[REUSE]`, `[NEW]`, `[MOD]` breakdown
- component layering
- per-component states
- placement strategy
- build order

### Skill 06 - Data Integration

```text
Activate 06-data-integration [.agent/skills/06-data-integration/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- API contract: [.agent/artifacts/api-contracts/YYYY-MM-DD__tour-detail__api-contract.md]
- UI spec: [.agent/artifacts/ui-specs/YYYY-MM-DD__tour-detail__ui-spec.md]
- Queries: [useTourDetail, useTourSchedules, useTourImages]
- Mutations: [useToggleTourStatus, useDeleteTour, useToggleFeatured]
- Output: [.agent/artifacts/integration/YYYY-MM-DD__tour-detail__data-integration.md]
```

Expected output:

- query key hierarchy
- stale time assumptions
- invalidation strategy
- per-section UI state handling

### Skill 07 - Interactions

```text
Activate 07-interactions [.agent/skills/07-interactions/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
- Data integration: [.agent/artifacts/integration/YYYY-MM-DD__tour-detail__data-integration.md]
- Page doc: [d:/DATN/DATN_Tài liệu/docs/page/admin_tours_detail.md]
- Main actions: [view detail, toggle status, toggle featured/hot, delete, navigate to edit/schedules]
- Destructive actions: [delete tour]
- Output: [.agent/artifacts/interaction-specs/YYYY-MM-DD__tour-detail__interaction-spec.md]
```

Expected output:

- action breakdown
- form flow
- URL or local state ownership
- confirm dialog behavior
- i18n keys to add

### Skill 08 - Auth And Permissions

```text
Activate 08-auth-permissions [.agent/skills/08-auth-permissions/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Route plan: [.agent/artifacts/routing/YYYY-MM-DD__tour-detail__route-plan.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__tour-detail__interaction-spec.md]
- Feature type: [authenticated-only | role-based]
- Relevant roles: [admin, staff]
- Output: [.agent/artifacts/auth/YYYY-MM-DD__tour-detail__auth-permissions-review.md]
```

Expected output:

- protected route review
- permission matrix
- guarded UI actions
- redirect behavior
- risks and assumptions

### Skill 09 - Testing

```text
Activate 09-testing [.agent/skills/09-testing/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Analysis file: [.agent/artifacts/analysis/YYYY-MM-DD__tour-detail__screen-analysis.md]
- Interaction spec: [.agent/artifacts/interaction-specs/YYYY-MM-DD__tour-detail__interaction-spec.md]
- Auth review: [.agent/artifacts/auth/YYYY-MM-DD__tour-detail__auth-permissions-review.md]
- Output: [.agent/artifacts/test-cases/YYYY-MM-DD__tour-detail__test-report.md]
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
Activate 10-optimization-deploy [.agent/skills/10-optimization-deploy/SKILL.md]

Context:
- Repo: [d:/DATN/danangtrip-admin]
- Feature slug: [tour-detail]
- Test report: [.agent/artifacts/test-cases/YYYY-MM-DD__tour-detail__test-report.md]
- Test verdict: [READY | READY WITH RISKS | NOT READY]
- Existing artifacts: [analysis, api-contract, route-plan, ui-spec, data-integration, interaction-spec, auth-review, test-report]
- Output deploy: [.agent/artifacts/deploy/YYYY-MM-DD__tour-detail__deploy-report.md]
- Output review: [.agent/artifacts/review/YYYY-MM-DD__tour-detail__review.md]
```

Expected output:

- deploy-readiness verdict
- build and runtime constraints
- quality gate summary
- final review summary
- residual risks and next actions
