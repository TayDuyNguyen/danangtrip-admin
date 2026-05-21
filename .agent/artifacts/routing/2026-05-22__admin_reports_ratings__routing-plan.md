# Routing & Navigation Plan: Báo cáo Đánh giá (Ratings Report)

> Feature slug: `admin_reports_ratings`
> Date: 2026-05-22

---

## 1. Registered Routes
- **Route Key**: `REPORTS_RATINGS`
- **Route Path**: `/admin/reports/ratings`
- **Access level**: Authenticated, Admin/Staff only (guarded by `PrivateRoute` wrapper)
- **Layout integration**: Loaded inside `MainLayout` shell with consistent responsive margins.

---

## 2. Navigational Changes
1. **`src/routes/routes.ts`**:
   Added `REPORTS_RATINGS: '/admin/reports/ratings'` constant under the `ROUTES` dictionary.
2. **`src/routes/index.tsx`**:
   - Declared lazy loaded component `const RatingsReport = React.lazy(() => import('@/pages/Reports/RatingsReport'));`
   - Added `{ path: ROUTES.REPORTS_RATINGS, element: withSuspense(RatingsReport) }` inside `MainLayout` routes children array.
3. **`src/components/common/Sidebar.tsx`**:
   - Added nested group item for **"Báo cáo"** with sub-link for **"Báo cáo Đánh giá"**.
   - Added support in `openMenus` hook state to track active state under `/admin/reports` route to keep submenu open.

---

## 3. Localization Support
- Added translation key `"reports_ratings"` in both `vi/common.json` ("Báo cáo Đánh giá") and `en/common.json` ("Ratings Report").
- Dropdown expands nicely showing appropriate languages in Vietnamese and English.
