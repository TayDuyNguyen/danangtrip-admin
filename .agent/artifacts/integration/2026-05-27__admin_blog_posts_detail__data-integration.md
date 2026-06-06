# Data Integration - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Integration Date:** 2026-05-27
- **Verdict:** ✅ READY & WIRED (All data hooks and mutations integrated)

---

## 1. Data Source Breakdown

Our detail screen integrates three core data actions, all talking to the Laravel PHP backend without intermediate mock datasets:

1. **Query: Fetch Detail (`GET /admin/blog-posts/{id}`)**
   - Hook: `useAdminBlogPostQuery` in `src/hooks/useBlogQueries.ts`
   - Purpose: Retrieve raw post data, map to camelCase view-model, and render in UI.
2. **Mutation: Update Status (`PATCH /admin/blog-posts/{id}/status`)**
   - Hook: `useBlogMutations -> updateStatusMutation` in `src/hooks/useBlogQueries.ts`
   - Purpose: Toggle publication workflow (Draft / Published / Archived).
3. **Mutation: Delete Post (`DELETE /admin/blog-posts/{id}`)**
   - Hook: `useBlogMutations -> deleteMutation` in `src/hooks/useBlogQueries.ts`
   - Purpose: Permanently remove the resource from CMS database.

---

## 2. TanStack Query Configuration

We adhere to standard hierarchical query keys:

- **Key for details:** `blogKeys.detail(id)` equivalent to `['blogs', 'detail', id]`
- **Deduplication:** Enforces `staleTime: 30000` (30 seconds) to avoid redundant network spikes while routing back/forth.
- **Dependency Guard:** Hook includes `enabled: !!id` so query only fires when the route ID is loaded.

---

## 3. Cache Invalidation & Feedback

All modifications perform proactive cache clearing:

- **Status Patch:** On success, calls `queryClient.invalidateQueries({ queryKey: blogKeys.all })` and `queryClient.invalidateQueries({ queryKey: ["dashboard"] })`. Displays Sonner toast `"Cập nhật trạng thái bài viết thành công"`.
- **Delete Post:** On success, invalidates all blog keys, removes individual details query data, displays success toast, and redirects to list.

---

## 4. UI States Integrations

We map API response states dynamically to our custom visual blocks:

- **Loading:** Entire page body defaults to `BlogPostDetailSkeleton` layout if `isLoading` is true, providing smooth above-the-fold placeholder blocks.
- **Not Found (404 / Error):** Renders premium `isError` layout containing clear error text, warnings, and custom CTA button linking back to list.
- **Success:** Triggers slide-in animations and binds actual fields into detail header, content preview, and sidebar panels.
