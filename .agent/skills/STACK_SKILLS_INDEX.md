# STACK SKILLS INDEX - DanangTrip Admin

Master index for the 10 local skills in `.agent/skills/`.
Current selected admin screen: `admin_blog_categories`.

## Current Decision Snapshot

Date locked: `2026-05-28`

- Repo: `D:\DATN\danangtrip-admin`
- Supporting repo: `D:\DATN\danangtrip-api`
- Document repo: `D:\DATN\DATN_Tài liệu`
- Selected screen: `Danh muc blog`
- Feature slug: `admin_blog_categories`
- Main route: `/admin/blog-categories`
- Target page path: `src/pages/Blog/BlogCategories/index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `src/pages/Blog/BlogCategories/components`
- Primary doc: `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_categories.md`
- Related docs:
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_list.md`
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_create.md`
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_edit.md`
  - `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_detail.md` if it exists; otherwise derive from repo reality
- Primary APIs:
  - `GET /admin/blog-categories`
  - `POST /admin/blog-categories`
  - `PUT /admin/blog-categories/{id}`
  - `DELETE /admin/blog-categories/{id}`
- Status: selected after `admin_blog_posts_detail` completion and progress report `0.0.16` confirmed admin still has `7` documented screens without real page/route code, with blog categories the clearest next CMS gap.
- Cross-project rule: this admin prompt is independent from web; do not use web progress to decide admin steps.

## Why This Is Next

- Progress report `0.0.16` selects `admin_blog_categories` as the next admin screen.
- Repo reality confirms blog post CMS flow now has real code for:
  - `src/pages/Blog/BlogPostList`
  - `src/pages/Blog/BlogPostCreate`
  - `src/pages/Blog/BlogPostEdit`
  - `src/pages/Blog/BlogPostDetail`
- Backend category endpoints already exist in `danangtrip-api`:
  - `GET /admin/blog-categories`
  - `POST /admin/blog-categories`
  - `PUT /admin/blog-categories/{id}`
  - `DELETE /admin/blog-categories/{id}`
- Repo reality still does **not** show a dedicated `BlogCategories` page/route module in `src/pages/Blog`, so this is now the most direct remaining blog CMS gap.
- Admin screens still missing real page/route code are:
  - `admin_blog_categories`
  - `admin_landing_pages`
  - `admin_promotions`
  - `admin_ratings_list`
  - `admin_site_settings`
  - `admin_subcategories`
  - `admin_tags_amenities`
- `admin_tours_detail` is not treated as missing-code because repo reality already has `TourDetailModal` behavior in `src/pages/Tours/TourList`.

## Codegraph / Repo Findings

Read `D:\DATN\danangtrip-admin\.codegraph\codegraph.db` and `D:\DATN\danangtrip-api\.codegraph\codegraph.db` before changing this feature, then verify against repo reality.

- Existing admin framework: React 19 + Vite + TypeScript + React Router v7.
- Existing data pattern: axios client modules in `src/api`, React Query hooks in `src/hooks`, mapped view-model helpers in `src/dataHelper`.
- Existing blog modules to reuse:
  - `src/pages/Blog/BlogPostList`
  - `src/pages/Blog/BlogPostCreate`
  - `src/pages/Blog/BlogPostEdit`
  - `src/pages/Blog/BlogPostDetail`
  - `src/api/blogApi.ts`
  - `src/hooks/useBlogQueries.ts`
  - `src/dataHelper/blog.mapper.ts`
  - `src/types/blog.ts`
  - `public/lang/vi/blog.json`
  - `public/lang/en/blog.json`
  - `src/constants/endpoints.ts` already contains blog category endpoint constants
- Existing router/blog reality:
  - blog post list/create/edit/detail are now real pages,
  - blog categories endpoint constants exist,
  - no dedicated blog category management page is present yet.

## Goals

