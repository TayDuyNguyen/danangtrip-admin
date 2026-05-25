# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_blog_posts_list`.

## Current Decision Snapshot

Date locked: `2026-05-24`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Danh sach bai viet Blog`
- Feature slug: `admin_blog_posts_list`
- Main route: `/admin/blog-posts`
- Target page path: `src/pages/Blog/BlogPostList/index.tsx` unless Step 01 finds an established blog folder convention.
- Target component folder: `src/pages/Blog/BlogPostList/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_blog_posts_list.md`
- Related docs: `admin_blog_posts_create.md`, `admin_blog_posts_edit.md`, `admin_blog_categories.md`
- Primary API: `GET /admin/blog-posts`
- Supporting APIs:
  - `GET /admin/blog-posts/{id}`
  - `POST /admin/blog-posts`
  - `PUT /admin/blog-posts/{id}`
  - `DELETE /admin/blog-posts/{id}`
  - `PATCH /admin/blog-posts/{id}/status`
  - Blog category API for the filter if available in backend/docs.
- Status: selected next screen after `admin_notifications_send` Step 10 completion and branch push.
- Implementation reality: `admin_notifications_send` is completed and pushed. Codegraph/API confirm backend admin blog-post CRUD routes exist, while admin repo does not yet have a blog-post list UI module.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.11` selects `admin_blog_posts_list` as the next admin implementation candidate.
- Codegraph snapshot `2026-05-24 20:53:11`: `files=320`, `nodes=2955`, `edges=6172`.
- Admin notification list/send is complete; support/communication workflow is closed.
- API routes in `danangtrip-api\routes\api.php` expose admin blog-post CRUD/status endpoints.
- Admin repo has no confirmed `src/pages/Blog` or `/admin/blog-posts` route/page.
- This screen starts the CMS/blog admin cluster and should be delivered before create/edit screens.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing list-screen patterns to reuse:
  - `src/pages/Notifications/NotificationList`
  - `src/pages/Contacts`
  - `src/pages/Users`
  - `src/pages/Locations/LocationList`
- Existing i18n pattern: `public/lang/vi/*.json`, `public/lang/en/*.json`.
- Expected route constant to add if missing: `ROUTES.BLOG_POSTS = "/admin/blog-posts"`.
- Expected endpoint constants to add if missing under `API_ENDPOINTS`.
- Backend controller/service reality must be rechecked in Step 01-03 before assuming response fields.

## Goals

- Deliver `/admin/blog-posts` through the 10-step pipeline.
- Add route constant, sidebar/menu entry if required, lazy route, API wrappers, query/mutation hooks, mapped types, i18n, and list UI.
- Implement list view with:
  - header and create CTA,
  - stats row if API can support it or local count fallback is valid,
  - search, category filter, status filter,
  - table/list of blog posts,
  - status badge/status update action,
  - single delete confirm,
  - pagination and per-page control,
  - loading, empty, error states.
