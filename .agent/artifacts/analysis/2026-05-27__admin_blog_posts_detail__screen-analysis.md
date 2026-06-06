# Screen Analysis - Blog Post Detail (`admin_blog_posts_detail`)

- **Screen Name:** Chi tiết Bài viết Blog
- **Feature Slug:** `admin_blog_posts_detail`
- **Main Route:** `/admin/blog-posts/:id`
- **Actor:** 🛡️ Admin / Staff
- **Module:** Phân hệ Blog CMS

---

## 1. Summary & Scope

The **Blog Post Detail Screen** is the final CRUD component for Da Nang Trip's Blog Admin Panel. It allows Admins and Staff members to:
1. View a comprehensive, high-fidelity render of a blog post's content and metadata.
2. Monitor stats such as total views and publication schedules.
3. Perform quick actions (Publish/Archive/Unpublish status updates, duplication, or permanent deletion).
4. Navigate seamlessly to the edit page `/admin/blog-posts/edit/:id` or back to the list `/admin/blog-posts`.

---

## 2. Design & Token Audit

Based on `DESIGN.md` and nearby pages (`BlogPostEdit`, `UserDetail`):
- **Layout:** Standard 2-column layout (Left: Article Preview ~70% width, Right: Metadata & Actions ~30% width).
- **Colors:**
  - Background: `#f8fafc` (Slate 50)
  - Primary Accent Button: `#14B8A6` (Teal 500) & hover: `#0f766e` (Teal 700)
  - Status draft: `bg-amber-50 text-amber-700 dot:bg-amber-500`
  - Status published: `bg-emerald-50 text-emerald-700 dot:bg-emerald-500`
  - Status archived: `bg-slate-100 text-slate-700 dot:bg-slate-500`
- **Typography:**
  - Header Title: `3xl font-black text-slate-900 tracking-tight`
  - Detail Header: Sticky `bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs h-20`
  - Article Content Typography: Custom styling for rich text paragraphs, blockquotes, code-blocks, headings, and images.

---

## 3. Component Breakdown