- Deliver `/admin/blog-categories` through the 10-step pipeline.
- Fetch and manage blog categories with list/create/edit/delete flows.
- Reuse existing admin blog styling, table/filter/dialog patterns where appropriate.
- Preserve loading, empty, forbidden and backend validation behavior.
- Keep unrelated admin modules out of scope.
- Produce artifacts for every step and update memory after each step.
- Use docs root `D:\DATN\DATN_Tài liệu`.

## Canonical Read Order

Before every skill step, read in this order:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`
6. `.agent/memory/SESSION_LOG.md`
7. Latest relevant blog list/create/edit/detail artifacts
8. `.agent/skills/STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
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
| `03-types-api-contract` | Contract/code foundation | Confirm category list/item response shape, CRUD API methods/hooks and validation contract. |
| `04-layout-routing` | Routing/code scaffold | Add lazy route, page shell and route constant wiring for `/admin/blog-categories`. |
| `05-ui-components` | Code-producing | Implement category management header, table/list, modal/form and loading/empty states. |
| `06-data-integration` | Code-producing | Wire category queries/mutations, cache invalidation and backend error handling. |
| `07-interactions` | Code-producing | Implement create/edit/delete interactions, confirm dialogs, responsive/accessibility states. |
| `08-auth-permissions` | Review/fix | Verify protected admin route, authenticated API calls and forbidden handling. |
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
- Feature slug: `admin_blog_categories`
- Screen name: `Danh muc blog`
- Main route: `/admin/blog-categories`
- Target page path: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogCategories\index.tsx` unless Step 01 finds a better established local convention.
- Target component folder: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogCategories\components`
- Feature type: authenticated admin/staff CMS taxonomy management screen.
- Do not switch to blog post list/create/edit/detail, notifications, contacts, users, reports, web, or backend-only tasks.

WHY THIS IS NEXT
- `admin_blog_posts_list`, `admin_blog_posts_create`, `admin_blog_posts_edit`, and `admin_blog_posts_detail` now have real code/artifacts.
- Progress report `0.0.16` selects `admin_blog_categories` as the next admin screen.
- Backend category CRUD routes already exist.
- Repo reality still lacks a dedicated category-management page in `src/pages/Blog`.
- Admin currently still has `7` documented screens without real page/route code, and `admin_blog_categories` is the cleanest next missing screen.

MANDATORY READ ORDER BEFORE ANY WORK
1. `D:\DATN\danangtrip-admin\AGENTS.md`
2. `D:\DATN\danangtrip-admin\.agent\rules\PROJECT_RULES.md`
3. `D:\DATN\danangtrip-admin\.agent\rules\REPO_FACTS.md`
4. `D:\DATN\danangtrip-admin\.agent\memory\WORKING_STATE.md`
5. `D:\DATN\danangtrip-admin\.agent\memory\HANDOFF.md`
6. `D:\DATN\danangtrip-admin\.agent\memory\SESSION_LOG.md`
7. Latest relevant blog list/create/edit/detail artifacts
8. `D:\DATN\danangtrip-admin\.agent\skills\STACK_SKILLS_INDEX.md`
9. Current step `SKILL.md`
10. `D:\DATN\danangtrip-admin\.codegraph\codegraph.db`
11. `D:\DATN\danangtrip-api\.codegraph\codegraph.db`
12. `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
13. Related docs: blog categories + blog list/create/edit/detail docs

SCREEN AND API REFERENCES
- Progress report: `D:\DATN\DATN_Tài liệu\docs\project_delivery_progress_report.md`
- Existing blog post modules: `D:\DATN\danangtrip-admin\src\pages\Blog\BlogPostList`, `BlogPostCreate`, `BlogPostEdit`, `BlogPostDetail`
- Blog API/hooks/types/mappers: `src/api/blogApi.ts`, `src/hooks/useBlogQueries.ts`, `src/types/blog.ts`, `src/dataHelper/blog.mapper.ts`
- Backend routes: `D:\DATN\danangtrip-api\routes\api.php`
- Backend request/controller/service/repository: admin blog controller/service/category handlers

CONTRACT DETAILS
- Category APIs:
  - `GET /admin/blog-categories`
  - `POST /admin/blog-categories`
  - `PUT /admin/blog-categories/{id}`
  - `DELETE /admin/blog-categories/{id}`
- Verify actual backend response shape before coding; use backend-safe params only.
- Keep scope centered on category management unless Step 01 proves a small shared dependency is required.

EXECUTION RULES
- Follow the 10-step pipeline strictly.
- Do not mark a step complete without artifact and memory updates.
- Keep all edits scoped to `admin_blog_categories` except shared endpoint/API/types/hooks/i18n needed by this screen.
- Prefer existing admin blog list/detail/edit patterns over a parallel architecture.
- Run validation in Step 09 and Step 10 as allowed by the environment.
```

