# Interaction Spec: Tổng quan hệ thống (System Dashboard)

> Feature slug: `admin-dashboard`
> Date: 2026-05-21
> Source hooks: `src/hooks/useDashboardQueries.ts`

---

## 1) Main User Actions

| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| **Global Refresh** | Click "Làm mới" (RefreshCcw) icon button | `queryClient.invalidateQueries({ queryKey: dashboardKeys.all })` | Icon spins (`animate-spin`), buttons are disabled, fresh data loaded on all charts/tables | Toast error via `sonner` if critical queries fail |
| **Export Report** | Click "Xuất báo cáo" (Download) button | `exportMutation.mutate({ from_date, to_date })` | Toast success + download booking Excel sheet as `*.xlsx` | Toast "Xuất báo cáo thất bại" |
| **Change Revenue Period** | Tab buttons selection (Day / Week / Month / Year) on Revenue Card | `useRevenueQuery({ period, from, to })` | Recharts animates transition smoothly; Total revenue badge updates | Widget displays error state with a reload button |
| **Change Booking Trend Period** | Tab buttons selection (7 / 30 / 90 days) on Booking Trend Card | `useBookingTrendQuery({ days })` & `useTopToursQuery({ limit, from, to })` | Recharts animates columns count; Top selling tours list refetched and refreshed | Card-level error widget with reload button |
| **Individual Widget Refresh** | Hover card header + Click widget reload icon button | `query.refetch()` | Inline loading skeleton / spinner inside header; visual updates | Display localized error fallback state |
| **Filter Bookings by Status** | Status tags selection (All, Pending, Confirmed, Completed, Cancelled) on Recent Orders table | `useBookingsQuery({ page, booking_status })` | Table list updates; resets page param to 1 | Shows table-level error state with retry action |
| **Bookings Pagination** | Page buttons or Chevrons click in Recent Orders footer | `useBookingsQuery({ page, booking_status })` | Table list displays page-specific bookings; updates "Showing X-Y of Z" copy | Renders skeleton loaders; locks page navigation |

## 1.1) Action Priority

| Action | Priority | Why |
|---|---|---|
| **Global & Widget Refresh** | High | Admins rely on real-time booking trends and incoming revenue records. |
| **Filter & Pagination** | High | Primary navigation tool to drill down on recent customer purchases and booking backlogs. |
| **Export Report** | Medium | Vital operational and accounting activity performed periodically. |
| **Revenue / Trend Ranges** | Medium | Interactive analytic switches supporting trend evaluation. |

---

## 2) Forms

*There are no direct creation/update form operations inside the Dashboard page. This screen is primarily analytical and read-only. Standard forms are deferred to specific child modules (Tours, Bookings, Schedules, Payments, and Reviews).*

---

## 3) Filters / Search / Pagination

| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| **Revenue Period** | `revenue_period` URL Search Param | Yes | None | Synchronized with `revenue_period` key. Defers to `'day'` if empty. |
| **Booking Trend Days** | `trend_days` URL Search Param | Yes | None | Synchronized with `trend_days` key. Defers to `30` if empty. |
| **Bookings Page** | `page` URL Search Param | Yes | None | Controls the page numbering on the Recent Bookings table. Resets to 1 when status filter changes. |
| **Bookings Status Filter** | `status` URL Search Param | Yes | None | Limits Recent Orders query to a specific status: `pending`, `confirmed`, `completed`, `cancelled`. |

## 3.1) Default Values / Reset Logic

| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| `revenue_period` | `'day'` | Reverts to `'day'` upon clearing filters or manual reset | Triggers standard query range |
| `trend_days` | `30` | Reverts to `30` upon manual page reset | Controls both booking trend graph & top tours list |
| `page` | `1` | Resets to `1` when status filter updates or search state is reset | Avoids out-of-bounds queries |
| `status` | `""` (All) | Cleared to empty string to fetch all bookings | Fetches unfiltered paginated orders list |

---

## 4) Confirm / Destructive Actions

*There are no destructive actions on this page. All critical mutations (e.g., cancelling bookings, editing rates, or deleting schedules) must be done from their respective detailed routes/modals containing secure `ConfirmDialog` guards.*

---

## 4.1) Loading / Pending Behavior

| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| **Global Refreshing** | Global state `refreshing === true` -> spins refresh icon | Refresh button and Export button disabled | Avoids concurrent overlapping fetches |
| **Exporting Spreadsheet** | Export button icon shows bounce animation, label changes to `exporting` | Export button disabled | Prevents double clicks |
| **Filter Transitions** | Component-specific `Skeleton` loaders mounted in charts / tables | Page switches and buttons inside card headers are locked | Eliminates layout shift |

---

## 5) i18n Keys To Add

All translation keys are perfectly integrated under the `dashboard` namespace in Vietnamese (`/public/lang/vi/dashboard.json`) and English (`/public/lang/en/dashboard.json`).

---

## 6) Risks / Open Questions

- **R-01 (URL Sync Complexity):** Setting multiple search params via standard React Router triggers consecutive renders.
  *Mitigation:* Coalesce search parameter state updates into unified `setSearchParams` transactional blocks to ensure a single network trigger.
- **R-02 (Rate Limiting on Fast Refresh):** Clicking the global refresh button repeatedly can overload the gateway.
  *Mitigation:* Global refresh includes a blocking disabled state during load (`disabled={refreshing}`) to rate-limit triggers.
