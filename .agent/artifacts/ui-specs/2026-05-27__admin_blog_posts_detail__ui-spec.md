# UI Specification - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Specification Date:** 2026-05-27
- **Status:** APPROVED & READY TO IMPLEMENT

---

## 1. Component Placement Matrix

All files will be structured inside the page directory `src/pages/Blog/BlogPostDetail`:

| Component | Level | Path | Reusability | Purpose |
|---|---|---|---|---|
| `BlogPostDetail` | Page | `src/pages/Blog/BlogPostDetail/index.tsx` | `[NEW]` | Entry point, orchestrates data hooks, skeletons, and modal states. |
| `BlogPostDetailHeader` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailHeader.tsx` | `[NEW]` | Sticky page header with titles, breadcrumbs, status toggles, and edit actions. |
| `BlogPostDetailContent` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailContent.tsx` | `[NEW]` | Left column article rendering cover banner, titles, copy slug and rich typography content. |
| `BlogPostDetailSidebar` | Organism | `src/pages/Blog/BlogPostDetail/components/BlogPostDetailSidebar.tsx` | `[NEW]` | Right column mapping author profile, metadata parameters, and quick action lists. |
| `Breadcrumbs` | Molecule | `src/components/common/Breadcrumbs.tsx` | `[REUSE]` | Path indicator component. |
| `Button` | Atom | `src/components/ui/Button.tsx` | `[REUSE]` | Primary and outlined buttons. |
| `DeleteConfirmDialog` | Organism | `src/pages/Blog/BlogPostList/components/DeleteConfirmDialog.tsx` | `[REUSE]` | Standard confirmation modal for safe deletions. |

---

## 2. Component Interfaces (Props Typing)

To ensure compile-time safety under React 19 + TypeScript:

### 2.1 `BlogPostDetailHeaderProps`
```typescript
import type { BlogPostViewModel } from "@/types";

export interface BlogPostDetailHeaderProps {
    post: BlogPostViewModel;
    onStatusChange: (status: 'draft' | 'published' | 'archived') => void;
    onDeleteClick: () => void;
    isMutating?: boolean;
}
```

### 2.2 `BlogPostDetailContentProps`
```typescript
import type { BlogPostViewModel } from "@/types";

export interface BlogPostDetailContentProps {
    post: BlogPostViewModel;
}
```

### 2.3 `BlogPostDetailSidebarProps`
```typescript
import type { BlogPostViewModel } from "@/types";

export interface BlogPostDetailSidebarProps {
    post: BlogPostViewModel;
    onStatusChange: (status: 'draft' | 'published' | 'archived') => void;
    onDeleteClick: () => void;
    onDuplicateClick: () => void;
    isAdmin?: boolean;
}
```

---

## 3. Loading State & skeleton Strategy

To guarantee zero layout shifts and seamless transitions, we define a beautiful, page-level skeleton:

- **Header Skeleton:** breadcrumb placeholder, large header line, and right buttons.
- **Content Left Skeleton:** A large rectangular card for the featured image (`h-[320px] bg-slate-100 rounded-[24px] animate-pulse`), lines for the title, details, and text blocks representing the article body.
- **Sidebar Skeleton:** Rounded panels mimicking the Metadata Card, Quick Actions Card, and Author Profile.

---

## 4. Typography Casing & Localized Tokens

Every visual label will fetch translations from the `blog` namespace:
- Breadcrumbs: `t("breadcrumb")` -> Blog, `t("detail_breadcrumb")` -> Chi tiết
- Sidebar Labels: `t("info_section")`, `t("info_created")`, `t("info_updated")`, `t("info_author")`, `t("info_views")`
- Quick Action Button Text: `t("view_post")`, `t("edit_title")`, `t("duplicate_post")`, `t("delete_post")`

---

## 5. Implementation Sequence

1. Define `BlogPostDetail/index.tsx` skeleton and layout wrapper.
2. Build `BlogPostDetailHeader.tsx` sticky header.
3. Build `BlogPostDetailContent.tsx` left-column typography article view.
4. Build `BlogPostDetailSidebar.tsx` metadata and action blocks.
5. Perform responsive layouts checking.
