# Feature Review: Admin Blog Posts List

> Feature slug: `admin_blog_posts_list`
> Date: 2026-05-24
> Reviewer context: `pre-push / pre-handoff`

---

## 1) Objective
`admin_blog_posts_list` implements the admin blog posts management list screen at `/admin/blog-posts`. Admin/staff users can browse blog posts, search by title/excerpt, filter by category/status, sort by views/created date, toggle post statuses via interactive dropdown badges, and delete posts (individually or in bulk) with safe confirmation controls.

## 2) Scope Delivered
| Area | What changed | Files |
|---|---|---|
| API Alignment | Added validation rules and repository logic to filter by search query, and order by custom sort parameters. | `IndexAdminBlogRequest.php`, `BlogPostRepository.php` |
| Stats Integration | Service calculates and appends total, published, draft, and archived statistics in the listing payload. | `BlogService.php` |
| Endpoints / Routes | Added blog API routes constants and configured lazy loaded page component in the routing system. | `endpoints.ts`, `routes.ts`, `index.tsx` |
| Sidebar Menu | Updated "Bài viết" navigation item to point to the new blog route constant. | `Sidebar.tsx` |
| types / mapper / clients | Created raw interfaces, ViewModels, filters, API client wrappers, and mapping converters. | `blog.ts`, `index.ts` (types), `blog.mapper.ts`, `blogApi.ts`, `index.ts` (api) |
| React Query Hooks | Created list query, categories query, delete, and status patch mutation hooks with cache invalidation. | `useBlogQueries.ts`, `index.ts` (hooks) |
| UI Components | Implemented stats summary row, filter toolbar, confirmation warning modal, and data list table with status dropdown selector. | `BlogStatsRow.tsx`, `BlogFilterBar.tsx`, `DeleteConfirmDialog.tsx`, `BlogTable.tsx`, `index.tsx` |
| i18n | Added Vietnamese and English translations for blog list headers, status labels, actions, and messages. | `index.ts` (i18n), `vi/blog.json`, `en/blog.json` |

## 2.1) User-Facing Outcomes
- Admin/staff can open the Blog Posts list page from the sidebar navigation.
- The stats row shows the exact totals for each post status (Total, Published, Draft, Archived).
- Search input filters the posts dynamically (with a 300ms debounce).
- Category select loads options from the backend and filters posts accordingly.
- Sorting is enabled on views count (`Lượt xem`) and creation date (`Ngày tạo`).
- The status badge in the table is an interactive dropdown; clicking it opens a menu to update the post status instantly.
- The bulk toolbar displays when rows are selected, letting the admin publish, archive, or delete selected posts in bulk.
- Single delete action opens a dialog warning of category unlinking.

## 3) Artifact Trace
| Step | Artifact Path | Status |
|---|---|---|
| 01 | `.agent/artifacts/analysis/2026-05-24__admin_blog_posts_list__screen-analysis.md` | Handled via [implementation_plan.md](file:///C:/Users/NGUYEN%20DUY%20TAY/.gemini/antigravity/brain/fe933d4f-ae2a-490d-8948-83e58136c2e1/implementation_plan.md) |
| 02 | `.agent/artifacts/setup/2026-05-24__admin_blog_posts_list__project-setup-report.md` | Handled via prepush verification |
| 03 | `.agent/artifacts/api-contracts/2026-05-24__admin_blog_posts_list__api-contract.md` | Handled via [implementation_plan.md](file:///C:/Users/NGUYEN%20DUY%20TAY/.gemini/antigravity/brain/fe933d4f-ae2a-490d-8948-83e58136c2e1/implementation_plan.md) |
| 04-09 | `.agent/artifacts/...` | Handled via [walkthrough.md](file:///C:/Users/NGUYEN%20DUY%20TAY/.gemini/antigravity/brain/fe933d4f-ae2a-490d-8948-83e58136c2e1/walkthrough.md) |
| 10 | `.agent/artifacts/review/2026-05-24__admin_blog_posts_list__review.md` | Complete |

## 4) Technical Decisions
- **TD-01 (Backend stats aggregation)**: Computed global status count statistics (Total, Published, Draft, Archived) directly in the list service, matching the notification service pattern. This eliminates the need for extra network calls from the client.
- **TD-02 (Pure rendering purity)**: Initialized the current timestamp using `useState(() => Date.now())` in the table to comply with strict React Compiler rules (avoiding impure `Date.now()` calls during render).
- **TD-03 (Bulk mutations)**: Ran bulk actions in parallel using `Promise.all` over mutation triggers, ensuring proper UI feedback and toast summaries on finish.

## 5) Validation Summary
| Check | Status | Notes |
|---|---|---|
| admin lint | PASS | `npm run prepush:check` completed with 0 ESLint errors. |
| admin typecheck | PASS | TypeScript compiler verified all files successfully. |
| admin build | PASS | Production Vite bundle compiled without warnings. |
| admin console smoke | PASS | Playwright console suite verified 6 routes successfully. |
| api php syntax | PASS | Checked modifications with `php -l`. |

## 6) Risks / Follow-ups
- **R-01**: Future create/edit blog screens are linked but not implemented in this scope. They will show route loader/fallback or navigate correctly once implemented in their respective steps.

## 7) Approval Recommendation
- Recommendation: **Ready for push after approval**
- Reason: Passes all linting, TypeScript compiler, production build checks, and backend syntax checks.
