# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_blog_posts_edit`.

## Current Decision Snapshot

Date locked: `2026-05-27`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Selected screen: `Chinh sua bai viet Blog`
- Feature slug: `admin_blog_posts_edit`
- Main route: `/admin/blog-posts/:id/edit`
- Target page path: `src/pages/Blog/BlogPostEdit/index.tsx` unless Step 01 finds an established local convention.
- Target component folder: `src/pages/Blog/BlogPostEdit/components`
- Primary doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_edit.md`
- Related docs:
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_list.md`
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_create.md`
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_categories.md`
- Primary APIs:
  - `GET /admin/blog-posts/{id}`
  - `PUT /admin/blog-posts/{id}`
  - `PATCH /admin/blog-posts/{id}/status`
- Supporting APIs:
  - `GET /admin/blog-categories`
  - `POST /admin/blog-categories` only if inline category create already exists and is safe to reuse.
  - `POST /upload/image`
- Status: selected next screen after `admin_blog_posts_list` and `admin_blog_posts_create` completion.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.12` selects `admin_blog_posts_edit` as the next admin screen.
- Codegraph snapshot `2026-05-27 08:47`: admin `files=334`, `nodes=3185`, `edges=7306`; API `files=459`, `nodes=4409`, `edges=6360`.
- Repo reality confirms:
  - `src/pages/Blog/BlogPostList` exists.
  - `src/pages/Blog/BlogPostCreate` exists.
  - `ROUTES.BLOG_POSTS_EDIT = "/admin/blog-posts/edit/:id"` exists.
  - Router currently redirects blog edit/detail paths back to list instead of rendering a real edit page.
- Backend exposes admin blog show/update/status/category/upload routes, so edit is API-ready.
- This closes the next CRUD gap in the CMS blog cluster.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing blog modules to reuse:
  - `src/pages/Blog/BlogPostList`
  - `src/pages/Blog/BlogPostCreate`
  - `src/api/blogApi.ts`
  - `src/hooks/useBlogQueries.ts`
  - `src/dataHelper/blog.mapper.ts`
  - `src/types/blog.ts`
  - `src/validations/blog.schema.ts`
  - `public/lang/vi/blog.json`
  - `public/lang/en/blog.json`
- Existing create form should be reused or generalized where practical instead of duplicating a parallel editor.
- Current router redirects:
  - `/admin/blog-posts/:id`
  - `/admin/blog-posts/:id/edit`
  - `ROUTES.BLOG_POSTS_EDIT`
- This feature must replace only the edit redirect with a real edit route/page. Detail page remains out of scope unless Step 01 proves it is required.

## Goals

- Deliver `/admin/blog-posts/:id/edit` through the 10-step pipeline.
- Fetch existing post data by ID and hydrate the form.
- Reuse create form/editor/upload/category patterns where safe.
- Support update as draft/published and status changes according to backend contract.
- Preserve slug handling, validation, backend error display, loading state, dirty-state protection, cancel behavior and cache invalidation.
- Keep blog detail, blog category CRUD and unrelated admin modules out of scope.
- Produce artifacts for every step and update memory after each step.
- Use docs root `D:\DATN\DATN_Tài liệu`; do not use stale `D:\DATN\DATN_Document` paths.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant `admin_blog_posts_list`, `admin_blog_posts_create`, and `admin_blog_posts_edit` artifacts if any
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. Real repo sources and docs listed in this prompt

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
| `02-project-setup` | Audit/setup | Verify route/form/upload/i18n setup; config fixes only if required. |
| `03-types-api-contract` | Contract/code foundation | Add/align edit payload types, validation schema reuse, API methods, category/upload helpers if missing. |
| `04-layout-routing` | Routing/code scaffold | Replace edit redirect with lazy route and page shell. |
| `05-ui-components` | Code-producing | Implement edit page/form states using existing create/list design conventions. |
| `06-data-integration` | Code-producing | Wire show query, update mutation, status mutation, categories, upload, cache invalidation and backend validation errors. |
| `07-interactions` | Code-producing | Implement draft/publish update flows, slug behavior, dirty-state protection, reset/cancel and responsive states. |
| `08-auth-permissions` | Code-producing when guards are wrong | Verify protected admin route, authenticated API calls and role assumptions. |
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
| Forms | react-hook-form + yup where existing forms use it |
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
- Feature slug: `admin_blog_posts_edit`
- Screen name: `Chinh sua bai viet Blog`
- Main route: `/admin/blog-posts/:id/edit`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostEdit\index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostEdit\components`
- Feature type: authenticated admin/staff CMS blog-post edit form.
- Do not switch to blog detail, blog categories CRUD, notifications, contacts, users, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_blog_posts_list` and `admin_blog_posts_create` have deploy artifacts and real code.
- Progress report `0.0.12` selects `admin_blog_posts_edit` as the next admin screen.
- Backend blog show/update/status/category/upload routes exist.
- Admin edit/detail routes currently redirect to list; edit needs a real page.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant blog list/create/edit artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_edit.md`
- Related docs: `admin_blog_posts_list.md`, `admin_blog_posts_create.md`, `admin_blog_categories.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend request/controller/service/repository: admin blog controller, update request if present, `BlogService.php`, `BlogPostRepository.php`
- Existing list implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList`
- Existing create implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostCreate`

CONTRACT DETAILS
- Show API: `GET /admin/blog-posts/{id}`.
- Update API: `PUT /admin/blog-posts/{id}`.
- Status API: `PATCH /admin/blog-posts/{id}/status`.
- Category options: `GET /admin/blog-categories`.
- Featured image upload: `POST /upload/image`.
- Verify actual backend request names before coding; use backend-safe params only.
- Submit draft/published update based on user action and existing backend status model.
- Detail page and category CRUD are out of scope unless Step 01 proves a small shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_blog_posts_edit` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing admin blog create/list patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_blog_posts_edit`.
Read mandatory context, codegraph, `admin_blog_posts_edit.md`, backend blog show/update/status contract, existing blog create/list code, and router redirects.
Work: document purpose, route, API contract, missing code, reusable create/list patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-27__admin_blog_posts_edit__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_blog_posts_edit`.
Inspect route conventions, form libraries, upload helpers, i18n loader, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-27__admin_blog_posts_edit__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_blog_posts_edit`.
Inspect backend update request, existing blog API module, hooks, types, mapper and upload API.
Work: add/align edit payload, show/update/status API methods, validation schema reuse, category query and upload contract.
Output: `.agent/artifacts/api-contracts/2026-05-27__admin_blog_posts_edit__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_blog_posts_edit`.
Target route: `/admin/blog-posts/:id/edit`.
Work: replace edit redirect with lazy route, page shell, breadcrumb/cancel paths, params handling and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-27__admin_blog_posts_edit__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_blog_posts_edit`.
Work: implement edit header actions, hydrated content form, editor surface, publish/category/image sidebar cards, loading/error/not-found states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-27__admin_blog_posts_edit__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_blog_posts_edit`.
Work: wire post show query, category query, image upload, update/status mutations, cache invalidation, backend validation errors and toast feedback.
Output: `.agent/artifacts/integration/2026-05-27__admin_blog_posts_edit__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_blog_posts_edit`.
Work: implement draft/publish update flows, slug behavior, upload preview/remove, dirty-state protection, cancel/reset behavior, accessibility and responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-27__admin_blog_posts_edit__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_blog_posts_edit`.
Work: verify protected admin route, authenticated admin API calls, role assumptions, forbidden/not-found handling, upload authorization and no public leakage.
Output: `.agent/artifacts/auth/2026-05-27__admin_blog_posts_edit__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_blog_posts_edit`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-27__admin_blog_posts_edit__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_blog_posts_edit`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-27__admin_blog_posts_edit__deploy-report.md` and `.agent/artifacts/review/2026-05-27__admin_blog_posts_edit__review.md`
```
