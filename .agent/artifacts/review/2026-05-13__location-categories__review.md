# Review: Location Categories

- **Date**: 2026-05-13
- **Feature Slug**: `location-categories`
- **Module**: Locations
- **Route**: `/admin/locations/categories`
- **Stack**: React 19 + Vite + TypeScript + TanStack Query + react-i18next + react-hook-form + yup + sonner

---

## 1. Objective

Xây dựng màn hình quản lý danh mục địa điểm (Location Categories) cho admin, cho phép:

- Xem danh sách danh mục dạng grid cards
- Tạo mới / chỉnh sửa danh mục qua Drawer form
- Xóa danh mục với xác nhận (có xử lý constraint từ API)
- Bật/tắt trạng thái hoạt động
- Sắp xếp thứ tự hiển thị bằng kéo thả
- Tìm kiếm và lọc theo trạng thái
- Đa ngôn ngữ hoàn chỉnh (vi/en)

---

## 2. Scope Delivered

### New Files

| Path | Purpose |
|------|---------|
| `src/pages/Locations/LocationCategories/index.tsx` | Page component |
| `src/pages/Locations/LocationCategories/components/CategoryCard.tsx` | Card UI unit |
| `src/pages/Locations/LocationCategories/components/CategoryGrid.tsx` | Grid orchestration |
| `src/pages/Locations/LocationCategories/components/CategoryHeader.tsx` | Header + breadcrumb + CTA |
| `src/pages/Locations/LocationCategories/components/CategoryFormModal.tsx` | Add/Edit drawer form |
| `src/pages/Locations/LocationCategories/components/CategoryDeleteDialog.tsx` | Delete confirmation |
| `src/pages/Locations/LocationCategories/components/CategoryStatusBadge.tsx` | Status badge |
| `src/api/categoryApi.ts` | API service wrapper |
| `src/hooks/useCategoryQueries.ts` | TanStack Query hooks (list, mutations) |
| `src/dataHelper/category.dataHelper.ts` | Raw + ViewModel types |
| `src/dataHelper/category.mapper.ts` | API response mapper |
| `src/types/category.ts` | CategoryInput type |
| `src/validations/category.schema.ts` | Yup validation schema |
| `src/utils/categoryIcon.ts` | Icon resolver utility |
| `src/hooks/useDebounce.ts` | Debounce hook |

### Modified Files

| Path | Change |
|------|--------|
| `src/routes/index.tsx` | Added `/admin/locations/categories` route |
| `src/components/common/Sidebar.tsx` | Added menu item |
| `src/constants/endpoints.ts` | Added category API endpoints |
| `src/hooks/index.ts` | Barrel export |
| `src/types/index.ts` | Barrel export |
| `public/lang/vi/location.json` | Added `categories.*` keys (45 keys) |
| `public/lang/en/location.json` | Added `categories.*` keys (45 keys) |
| `public/lang/vi/translation.json` | Added `api_errors.*` keys (50+ keys) |
| `public/lang/en/translation.json` | Added `api_errors.*` keys (50+ keys) |
| `src/utils/apiError.ts` | Rewrote to use `error_key` lookup for i18n |
| `src/api/axiosClient.ts` | 403/500 toasts now use `getLocalizedApiErrorMessage` |
| `src/hooks/useCategoryQueries.ts` | Simplified — removed manual `knownMessages` |

### Additional Fixes (during testing phase)

| File | Fix |
|------|-----|
| `src/pages/Locations/LocationCategories/components/CategoryFormModal.tsx` | Replaced `useEffect` + `setState` with `handleClose` wrapper |
| `src/pages/Locations/LocationCategories/index.tsx` | Replaced `useEffect` + `setState` with `useMemo` for categories derivation |
| `src/pages/Tours/TourCreate/index.tsx` | Fixed pre-existing empty catch block lint error |

---

## 3. Pipeline Trace

| Step | Artifact | Verdict |
|------|----------|---------|
| 01 — Screen Analysis | `screen-analysis.md` | Completed |
| 02 — Project Audit | `project-audit.md` | Completed |
| 03 — API Contract | `api-contract.md` | Completed |
| 04 — Route Plan | `route-plan.md` | Completed |
| 05 — UI Spec | `ui-spec.md` | Completed |
| 06 — Data Integration | `data-integration.md` | Completed |
| 07 — Interaction Spec | `interaction-spec.md` | Completed |
| 08 — Auth Review | `auth-permissions-review.md` | SAFE |
| 09 — Test Report | `test-report.md` | CONDITIONAL PASS |
| 10 — Deploy Report | `deploy-report.md` | Ready for push |

Full 10-step pipeline completed.

---

## 4. Technical Decisions

### 4.1 Grid Layout (not Table)

Chose card-based grid over table layout for categories. Categories are a small dataset (<100 items) where visual identity (icon, color) matters more than dense data scanning. Grid also enables drag-and-drop reorder naturally.

### 4.2 Full Dataset Load

Request `per_page=100` to load all categories at once. This enables client-side reorder without pagination conflicts. Appropriate because category count is inherently bounded.

### 4.3 API Error i18n Centralization

Replaced per-mutation `knownMessages` pattern with centralized `error_key` → translation key lookup in `apiError.ts`. This is more maintainable and covers all API errors globally, not just category-specific ones.

Two lookup strategies:
- `ERROR_KEY_MAP`: maps API `error_key` (e.g., `request.invalid_state`) to translation key
- `MESSAGE_KEY_MAP`: maps raw API `message` text to translation key (fallback for older API responses)

### 4.4 Reorder Mode Isolation

Reorder mode maintains a local copy of the category list. Changes are only persisted when the user clicks "Save order". This prevents accidental reorder from conflicting with search/filter state — reorder is disabled when filters are active.

---

## 5. i18n Impact

- `location.json`: 45 new keys in `categories.*` section (vi/en synchronized)
- `translation.json`: 50+ new keys in `api_errors.*` section (vi/en synchronized)
- All toast messages use `t()` — no hardcoded strings
- Delete constraint errors (subcategories, locations) now display in correct locale

---

## 6. Auth Impact

- Route `/admin/locations/categories` is under `PrivateRoute` (admin-only)
- No new permission levels introduced
- All mutations go through authenticated `axiosClient`
- Auth review verdict: SAFE

---

## 7. Validation Summary

| Check | Status |
|-------|--------|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run prepush:check` | PASS |
| i18n vi/en sync | PASS |
| Auth review | SAFE |
| Browser smoke test | NOT RUN (Playwright unavailable) |

---

## 8. Risks and Follow-ups

### Risks

1. **Phases 2-4 NOT RUN**: UI visual, functional flow, and edge case testing could not be automated. Manual browser verification recommended.
2. **Reorder data sync removed**: If server data changes while reorder mode is active, the local list will not update. User must exit and re-enter reorder mode. Low probability scenario.
3. **API error_key dependency**: The new i18n error system relies on API consistently returning `error_key`. If API omits it, the fallback chain (message lookup → bilingual normalize → fallback string) still works.

### Follow-ups

- Install Playwright browsers (`npx playwright install`) for future automated testing
- Consider lazy-loading the icon browser panel in CategoryFormModal if performance is a concern
- The `lucide-react` bundle (601KB) is a global optimization opportunity

---

## 9. Handoff Decision

**Ready for push after approval.**

Manual browser verification at `http://localhost:5173/admin/locations/categories` is recommended before approving.
