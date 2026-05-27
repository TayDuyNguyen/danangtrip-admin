# API Contract - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Contract Date:** 2026-05-27
- **Verdict:** ✅ 100% RECONCILED & READIED (All client layers already in place)

---

## 1. Endpoint Mapping

All required endpoints are fully registered in `src/constants/endpoints.ts` and supported in the backend without modifications:

| Action | Method | Path | Auth | API Endpoint constant |
|---|---|---|---|---|
| Fetch Blog Post Detail | `GET` | `/v1/admin/blog-posts/{id}` | Yes (Bearer) | `API_ENDPOINTS.BLOG.DETAIL(id)` |
| Quick Status Update | `PATCH` | `/v1/admin/blog-posts/{id}/status` | Yes (Bearer) | `API_ENDPOINTS.BLOG.PATCH_STATUS(id)` |
| Delete Blog Post | `DELETE` | `/v1/admin/blog-posts/{id}` | Yes (Bearer) | `API_ENDPOINTS.BLOG.DELETE(id)` |

---

## 2. Reconciled Data Models

The structures are defined in `src/types/blog.ts` and successfully reconciled against the database structure.

### 2.1 Raw Response Model (`RawBlogPost`)
Consumes data from backend snake_case payloads:
```typescript
export interface RawBlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    author_id: number;
    view_count: number;
    status: 'draft' | 'published' | 'archived';
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: RawBlogPostAuthor | null;
    categories?: RawBlogCategory[];
}
```

### 2.2 UI View Model (`BlogPostViewModel`)
Sanitized camelCase interface utilized by UI components:
```typescript
export interface BlogPostViewModel {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    authorId: number;
    viewCount: number;
    status: 'draft' | 'published' | 'archived';
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    author: BlogPostAuthorViewModel | null;
    categories: BlogCategoryViewModel[];
}
```

---

## 3. Mapper Sanitization Safeguards

The mapper `src/dataHelper/blog.mapper.ts` maps `RawBlogPost` to `BlogPostViewModel` safely:
- `title` fallbacks to `"N/A"`.
- `excerpt` and `content` fallback to `""`.
- Dates parsed safely with `new Date(string)` wrapper.
- Numbers sanitized safely with `toNumberSafe(view_count, 0)`.
- Associated category array sanitized with `toArraySafe` wrapper.

---

## 4. Query Hooks Alignment

Exposed query hooks are ready in `src/hooks/useBlogQueries.ts`:
- **useAdminBlogPostQuery(id):**
  - Query Key: `['blogs', 'detail', id]`
  - Deduplices fetching and enforces a 30s `staleTime`.
- **useBlogMutations() -> updateStatusMutation & deleteMutation:**
  - Standard mutations that invalidate all blog keys (`['blogs']`) and dashboard stats on success.

---

## 5. Verification Verdict

✅ Pass. No types, mapper, or API functions require new code. We can proceed directly to routing and scaffolding pages.