- Keep create/edit as navigation targets only unless the current step explicitly requires small route constants.
- Do not implement blog create/edit screens, blog categories CRUD, ratings, tags/amenities, promotions, settings, web screens, or backend-only work unless a small contract gap blocks this list page.
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
7. Latest relevant `admin_blog_posts_list` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align blog post list endpoint constants, request params, raw types, mapper and hooks. |
| `04-layout-routing` | Routing/code scaffold | Add route constant, lazy route, sidebar/menu entry and page shell. |
| `05-ui-components` | Code-producing | Implement header, stats/filter/table/pagination/delete dialog/loading/empty/error UI. |
| `06-data-integration` | Code-producing | Wire list query, filters, pagination, delete/status mutations and cache invalidation. |
| `07-interactions` | Code-producing | Implement search debounce, active filters, status change, delete confirm, row actions and responsive behavior. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected admin route and authenticated admin API calls. |
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
- Feature slug: `admin_blog_posts_list`
- Screen name: `Danh sach bai viet Blog`
- Main route: `/admin/blog-posts`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList\index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList\components`
- Feature type: authenticated admin/staff CMS blog-post list.
- Do not switch to blog create/edit, blog categories CRUD, notifications, contacts, users, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_notifications_send` completed Step 10 and branch push.
- Progress report `0.0.11` selects `admin_blog_posts_list` as the next admin screen.
- Backend admin blog-post CRUD/status routes exist.
- Admin repo lacks the `/admin/blog-posts` UI module.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_blog_posts_list` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. Screen/API/repo references listed below

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_blog_posts_list.md`
- Related docs: `admin_blog_posts_create.md`, `admin_blog_posts_edit.md`, `admin_blog_categories.md`
- API list: `D:\DATN\DATN_Document\docs\api\api_list.md`
- Endpoint matrix: `D:\DATN\danangtrip-admin\API_ENDPOINT_MATRIX.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend controller/service/repository: admin blog controller, `BlogService.php`, `BlogPostRepository.php`, `BlogCategoryRepository.php`

REPO CONTEXT TO READ
- `D:\DATN\danangtrip-admin\DESIGN.md`
- `D:\DATN\danangtrip-admin\package.json`
- `D:\DATN\danangtrip-admin\src\routes\routes.ts`
- `D:\DATN\danangtrip-admin\src\routes\index.tsx`
- `D:\DATN\danangtrip-admin\src\constants\endpoints.ts`
- Existing API/hook/mapper/list patterns under `src/api`, `src/hooks`, `src/dataHelper`, `src/pages`
- Existing list modules: Notifications, Contacts, Users, Locations
- `D:\DATN\danangtrip-admin\public\lang\vi`
- `D:\DATN\danangtrip-admin\public\lang\en`

CONTRACT DETAILS
- List API: `GET /admin/blog-posts`.
- Detail/create/update/delete/status APIs exist in backend; list page may link to create/edit/detail but must not implement those screens.
- Expected filters from docs: search, category_id, status, page, per_page, sort/order. Verify actual backend request names before coding.
- Expected statuses: `published`, `draft`, `archived` unless backend differs.
- Use backend-safe params only; do not fabricate unsupported filter fields.
- Status changes should use `PATCH /admin/blog-posts/{id}/status` if backend contract confirms it.
- Delete must use a confirmation dialog.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_blog_posts_list` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing admin list, form, i18n, React Query and toast patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_blog_posts_list`.
Read mandatory context, codegraph, `admin_blog_posts_list.md`, backend blog-post routes/controller/service/repository, and existing admin list patterns.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-24__admin_blog_posts_list__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_blog_posts_list`.
Inspect route conventions, sidebar/menu patterns, i18n loader, list/table/test patterns, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-24__admin_blog_posts_list__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_blog_posts_list`.
Inspect backend list/status/delete requests, existing admin API modules, hooks and mappers.
Work: add/align blog post list request params, raw/view types, API methods, React Query hooks, mapper, and category filter contract.
Output: `.agent/artifacts/api-contracts/2026-05-24__admin_blog_posts_list__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_blog_posts_list`.
Target route: `/admin/blog-posts`.
Work: add route constant, lazy route, sidebar/menu entry if required, page shell, create CTA target, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-24__admin_blog_posts_list__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_blog_posts_list`.
Work: implement page header, stats row, filter bar, table/card list, status badges, row actions, delete dialog, pagination, loading/empty/error states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-24__admin_blog_posts_list__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_blog_posts_list`.
Work: wire list query, category/status/search filters, pagination/per-page, status mutation, delete mutation, cache invalidation, backend validation errors and toast feedback.
Output: `.agent/artifacts/integration/2026-05-24__admin_blog_posts_list__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_blog_posts_list`.
Work: implement debounced search, active filter tags/reset, sortable columns if supported, status update flow, delete confirm, row navigation, disabled/loading states, accessibility and responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-24__admin_blog_posts_list__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_blog_posts_list`.
Work: verify protected admin route, authenticated admin API calls, role assumptions, forbidden handling, and no public leakage of CMS data.
Output: `.agent/artifacts/auth/2026-05-24__admin_blog_posts_list__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_blog_posts_list`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-24__admin_blog_posts_list__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_blog_posts_list`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-24__admin_blog_posts_list__deploy-report.md` and `.agent/artifacts/review/2026-05-24__admin_blog_posts_list__review.md`
```
