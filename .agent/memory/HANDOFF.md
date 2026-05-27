# Handoff

## Last Updated

- Date: 2026-05-27
- Status: Completed (`admin_blog_posts_edit`, `admin_blog_posts_create`, `admin_users_create`, `web_recommendations_relocation`, `admin_users_edit`, `admin_contacts`, `admin_notifications_list`, & `admin_notifications_send`)

## Current Features

- **Feature 1: `admin_blog_posts_edit`**
  - Route: `/admin/blog-posts/edit/:id` (DanangTrip Admin)
  - Status: Completed. Screen to edit blog posts built, integrated, and verified with all fixes.
- **Feature 2: `admin_blog_posts_create`**
  - Route: `/admin/blog-posts/create` (DanangTrip Admin)
  - Status: Completed. Screen to create new blog posts built, integrated, and verified.
- **Feature 3: `admin_users_create`**
  - Route: `/admin/users/create` (DanangTrip Admin)
  - Status: Completed. Screen to create a new user account built and verified.
- **Feature 4: `web_recommendations_relocation`**
  - Route: `/profile/recommendations` (DanangTrip Client Web)
  - Status: Completed. Relocated recommendations page inside Next.js Profile section.

## Technical Summary - `admin_blog_posts_edit`

- **Route Restructuring:**
  - Enforced that all SPA edit and view routes place the resource ID at the end, preceded by action descriptors (e.g. `edit/:id`, `detail/:id`).
  - Updated `USERS_DETAIL`, `BOOKINGS_DETAIL`, and `PAYMENTS_DETAIL` in `routes.ts`.
  - Removed the old `/admin/blog-posts/:id/edit` alias route in `routes/index.tsx`.
  - Replaced hardcoded detail URLs in `BookingsReportTable.tsx` and `RevenueReportTable.tsx` to use the `ROUTES.BOOKINGS_DETAIL` constant.
- **Endpoint Wiring:**
  - Registered `API_ENDPOINTS.BLOG.DETAIL` and `API_ENDPOINTS.BLOG.UPDATE` in `src/constants/endpoints.ts`.
  - Exposed `getDetail` and `update` in `src/api/blogApi.ts`.
  - Added React Query hooks `useAdminBlogPostQuery` and `useUpdateBlogPostMutation` inside `src/hooks/useBlogQueries.ts`.
- **Form & Validation:**
  - Extended `BlogPostViewModel` to map `updatedAt` Date parameter correctly in [blog.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/blog.mapper.ts).
  - Used `react-hook-form` + Yup resolver. Added type cast and cleared ESLint warnings.
  - Form transitions back to the blog list screen `ROUTES.BLOG_POSTS` upon successful submission.
- **UI Components:**
  - Unified loading status across Save buttons in the sticky header and mobile bar by exposing `onSubmittingChange` callback on `BlogPostForm`.
  - Integrated `UnsavedChangesGuard` to prevent accidental navigation away.
  - Linked "Xem bài viết" preview buttons to transition correctly to the Next.js client web portal at `http://localhost:3000/blog/{slug}`.
- **Localization:**
  - Synced Vietnamese and English translation keys in `public/lang/vi/blog.json` and `public/lang/en/blog.json`.

## Final Verification

- **Admin (`npm run prepush:check`):** Passed successfully.
  - 0 ESLint errors.
  - 0 TypeScript compilation errors.
  - Vite production build passed.
  - Playwright Console test suite passed.

## Next Action

Await user review and approval to push the branch.
