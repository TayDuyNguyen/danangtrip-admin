# Routing & Layout Plan: Admin Bookings List

- **Feature Slug:** `admin-bookings-list`
- **Plan Date:** 2026-05-16
- **Status:** ✅ VERIFIED
- **Route Path:** `/admin/bookings`

---

## 1. Route Configuration

| Property | Value | File |
|---|---|---|
| **Route Name** | `BOOKINGS_LIST` | `src/routes/routes.ts` |
| **Path** | `/admin/bookings` | `src/routes/routes.ts` |
| **Guard** | `PrivateRoute` (admin only) | `src/routes/index.tsx` |
| **Component** | `BookingList` (Lazy loaded) | `src/routes/index.tsx` |
| **Layout** | `MainLayout` | `src/routes/index.tsx` |

---

## 2. Navigation & Sidebar

| Menu Item | Icon | Label Key | Target Path |
|---|---|---|---|
| **Bookings** | `ShoppingCart` | `sidebar.orders` | `ROUTES.BOOKINGS_LIST` |

### Locale Updates
- **VI (`common.json`):** `sidebar.orders`: "Đặt hàng" -> "Quản lý Đơn hàng"
- **EN (`common.json`):** `sidebar.orders`: "Orders" -> "Bookings"

---

## 3. Page Structure & Skeleton

Verified in `src/pages/Bookings/BookingList/index.tsx`:
- **Layout:** Full width, grey background (`#F3F2EE`).
- **Sections:**
  - `BookingHeader`: Title + Export action.
  - `BookingStats`: 4 stats cards.
  - `BookingFilter`: Search + Status filters.
  - `BookingTimeline`: Card-based activity stream.
  - `Pagination`: Footer navigation.

---

## 4. Risks & Gaps

- **[LOW]** Sidebar icons are imported from `lucide-react`. If a specific icon is missing, it will fail to render. `ShoppingCart` is confirmed to exist.
- **[NOTE]** Breadcrumbs are currently handled within the header of individual pages rather than a global config.

---

## 5. Files Impacted

- **[REUSE]** `src/routes/routes.ts`
- **[REUSE]** `src/routes/index.tsx`
- **[REUSE]** `src/components/common/Sidebar.tsx`
- **[MOD]** `public/lang/vi/common.json`
- **[MOD]** `public/lang/en/common.json`
