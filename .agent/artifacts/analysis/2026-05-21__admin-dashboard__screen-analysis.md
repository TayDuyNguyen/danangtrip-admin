# Screen Analysis: Admin Dashboard

Analysis of the **Dashboard** screen (`admin-dashboard`) in the `danangtrip-admin` repository. This analysis sets the foundation for hardening the dashboard through the `.agent` 10-step pipeline.

- **Feature Slug:** `admin-dashboard`
- **Route:** `/dashboard` (Docs mention `/admin/dashboard`, but repo reality is `/dashboard` behind the authenticated shell)
- **Role Permissions:** `🛡️ Admin / Staff` (Protected by `PrivateRoute`)
- **Date Analyzed:** 2026-05-21
- **Primary References:**
  - [admin_dashboard.md](file:///D:/DATN/DATN_Document/docs/page/admin_dashboard.md)
  - [STACK_SKILLS_INDEX.md](file:///D:/DATN/danangtrip-admin/.agent/skills/STACK_SKILLS_INDEX.md)
  - [DESIGN.md](file:///D:/DATN/danangtrip-admin/DESIGN.md)

---

## 1. Visual Composition & UI Layout

Following the design parameters of `DESIGN.md`, the dashboard is composed as a **Grid Layout** with a **Glassmorphic Surface** treatment, a base unit rhythm of `4px`, and soft corner radii of `24px` for cards.

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Breadcrumbs + Title ("Welcome back, [Name]") +                │
│          Export Report Button + Global Refresh Button                  │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 1: Stats Grid (6 cards, responsive layout 3 col / 6 col)          │
│  [Total Revenue] [Total Orders] [Total Users]                          │
│  [Tours Sold]   [Pending Ratings] [New Contacts]                       │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 2: Charts Section (Responsive 1 col / 2 col)                      │
│  [Line Chart: Revenue Trend]        [Bar Chart: Booking Status Breakdown]│
├────────────────────────────────────────────────────────────────────────┤
│  ROW 3: Secondary Charts Row (Responsive 1 col / 2 col)                │
│  [Area Chart: User Growth]          [Stacked Bar Chart: Booking Trend] │
├────────────────────────────────────────────────────────────────────────┤
│  ROW 4: Tables Section (Xếp dọc, full width)                           │
│  - [Top 5 Selling Tours Table]                                         │
│  - [Recent Bookings Table]                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Aesthetic Standards Applied
- **Harmonious Palette:** Uses `#14B8A6` (Teal) as the primary accent, `#f4fce3` (Lime Soft), and slate tones. Avoids plain primary colors.
- **Glassmorphism:** Cards have linear gradient borders `linear-gradient(to right bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0))`, subtle white background blurs, and premium shadow tokens.
- **Micro-Animations:** Entrance transition `animate-in fade-in duration-700 slide-in-from-bottom-4` is active. Icons and buttons use active scales and bounce transitions.

---

## 2. API Contract & Data Integration

The dashboard consumes a total of **8 endpoints** in a parallel, decoupled architecture to prevent network waterfalls:

1. **`GET /admin/dashboard/stats`**
   - Returns core stats counters: `total_users`, `total_tours`, `total_bookings`, `total_revenue`.
2. **`GET /admin/bookings/status-counts`**
   - Returns the counts of booking statuses for the Order Status donut chart.
3. **`GET /admin/dashboard/revenue`**
   - Returns revenue records filtered by `period` (`day`, `week`, `month`, `year`) and custom `from`/`to` ISO ranges.
4. **`GET /admin/dashboard/booking-trend`**
   - Returns booking counts over the last `days` (`7`, `30`, `90` days).
5. **`GET /admin/dashboard/user-growth`**
   - Returns user sign-ups grouped by month/week for the selected `year`.
6. **`GET /admin/dashboard/top-tours`**
   - Returns the top 5 revenue-generating tours with fields: `id`, `name`, `booking_count`, `total_revenue`.
7. **`GET /admin/bookings`**
   - Returns recent paginated booking lists filtered optionally by `booking_status`.
8. **`GET /admin/bookings/export`**
   - File export endpoint returning a spreadsheet download Blob.

### Fallback Fallbacks for Missing Stats (Resilience Mechanism)
If `/admin/dashboard/stats` omits `pending_ratings` or `new_contacts`, the app triggers parallel queries to:
- **`GET /admin/ratings?status=pending&per_page=1`**
- **`GET /admin/contacts?status=new&per_page=1`**
It wraps the responses using a fallback counter extraction in `resolveStatsWithFallback`.

---

## 3. Interaction & States

| Interactive Element | Expected UX | Implementation Check |
|---------------------|--------------|----------------------|
| **Global Refresh**  | Triggers query client invalidation (`dashboardKeys.all`) with rotating loading spin. | **Implemented** |
| **Excel Export**    | Mutates via `useBookingsExportMutation`, shows bounce loader, and triggers Sonner toasts. | **Implemented** |
| **Period Filters**  | Switches period params, updates date calculator, refetches matching charts only. | **Implemented** |
| **Table Actions**   | Page navigation and row status filters reload paginated table results without full page paint. | **Implemented** |

### Resilient States
- **Loading:** Components consume state-driven `Skeleton` blocks to maintain layout rhythm.
- **Error:** Isolated `isError` triggers show inline warning widgets rather than crashing the page.
- **Empty:** Sections present informative "0" or empty states (especially Top Tours or Bookings).

---

## 4. Discovered Implementation Gaps & Risks

During this analysis step, the following items were verified:

1. **Dashboard Charts:** The stacked bar chart specified in some layout docs as having status breakdowns for trends is currently constrained by the backend endpoint `/admin/dashboard/booking-trend`, which only returns a flat `{ date, count }` structure. The charts successfully display this trend as a flat bar chart rather than crashing.
2. **Top Tours Table:** The API endpoint `/admin/dashboard/top-tours` returns `id`, `name`, `booking_count`, and `total_revenue`, but omits `thumbnail`, `avg_rating`, and `status`. The React component [TopToursTable.tsx](file:///D:/DATN/danangtrip-admin/src/pages/Dashboard/components/TopToursTable.tsx) handles these missing parameters gracefully without displaying placeholder trash.
3. **i18n Translation Space:** All text variables (welcome texts, error text fallbacks, filter options) rely on the dedicated `dashboard` translation namespace. We will audit this namespace in `public/locales/` to ensure no raw hardcoded strings persist in the code.