We decompose the detail page into standard, reusable components:

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `Breadcrumbs` | `[REUSE]` | Molecule | `src/components/common/Breadcrumbs.tsx` | Standard path indicator: Blog -> Detail. |
| `Button` | `[REUSE]` | Atom | `src/components/ui/Button.tsx` | Standard premium teal button and outlined variants. |
| `DeleteConfirmDialog` | `[REUSE]` | Organism | `src/pages/Blog/BlogPostList/components/DeleteConfirmDialog.tsx` | Standard deletion confirmation dialog. |
| `BlogPostDetail` | `[NEW]` | Page | `src/pages/Blog/BlogPostDetail/index.tsx` | Main page controller. Orchestrates queries, layout, and dialogs. |
| `BlogPostDetailHeader` | `[NEW]` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailHeader.tsx` | Sticky page header with breadcrumbs, edit navigation, preview link, status toggle and delete. |
| `BlogPostDetailContent` | `[NEW]` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailContent.tsx` | Renders hero featured image, excerpt alert box, custom typography body, and post title. |
| `BlogPostDetailSidebar` | `[NEW]` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailSidebar.tsx` | Right-side column mapping metadata, status, author profile, and quick actions list. |

---

## 4. Responsive & UI States

### Breakpoints Behavior:
- **Desktop (>= 1024px):** 2-column grid. Left side wraps the core content. Right side sidebar is sticky (`sticky top-24`).
- **Tablet & Mobile (< 1024px):** Sidebar collapses below the content section, stacking vertically. Sticky header actions adjust size, and primary quick actions map to secondary links where appropriate.

### UI States Mapping:

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **Whole Page** | Skeleton loaders for Header, Left Content and Right Sidebar. | N/A | Premium Error block with "Not Found" message and back to list button. | Renders detailed grids with active data. |
| **Status Switcher** | Disabled status button + small spinner inside. | N/A | Toast error "Lỗi mạng hoặc máy chủ không phản hồi". | Toast "Cập nhật trạng thái bài viết thành công" + caches refreshed. |
| **Deletion Action** | Disabled buttons, overlay spinner in modal. | N/A | Toast error. | Toast "Đã xóa bài viết thành công" + navigates back to list. |
| **Copy Slug** | N/A | N/A | N/A | Toast "Đã sao chép slug" or inline success icon. |

---

## 5. Data & API Analysis

All required endpoints are supported by the backend without changing any PHP routes.

| Field | ViewModel Type | Raw Response Field | Source Endpoint | Note |
|---|---|---|---|---|
| `id` | `number` | `id` | `GET /admin/blog-posts/{id}` | Primary Key |
| `title` | `string` | `title` | `GET /admin/blog-posts/{id}` | Post title |
| `slug` | `string` | `slug` | `GET /admin/blog-posts/{id}` | Used in URLs and site previews |
| `excerpt` | `string` | `excerpt` | `GET /admin/blog-posts/{id}` | Short description |
| `content` | `string` | `content` | `GET /admin/blog-posts/{id}` | HTML body text |
| `featuredImage` | `string \| null` | `featured_image` | `GET /admin/blog-posts/{id}` | Cover image URL |
| `status` | `'draft' \| 'published' \| 'archived'` | `status` | `GET /admin/blog-posts/{id}` | Current workflow status |
| `viewCount` | `number` | `view_count` | `GET /admin/blog-posts/{id}` | Views counter |
| `publishedAt` | `Date \| null` | `published_at` | `GET /admin/blog-posts/{id}` | Publish date/time |
| `createdAt` | `Date` | `created_at` | `GET /admin/blog-posts/{id}` | Post creation date/time |
| `updatedAt` | `Date` | `updated_at` | `GET /admin/blog-posts/{id}` | Last edit date/time |
| `author` | `BlogPostAuthorViewModel \| null` | `author` | `GET /admin/blog-posts/{id}` | Profile details: ID, fullName, avatar |
| `categories` | `BlogCategoryViewModel[]` | `categories` | `GET /admin/blog-posts/{id}` | Array of category structures |

### Mutation Contract:
- **Status Patch:** `PATCH /admin/blog-posts/{id}/status`
  - Body: `{ "status": "published" | "draft" | "archived" }`
- **Delete Post:** `DELETE /admin/blog-posts/{id}`

---

## 6. Business Rules & Edge Cases

- **BR-01 (Preview Availability):** "Xem bài viết" preview link is only fully valid when `status` is `published` (or is handled specifically by client web drafts if integrated). Out of safety, we disable/helper-text the preview button if status is draft or archived.
- **BR-02 (Scheduled Status):** If `status` is `published` and `publishedAt` is in the future, the UI displays a specialized "Lên lịch" (Scheduled) label next to the status.
- **BR-03 (Categories Safeguard):** If a post has no assigned categories, the UI renders a grayed-out placeholder "Không có danh mục" to prevent visual breakdown.

- **EC-01 (XSS Prevention):** Since blog content is rendered as raw HTML (`dangerouslySetInnerHTML`), ensure styling containers restrict overflow, control large images to maximum widths, and render text beautifully.
- **EC-02 (Missing Image Fallback):** If `featuredImage` is absent or fails to load, render a premium travel placeholder or solid dark teal gradient instead of a broken graphic.

---

## 7. Handoff to Next Steps

- **Files to create:**
  - `src/pages/Blog/BlogPostDetail/index.tsx`
  - `src/pages/Blog/BlogPostDetail/components/BlogPostDetailHeader.tsx`
  - `src/pages/Blog/BlogPostDetail/components/BlogPostDetailContent.tsx`
  - `src/pages/Blog/BlogPostDetail/components/BlogPostDetailSidebar.tsx`
- **Files to modify:**
  - `src/routes/routes.ts`
  - `src/routes/index.tsx`
  - `public/lang/vi/blog.json`
  - `public/lang/en/blog.json`
- **API Hooks to use:**
  - `useAdminBlogPostQuery` in `src/hooks/useBlogQueries.ts`
  - `useBlogMutations` (`deleteMutation`, `updateStatusMutation`) in `src/hooks/useBlogQueries.ts`
