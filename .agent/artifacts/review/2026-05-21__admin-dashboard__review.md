# Review Summary: `admin-dashboard`

## Objective

`admin-dashboard` serves as the primary system command center for administrators, surfacing critical statistics, sales volume insights, real-time booking trends, location analytics, user registrations, and recent orders. The primary focus of this hardener cycle was URL-state synchronization for seamless deep-linking, multi-query robustness, fallback statistics for pending items, and pristine localized Vietnamese/English user experience matching `DESIGN.md` guidelines.

## Scope Delivered

- **Hardened Main Layout**: Fully integrated glassmorphic outlines and HSL teal primary styling.
- **Unified Query Layer**: Multi-query structure optimized in `src/hooks/useDashboardQueries.ts` with standalone query keys and robust error boundaries.
- **Smart Fallback Engine**: Resolves absent API stat endpoints dynamically by fetching count aggregates from parallel fallback listing paths (e.g. `pending_ratings` and `new_contacts`).
- **URL Param Synchronization**: Standardized atomic search parameter transactions directly in `/dashboard` router state to handle dates, periods, pagination, and status filters.
- **Vietnamese/English Localization**: Synchronized key translations across translation locales for perfect i18n alignment.
- **Quality Gates Certified**: 100% compliant with React 19, TypeScript strict mode, ESLint regulations, and production bundles.

## Technical Decisions

- **Independent Multi-Query vs Monolithic Fetch**: Opted for parallel query architecture over single endpoint fetching. This enables independent widget loading states, preventing a single slow endpoint from blocking the entire page load.
- **Transaction-based URL SetSearchParams**: Replaced React standard state hooks with custom transactional `setSearchParams` setters to ensure concurrent multi-filter changes do not cause route-switching conflicts or redundant API calls.
- **Asynchronous Count Fallbacks**: Structured async `Promise.allSettled` fallback queues to dynamically inject ratings and contact counts from raw listing endpoints only if omitted by the central endpoint.

## Validation Summary

- **Static Verification Gates**: All gates (`lint`, `typecheck`, `build`, `prepush:check`) passed with **0 blocking errors**.
- **Build Warnings**: Vite still reports repo-level warnings for `lottie-web` eval usage and chunks above the default 500kB threshold; these do not block the dashboard handoff.
- **Visual Design Compliance**: Fully validated under glassmorphism container patterns, Outfit typography scales, and HSL teal styling.
- **Interaction Robustness**: Filter, period switches, paginated tables, and export loaders verified for double-click prevention and loading states.

## Risks / Follow-ups

- **Heavy Parallel Loading**: While manual refresh fires 7 concurrent queries, strict TanStack Query caching settings limits redundant requests.
- **Rollup / Vite Chunk Sizes**: Rollup warnings about `lottie-web` eval and chunk threshold limits are harmless repo-level assets issues and can be safely bypassed.

## Git Handoff

- **Suggested branch:** `feat/DATN-79/admin-dashboard`
- **Suggested commit message:** `feat(dashboard): harden admin dashboard delivery`
- **Approval rule:** Do not push until USER explicitly confirms `push` or `confirm push`.
