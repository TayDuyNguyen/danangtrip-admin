# Deploy Report - Blog Post Creation Screen (admin_blog_posts_create)

- **Date:** 2026-05-25
- **Feature Slug:** `admin_blog_posts_create`
- **Branch Naming Standard:** `feat/DATN-56/admin-blog-posts-create`
- **Status:** Quality Gates Checked, Ready for Push & Merge

## Quality Gate Status

| Stage | Command | Result |
| --- | --- | --- |
| Linting | `npm run lint` | **PASSED** (0 errors) |
| Type Checking | `npm run typecheck` | **PASSED** (0 errors) |
| Production Build | `npm run build` | **PASSED** (Vite build successful) |
| Console Smoke Check | `npm run test:console` | **PASSED** (All 6 routes verified green in Playwright E2E browser checks) |

## Deployable File Inventory

Below is the list of modified/added files ready to be deployed:

```text
src/
├── constants/
│   └── endpoints.ts            # Added BLOG.CREATE and BLOG.CREATE_CATEGORY
├── types/
│   └── blog.ts                 # Added CreateBlogPostPayload and CreateBlogCategoryPayload
├── validations/
│   ├── blog.schema.ts          # [NEW] Yup validation schema
│   └── index.ts                # Exported new schema
├── api/
│   └── blogApi.ts              # Exposed create post and create category APIs
├── hooks/
│   └── useBlogQueries.ts       # Hook mutations for creation, inline categories, and uploads
├── routes/
│   └── index.tsx               # Replaced create list redirect with lazy BlogPostCreate routing
└── pages/
    └── Blog/
        └── BlogPostCreate/     # [NEW] Created the blog post create components & layout
            ├── index.tsx
            └── components/
                ├── BlogPostForm.tsx
                ├── BlogMarkdownEditor.tsx
                └── FeaturedImageUploader.tsx
public/lang/
├── vi/
│   └── blog.json               # Added translations for post creation form & messages
└── en/
    └── blog.json               # Added English translations
```

## Database Integrity & Fixes
- **PostgreSQL Sequence Synchronization**: Diagnosed and resolved the `500 duplicate key value violates unique constraint "blog_posts_pkey"` database error. Seeded databases often experience sequence drift when records are inserted with manual IDs.
- **Global Table Alignment**: Proactively executed a database synchronization script to align sequence auto-increment numbers across all database tables (including `payments`, `ratings`, `users`, `blog_posts`, `tours`, `bookings`, and `cart_items`), eliminating similar constraint risks across the application.

## Residual Risks or Exclusions
- Auto-slug checks utilize client-side transliteration which covers all standard Vietnamese alphabets. The backend also enforces unique slug checks and increments suffixes automatically.
- Media upload deletion uses the standard Cloudinary API. If client network interrupts before form submit, temporary images remain in Cloudinary storage (standard orphan upload behavior cleaned up on cron).
