# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_blog_posts_detail`.

## Current Decision Snapshot

Date locked: `2026-05-27`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Document repo: `D:\DATN\DATN_Document`
- Selected screen: `Chi tiet bai viet Blog`
- Feature slug: `admin_blog_posts_detail`
- Main route: `/admin/blog-posts/:id`
- Target page path: `src/pages/Blog/BlogPostDetail/index.tsx` unless Step 01 finds an established local convention.
- Target component folder: `src/pages/Blog/BlogPostDetail/components`
- Primary doc: no dedicated `admin_blog_posts_detail.md` exists in `D:\DATN\DATN_Document\docs\page`; Step 01 must derive scope from list/create/edit docs and repo/API reality, then record the missing doc.
- Related docs:
  - `D:\DATN\DATN_Document\docs\page\admin_blog_posts_list.md`
  - `D:\DATN\DATN_Document\docs\page\admin_blog_posts_create.md`
  - `D:\DATN\DATN_Document\docs\page\admin_blog_posts_edit.md`
  - `D:\DATN\DATN_Document\docs\page\admin_blog_categories.md`
- Primary APIs:
  - `GET /admin/blog-posts/{id}`
  - `PATCH /admin/blog-posts/{id}/status` only if detail page exposes quick publish/archive controls
- Supporting APIs:
  - `GET /admin/blog-categories` only if categories need display enrichment beyond show response.
- Status: selected after `admin_blog_posts_list`, `admin_blog_posts_create`, and `admin_blog_posts_edit` completion.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.13` selects `admin_blog_posts_detail` as the next admin screen.
- Codegraph snapshot `2026-05-27 21:54:15`: admin `files=340`, `nodes=3280`, `edges=6838`; API `files=461`, `nodes=4423`, `edges=6334`.
- Repo reality confirms:
  - `src/pages/Blog/BlogPostList` exists.
  - `src/pages/Blog/BlogPostCreate` exists.
  - `src/pages/Blog/BlogPostEdit` exists and has deploy artifact `2026-05-27__admin_blog_posts_edit__deploy-report.md` with lint/typecheck/build/prepush PASS.
  - Router lazy imports `BlogPostEdit`.
  - `ROUTES.BLOG_POSTS_EDIT` is wired to a real page.
  - Router still redirects `/admin/blog-posts/:id` back to the list.
- After list/create/edit, detail is the remaining blog-post CRUD route gap in admin.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing blog modules to reuse:
  - `src/pages/Blog/BlogPostList`
  - `src/pages/Blog/BlogPostCreate`
  - `src/pages/Blog/BlogPostEdit`
  - `src/api/blogApi.ts`
  - `src/hooks/useBlogQueries.ts`
  - `src/dataHelper/blog.mapper.ts`
  - `src/types/blog.ts`
  - `src/validations/blog.schema.ts`
  - `public/lang/vi/blog.json`
  - `public/lang/en/blog.json`
- Existing router state:
  - `/admin/blog-posts/:id/edit` renders edit page.
  - `/admin/blog-posts/:id` redirects to blog list and must become a real detail page for this feature.
- Detail should reuse list/edit view-models and actions rather than creating a parallel API/type stack.

## Goals

- Deliver `/admin/blog-posts/:id` through the 10-step pipeline.
- Fetch and display one blog post by ID.
- Show publish/status, category, author, dates, slug, excerpt, featured image and rendered/preview content when available in the show response.
- Provide actions to go back to list and edit the post.
- Support status quick action only if the existing backend/status hook is safe and already aligned with edit/list behavior.
- Preserve loading, error, not-found, forbidden and backend validation behavior.
- Keep blog edit, create, categories CRUD and unrelated admin modules out of scope.
- Produce artifacts for every step and update memory after each step.
- Use docs root `D:\DATN\DATN_Document`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant `admin_blog_posts_list`, `admin_blog_posts_create`, and `admin_blog_posts_edit` artifacts
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
13. Related docs listed in this prompt
14. Real repo sources and backend routes/controllers/services/repositories discovered by Step 01

If sources conflict, follow repo reality and record stale facts in the artifact.

## Memory Continuity Rules

- At the start of each step, update `.agent/memory/WORKING_STATE.md`.
- After each completed step, update `.agent/memory/WORKING_STATE.md` and append `.agent/memory/SESSION_LOG.md`.
- Update `.agent/memory/HANDOFF.md` if paused, blocked, waiting for approval, or incomplete.
- Do not claim a step is complete until the artifact and memory updates are complete.

## Coding Responsibility By Skill

| Skill | Execution mode | Code expectation |
| --- | --- | --- |
| `01-screen-analysis` | Analysis only | Do not edit product code; document route/doc/API gaps and implementation plan. |
| `02-project-setup` | Audit/setup | Verify route constants, lazy route conventions, i18n, artifact paths and package scripts. |
| `03-types-api-contract` | Contract/code foundation | Confirm detail response type, show API method/hook and status action contract. |
| `04-layout-routing` | Routing/code scaffold | Replace `/admin/blog-posts/:id` redirect with lazy detail route and page shell. |
| `05-ui-components` | Code-producing | Implement detail header, metadata panels, image/content preview, loading/error/not-found states. |
| `06-data-integration` | Code-producing | Wire show query, optional status mutation, cache invalidation and backend error handling. |
| `07-interactions` | Code-producing | Implement edit/back/status interactions, confirm where needed, responsive/accessibility states. |
| `08-auth-permissions` | Review/fix | Verify protected admin route, authenticated API calls and role/forbidden handling. |
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
- Feature slug: `admin_blog_posts_detail`
- Screen name: `Chi tiet bai viet Blog`
- Main route: `/admin/blog-posts/:id`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostDetail\index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostDetail\components`
- Feature type: authenticated admin/staff CMS blog-post detail screen.
- Do not switch to blog edit, blog create, blog categories CRUD, notifications, contacts, users, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_blog_posts_list`, `admin_blog_posts_create`, and `admin_blog_posts_edit` have real code and deploy artifacts.
- Progress report `0.0.13` selects `admin_blog_posts_detail` as the next admin screen.
- Backend blog show/status routes exist.
- Admin route `/admin/blog-posts/:id` still redirects to list and needs a real detail page.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant blog list/create/edit artifacts
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
13. Related blog docs: list/create/edit/categories

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Existing list implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList`
- Existing create implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostCreate`
- Existing edit implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostEdit`
- Blog API/hooks/types/mappers: `src/api/blogApi.ts`, `src/hooks/useBlogQueries.ts`, `src/types/blog.ts`, `src/dataHelper/blog.mapper.ts`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend request/controller/service/repository: admin blog controller, `BlogService.php`, `BlogPostRepository.php`