## Step-by-step Prompts

### Step 01

```text
Activate `01-screen-analysis` for `admin_blog_categories`.
Read mandatory context, codegraph, progress report, related blog docs, backend blog-category CRUD contract and existing blog modules.
Work: document purpose, route, API contract, missing code, reusable patterns, backend/doc mismatches, risks and implementation plan.
Output: `.agent/artifacts/analysis/2026-05-28__admin_blog_categories__screen-analysis.md`
```

### Step 02

```text
Activate `02-project-setup` for `admin_blog_categories`.
Inspect route conventions, i18n loader, API/hook/type patterns, artifact/memory paths and package scripts.
Work: verify setup readiness and note blocking config/script issues only.
Output: `.agent/artifacts/audits/2026-05-28__admin_blog_categories__project-audit.md`
```

### Step 03

```text
Activate `03-types-api-contract` for `admin_blog_categories`.
Inspect backend category response shape, existing blog API module, hooks, types and mutation patterns.
Work: add/align category response types, API methods/query/mutation hooks and validation contract.
Output: `.agent/artifacts/api-contracts/2026-05-28__admin_blog_categories__api-contract.md`
```

### Step 04

```text
Activate `04-layout-routing` for `admin_blog_categories`.
Target route: `/admin/blog-categories`.
Work: add lazy route, page shell, breadcrumb/nav path and i18n namespace/files.
Output: `.agent/artifacts/routing/2026-05-28__admin_blog_categories__route-plan.md`
```

### Step 05

```text
Activate `05-ui-components` for `admin_blog_categories`.
Work: implement category management header, table/list, create-edit modal or form, loading/error/empty states and responsive layout.
Output: `.agent/artifacts/ui-specs/2026-05-28__admin_blog_categories__ui-spec.md`
```

### Step 06

```text
Activate `06-data-integration` for `admin_blog_categories`.
Work: wire category query/mutations, cache invalidation, backend error handling and toast feedback.
Output: `.agent/artifacts/integration/2026-05-28__admin_blog_categories__data-integration.md`
```

### Step 07

```text
Activate `07-interactions` for `admin_blog_categories`.
Work: implement create/edit/delete interactions, confirm dialogs where needed and accessibility/responsive behavior.
Output: `.agent/artifacts/interaction-specs/2026-05-28__admin_blog_categories__interaction-spec.md`
```

### Step 08

```text
Activate `08-auth-permissions` for `admin_blog_categories`.
Work: verify protected admin route, authenticated admin API calls, role assumptions and forbidden handling.
Output: `.agent/artifacts/auth/2026-05-28__admin_blog_categories__auth-permissions-review.md`
```

### Step 09

```text
Activate `09-testing` for `admin_blog_categories`.
Run relevant lint/typecheck/build or prepush checks and fix feature-caused failures.
Output: `.agent/artifacts/test-cases/2026-05-28__admin_blog_categories__test-report.md`
```

### Step 10

```text
Activate `10-optimization-deploy` for `admin_blog_categories`.
Perform final review, deploy readiness check, artifact closeout, memory handoff and prompt/progress update recommendation.
Output: `.agent/artifacts/deploy/2026-05-28__admin_blog_categories__deploy-report.md` and `.agent/artifacts/review/2026-05-28__admin_blog_categories__review.md`
```
