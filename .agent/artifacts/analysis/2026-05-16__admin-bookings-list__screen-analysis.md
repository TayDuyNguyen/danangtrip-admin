# Screen Analysis: Danh sách Đơn hàng (Admin Bookings List)

- **Feature Slug:** `admin-bookings-list`
- **Route:** `/admin/bookings`
- **Artifact Type:** `screen-analysis`
- **Date:** 2026-05-16
- **Sources Used:**
  - `D:\DATN\DATN_Document\docs\page\admin_bookings_list.md`
  - `D:\DATN\DATN_Document\screen\3_Admin_Flows\10-Danh_Sach_Don_Hang.html`
  - `src/constants/endpoints.ts`
  - `DESIGN.md`

---

## 1. Summary and Scope

- **Screen Name:** Danh sách Đơn hàng (Booking List)
- **Objective:** Provide administrators and staff with a centralized interface to manage all tour bookings, including filtering, status updates (confirm/cancel), and exporting data.
- **Primary Actor:** Admin / Staff
- **Module:** Đơn hàng & Thanh toán (Orders & Payments)

---

## 2. Design and Token Audit

Based on `DESIGN.md` and `10-Danh_Sach_Don_Hang.html`:

- **Layout Style:** Vertical Timeline / Card-based activity stream. This deviates from the standard Table view but is chosen for higher visual impact and modern feel as per prototype.
- **Colors:**
  - **Primary:** `#3B82F6` (Blue)
  - **Success:** `#10B981` (Green)
  - **Warning:** `#F59E0B` (Yellow)
  - **Error/Cancelled:** `#EF4444` / `#CD5C5C` (Red)
  - **Surface:** `#FFFFFF` (White cards)
  - **Background:** `#F3F2EE` (Light grey page)
- **Typography:** Inter (Primary), Quicksand (Heading)
- **Spacing:** 16px (card p), 24px (section mb)
- **Borders:** 1px solid `#E2E8F0`, 16px radius for cards.

---

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `BookingList` | [NEW] | Page | `src/pages/Bookings/BookingList/index.tsx` | Main container for the feature. |
| `BookingStats` | [NEW] | Section | `src/pages/Bookings/BookingList/components/BookingStats.tsx` | Summary cards for quick stats overview. |
| `BookingFilterBar` | [NEW] | Molecule | `src/pages/Bookings/BookingList/components/BookingFilterBar.tsx` | Specialized filter bar with search, selects, and date range. |
| `BookingTimeline` | [NEW] | Organism | `src/pages/Bookings/BookingList/components/BookingTimeline.tsx` | Container for the list of bookings with vertical journey line. |
| `BookingCard` | [NEW] | Molecule | `src/pages/Bookings/BookingList/components/BookingCard.tsx` | Individual booking item in the timeline. |
| `BookingStatusBadge`| [NEW] | Atom | `src/pages/Bookings/BookingList/components/BookingStatusBadge.tsx` | Badge for booking and payment statuses. |
| `CancelBookingDialog`| [NEW] | Organism | `src/pages/Bookings/BookingList/components/CancelBookingDialog.tsx` | Confirmation modal for cancellation with reason input. |
| `DetailedPagination` | [REUSE] | Molecule | `src/components/pagination/DetailedPagination.tsx` | Existing standard pagination. |
| `Button` | [REUSE] | Atom | `src/components/ui/Button.tsx` | Atomic button component. |
| `CustomSelect` | [REUSE] | Atom | `src/components/ui/CustomSelect.tsx` | Standardized select for filters. |

---

## 4. UI States (Per Section)

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| **Stats Row** | 4 Skeleton cards | Show 0 values | Hide or show error icon | Render counts |
| **Booking List** | `BookingTimelineSkeleton` (5 items) | SVG Icon + "Không tìm thấy đơn hàng nào" | Inline error + "Thử lại" button | Render timeline cards |
| **Filter Bar** | Skeleton inputs | Render with default values | Toast notification | N/A |
| **Cancel Dialog**| Button loading state | N/A | Toast error message | Close modal + Toast success |

---

## 5. Data and API Analysis

| Field | Type | Required | Validation | Source Endpoint |
|---|---|---|---|---|
| `id` | `number` | ✓ | — | `GET /admin/bookings` |
| `booking_code` | `string` | ✓ | — | `GET /admin/bookings` |
| `customer_name` | `string` | ✓ | — | `GET /admin/bookings` |
| `customer_email`| `string` | ✓ | email format | `GET /admin/bookings` |
| `tour_name` | `string` | ✓ | — | `GET /admin/bookings` |
| `total_price` | `number` | ✓ | min 0 | `GET /admin/bookings` |
| `booking_status`| `enum` | ✓ | pending/confirmed/completed/cancelled | `GET /admin/bookings` |
| `payment_status`| `enum` | ✓ | pending/paid/refunded | `GET /admin/bookings` |
| `departure_date`| `string` (ISO)| ✓ | — | `GET /admin/bookings` |
| `created_at` | `string` (ISO)| ✓ | — | `GET /admin/bookings` |

---

## 6. Business Rules and Edge Cases

- **BR-01 (Status Transition):** Only `pending` bookings can be `confirmed`.
- **BR-02 (Cancellation):** Both `pending` and `confirmed` bookings can be `cancelled`.
- **BR-03 (Export):** The Excel export should respect the current active filters applied in the UI.
- **EC-01 (Departure Alert):** Bookings with departure dates within the next 7 days should display a "SẮP TỚI" (Upcoming) badge.
- **EC-02 (Empty Filter):** If no results match the filter, show a clear empty state with a "Reset filters" action.

---

## 7. Handoff to Next Steps

- **03-types-api-contract:** Need to define `RawBooking` and `BookingViewModel`. API module `bookingApi.ts` should be created.
- **04-layout-routing:** Register `/admin/bookings` in `src/routes/routes.ts`. Update `Sidebar.tsx`.
- **05-ui-components:** Focus on the `journey-line` CSS and `BookingCard` layout.
- **Auth:** Standard `admin`/`staff` guard required.

---

## 8. Open Questions / Assumptions

- **[ASSUMPTION]** The `journey-line` is purely decorative and does not represent a strict sequence between different orders, but rather an aesthetic "activity feed" connection.
- **[OPEN QUESTION]** Does the backend support `cancellation_reason` in the `PATCH /admin/bookings/{id}/status` call? (Docs say yes, but needs verification in code).
