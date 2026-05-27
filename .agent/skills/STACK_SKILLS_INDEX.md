# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_blog_posts_create`.

## Current Decision Snapshot

Date locked: `2026-05-25`

- Repo: `D:\DATN\danangtrip-admin`
- Selected screen: `Tao bai viet Blog`
- Feature slug: `admin_blog_posts_create`
- Main route: `/admin/blog-posts/create`
- Target page path: `src/pages/Blog/BlogPostCreate/index.tsx` unless Step 01 finds an established local convention.
- Target component folder: `src/pages/Blog/BlogPostCreate/components`
- Primary doc: `D:\DATN\DATN_Document\docs\page\admin_blog_posts_create.md`
- Related docs:
  - `D:\DATN\DATN_Document\docs\page\admin_blog_posts_list.md`
  - `D:\DATN\DATN_Document\docs\page\admin_blog_posts_edit.md`
  - `D:\DATN\DATN_Document\docs\page\admin_blog_categories.md`
- Primary API: `POST /admin/blog-posts`
- Supporting APIs:
  - `GET /admin/blog-categories`
  - `POST /admin/blog-categories` only if inline category create is implemented.
  - `POST /upload/image`
  - `POST /upload/images` only if rich text inline/multiple images require it.
- Status: selected next screen after `admin_blog_posts_list` Step 10 completion and merge into `dev`.
- Implementation reality: `/admin/blog-posts` exists, but `/admin/blog-posts/create` currently redirects to the list. API routes for blog create/category/upload exist.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.12` selects `admin_blog_posts_create` as the next admin implementation candidate.
- Codegraph snapshot `2026-05-25 22:23`: `files=329`, `nodes=3047`, `edges=6886`, `unresolved_refs=0`.
- `admin_blog_posts_list` is completed and merged into `dev`; the list screen already has a create CTA.
- Backend exposes `POST /admin/blog-posts`, `GET /admin/blog-categories`, `POST /upload/image`, and blog category APIs.
- Create is the next natural screen in the CMS blog cluster before edit/detail hardening.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing blog list module:
  - `src/pages/Blog/BlogPostList/index.tsx`
  - `src/pages/Blog/BlogPostList/components/BlogTable.tsx`
  - `src/api/blogApi.ts`
  - `src/hooks/useBlogQueries.ts`
  - `src/dataHelper/blog.mapper.ts`
  - `src/types/blog.ts`
- Existing form patterns to reuse:
  - `src/pages/Users/UserCreate`
  - `src/pages/Locations/LocationCreate`
  - `src/pages/Tours/TourCreate`
- Existing route constants:
  - `ROUTES.BLOG_POSTS = "/admin/blog-posts"`
  - `ROUTES.BLOG_POSTS_CREATE = "/admin/blog-posts/create"`
- Current router behavior redirects create/edit/detail blog routes back to list. This must change for create only in this feature.
- Backend contract must be rechecked in `danangtrip-api` before assuming exact request field names.

## Goals

- Deliver `/admin/blog-posts/create` through the 10-step pipeline.
- Add lazy route/page for blog post create, replacing the current create redirect.
- Reuse and extend existing blog API/hooks/types/i18n without duplicating list logic.
- Build a create form with:
  - header, breadcrumb, cancel/save draft/publish actions,
  - title, slug, excerpt, content editor area,
  - status/publish controls,
  - category selector,
  - featured image upload,
  - validation, loading, error, success states.
- Submit draft/published payload to `POST /admin/blog-posts`.
- Navigate back to `/admin/blog-posts` or the created post target after successful create, following existing local convention.
- Keep edit/detail/blog category full CRUD out of scope unless a tiny category selector dependency blocks create.
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
7. Latest relevant `admin_blog_posts_create` artifacts if any
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
| `03-types-api-contract` | Contract/code foundation | Add/align create payload types, validation schema, API method, category/upload helpers if missing. |
| `04-layout-routing` | Routing/code scaffold | Replace create redirect with lazy route and page shell. |
| `05-ui-components` | Code-producing | Implement create form layout, editor controls, sidebar cards, upload preview and states. |
| `06-data-integration` | Code-producing | Wire categories, upload, create mutation, cache invalidation, validation errors and toast feedback. |
| `07-interactions` | Code-producing | Implement slug generation, save draft/publish flows, dirty-state protection, reset/cancel behavior and responsive states. |
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
- Feature slug: `admin_blog_posts_create`
- Screen name: `Tao bai viet Blog`
- Main route: `/admin/blog-posts/create`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostCreate\index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostCreate\components`
- Feature type: authenticated admin/staff CMS blog-post create form.
- Do not switch to blog edit/detail, blog categories CRUD, notifications, contacts, users, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_blog_posts_list` completed Step 10 and merged into `dev`.
- Progress report `0.0.12` selects `admin_blog_posts_create` as the next admin screen.
- Backend blog create/category/upload routes exist.
- Admin create route currently redirects to list and needs a real page.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant `admin_blog_posts_create` artifacts if any
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Document\docs\project_delivery_progress_report.md`
- Primary screen doc: `D:\DATN\DATN_Document\docs\page\admin_blog_posts_create.md`
- Related docs: `admin_blog_posts_list.md`, `admin_blog_posts_edit.md`, `admin_blog_categories.md`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend request/controller/service/repository: `StoreBlogRequest.php`, admin blog controller, `BlogService.php`, `BlogPostRepository.php`
- Existing list implementation: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList`
- Existing create form patterns: Users, Locations, Tours create pages

CONTRACT DETAILS
- Create API: `POST /admin/blog-posts`.
- Category options: `GET /admin/blog-categories`.
- Featured image upload: `POST /upload/image`.
- Expected fields from docs: title, slug, excerpt, content, status, category IDs, featured image, scheduled date/time if backend supports it.
- Verify actual backend request names before coding; use backend-safe params only.
- Submit as draft or published based on user action.
- Delete/edit/detail are out of scope for this screen.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_blog_posts_create` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing admin form, i18n, React Query, upload and toast patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_blog_posts_create`.
Read mandatory context, codegraph, `admin_blog_posts_create.md`, backend blog create request/controller/service/repository, upload route, and existing admin create form patterns.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks, and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-25__admin_blog_posts_create__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_blog_posts_create`.
Inspect route conventions, form libraries, upload helpers, i18n loader, artifact/memory paths, and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-25__admin_blog_posts_create__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_blog_posts_create`.
Inspect backend store request, existing blog API module, hooks, types, mapper and upload API.
Work: add/align create payload, validation schema, API method, category query and upload contract.
Output: `.agent/artifacts/api-contracts/2026-05-25__admin_blog_posts_create__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_blog_posts_create`.
Target route: `/admin/blog-posts/create`.
Work: replace create redirect with lazy route, page shell, breadcrumb/cancel paths, and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-25__admin_blog_posts_create__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_blog_posts_create`.
Work: implement header actions, content form, editor surface, publish/category/image sidebar cards, loading/empty/error states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-25__admin_blog_posts_create__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_blog_posts_create`.
Work: wire category query, image upload, create mutation, cache invalidation, backend validation errors and toast feedback.
Output: `.agent/artifacts/integration/2026-05-25__admin_blog_posts_create__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_blog_posts_create`.
Work: implement slug generation, draft/publish submit flows, upload preview/remove, dirty-state protection, cancel/reset behavior, accessibility and responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-25__admin_blog_posts_create__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_blog_posts_create`.
Work: verify protected admin route, authenticated admin API calls, role assumptions, forbidden handling, upload authorization and no public leakage.
Output: `.agent/artifacts/auth/2026-05-25__admin_blog_posts_create__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_blog_posts_create`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-25__admin_blog_posts_create__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_blog_posts_create`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-25__admin_blog_posts_create__deploy-report.md` and `.agent/artifacts/review/2026-05-25__admin_blog_posts_create__review.md`
```