CONTRACT DETAILS
- Show API: `GET /admin/blog-posts/{id}`.
- Optional status API: `PATCH /admin/blog-posts/{id}/status`.
- Verify actual backend response shape before coding; use backend-safe params only.
- The detail page must provide edit navigation to the existing edit route.
- Blog edit/create/category CRUD are out of scope unless Step 01 proves a small shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_blog_posts_detail` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing admin blog list/edit patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_blog_posts_detail`.
Read mandatory context, codegraph, progress report, related blog docs, backend blog show/status contract, existing blog list/create/edit code and router redirect.
Work: document purpose, route, API contract, missing detail doc, missing code, reusable patterns, backend/doc mismatches, risks and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-27__admin_blog_posts_detail__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_blog_posts_detail`.
Inspect route conventions, i18n loader, API/hook/type patterns, artifact/memory paths and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-27__admin_blog_posts_detail__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_blog_posts_detail`.
Inspect backend show response, existing blog API module, hooks, types, mapper and status mutation.
Work: add/align detail response types, show API method/query hook, view mapper and optional status contract.
Output: `.agent/artifacts/api-contracts/2026-05-27__admin_blog_posts_detail__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_blog_posts_detail`.
Target route: `/admin/blog-posts/:id`.
Work: replace detail redirect with lazy route, page shell, breadcrumb/back/edit paths, params handling and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-27__admin_blog_posts_detail__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_blog_posts_detail`.
Work: implement detail header actions, metadata/status/category panels, featured image block, content preview, loading/error/not-found states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-27__admin_blog_posts_detail__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_blog_posts_detail`.
Work: wire post show query, optional status mutation, cache invalidation, backend error handling and toast feedback.
Output: `.agent/artifacts/integration/2026-05-27__admin_blog_posts_detail__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_blog_posts_detail`.
Work: implement back/edit/status interactions, confirm dialogs where needed, preview link behavior, accessibility and responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-27__admin_blog_posts_detail__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_blog_posts_detail`.
Work: verify protected admin route, authenticated admin API calls, role assumptions, forbidden/not-found handling and no public leakage.
Output: `.agent/artifacts/auth/2026-05-27__admin_blog_posts_detail__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_blog_posts_detail`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-27__admin_blog_posts_detail__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_blog_posts_detail`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-27__admin_blog_posts_detail__deploy-report.md` and `.agent/artifacts/review/2026-05-27__admin_blog_posts_detail__review.md`
```
