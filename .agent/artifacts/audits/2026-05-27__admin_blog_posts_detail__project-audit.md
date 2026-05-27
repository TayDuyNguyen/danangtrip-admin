# Project Setup Audit - Blog Post Detail (`admin_blog_posts_detail`)

- **Feature Slug:** `admin_blog_posts_detail`
- **Audit Date:** 2026-05-27
- **Verdict:** ✅ READY FOR IMPLEMENTATION

---

## 1. Stack & Package Check

Verified actual dependencies and devDependencies from `package.json`:
- **React:** `v19.2.4` (React 19 support)
- **Vite:** `v7.3.1` (Vite 7)
- **Routing:** `react-router-dom v7.13.2`
- **Server State:** `@tanstack/react-query v5.95.2` (v5 query caching)
- **Client State:** `zustand v5.0.8`
- **Styling:** `tailwindcss v4.2.2` (Tailwind CSS v4 with Vite integration `@tailwindcss/vite v4.2.1`)
- **HTTP Client:** `axios v1.14.0`
- **Forms & validation:** `react-hook-form v7.72.0` + `yup v1.7.1` + `@hookform/resolvers v5.2.2`
- **Localization:** `react-i18next v17.0.2` + `i18next v26.0.3`
- **Notifications:** `sonner v2.0.7`

**Verdict:** Pass. The codebase uses modern, top-tier tools in full alignment with the repo facts.

---

## 2. Directory Conventions Check

Verified path mappings inside `danangtrip-admin`:
- `/src/pages/Blog` exists and holds directories `BlogPostList`, `BlogPostCreate`, `BlogPostEdit`.
- **Recommendation:** Create `BlogPostDetail` folder inside `src/pages/Blog` to maintain spatial grouping.
- **Component Naming:** File `BlogPostDetail/index.tsx` as the main controller. Nested page components in PascalCase under `BlogPostDetail/components`.
- **API Mapping:** `src/api/blogApi.ts`, `src/hooks/useBlogQueries.ts`, `src/dataHelper/blog.mapper.ts` are verified and already export detail-fetching hooks and status update mutations.

---

## 3. Configuration & Paths Audit

Verified Vite configurations and TypeScript compilation paths:
- `@/*` is successfully registered as an alias to `src/*` in `vite.config.ts` and `tsconfig.app.json`.
- Environment variables support `VITE_API_URL` and `VITE_API_FALLBACK_URLS` in `src/config/env.ts` with local support via `.env.example`.

---

## 4. HTTP Client & Auth Auditing

Verified `src/api/axiosClient.ts`:
- **Base URL:** Fetches from `apiClientEnv.baseChain` (dynamic base URL routing).
- **Request Interceptor:** Automatically appends `Authorization: Bearer <token>` on every request.
- **Response Interceptor:** Automatically resolves proactive refreshing via silent JWT refresh requests (`POST /auth/refresh`), logs out on severe 401 loops, and yields Sonner warning toasts on 403 / 500 server errors.

---

## 5. Summary & Risks

- **Blockers:** None.
- **Warnings:** The route `/admin/blog-posts/:id` is currently hard-mapped to redirect back to the blog post list. Removing this redirect configuration must be done carefully to prevent navigation breakages across adjacent screens.
- **Verdict:** Pass. Ready to begin Step 03 and Step 04!
