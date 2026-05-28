# Route Plan - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Plan Date:** 2026-05-27
- **Verdict:** ✅ READY FOR INTEGRATION

---

## 1. Target Route Configuration

We are replacing the temporary redirect with a direct, secure page component mapping under the React Router v7 stack:

- **Path:** `/admin/blog-posts/:id`
- **Route Key (constant):** `ROUTES.BLOG_POSTS_DETAIL` (will be mapped to `'/admin/blog-posts/:id'`)
- **Route Guard:** Protected Route (`PrivateRoute.tsx` is executed on parent layout levels, requiring a valid authenticated Admin/Staff JWT token).
- **Layout:** Nested within `MainLayout.tsx` (exposes sidebars, header blocks, and scroll containers).

---

## 2. Route Registration

### File `src/routes/routes.ts`
Add the detail route property:
```typescript
export const ROUTES = {
    // ...
    BLOG_POSTS: '/admin/blog-posts',
    BLOG_POSTS_CREATE: '/admin/blog-posts/create',
    BLOG_POSTS_EDIT: '/admin/blog-posts/edit/:id',
    BLOG_POSTS_DETAIL: '/admin/blog-posts/:id', // matches eye icon and title clicks in table
} as const;
```

### File `src/routes/index.tsx`
1. Add the lazy load declaration:
   ```typescript
   const BlogPostDetail = React.lazy(() => import('@/pages/Blog/BlogPostDetail'));
   ```
2. In the route definitions nested inside the `PrivateRoute` -> `MainLayout` children, replace:
   ```typescript
   { path: '/admin/blog-posts/:id', element: <RedirectToBlogList /> },
   ```
   with:
   ```typescript
   { path: ROUTES.BLOG_POSTS_DETAIL, element: withSuspense(BlogPostDetail) },
   ```
3. Since `/admin/blog-posts/:id` is now a real page, we can clean up `RedirectToBlogList` if it has no other dependencies, or let it remain for safety.

---

## 3. i18n Translation Sync

We will sync the localization files under `public/lang/vi/blog.json` and `public/lang/en/blog.json`:
- **Vietnam (`vi/blog.json`):**
  - `"detail_title": "Chi tiết bài viết"`
  - `"detail_breadcrumb": "Chi tiết"`
  - `"actions.preview_disabled_helper": "Chỉ có thể xem bài viết đã xuất bản"`
  - `"toast.status_success": "Cập nhật trạng thái bài viết thành công"`
- **English (`en/blog.json`):**
  - `"detail_title": "Blog Post Details"`
  - `"detail_breadcrumb": "Details"`
  - `"actions.preview_disabled_helper": "Only published articles can be viewed"`
  - `"toast.status_success": "Blog post status updated successfully"`

---

## 4. Verification Check

All routes are correctly typed and use clean code-splitting imports. Let's proceed to the actual code modifications in `routes.ts`, `index.tsx`, and the i18n JSON files.
