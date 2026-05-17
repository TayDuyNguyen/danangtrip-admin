# Screen Analysis: Danh sách Đơn hàng (Booking List)

- **Feature Slug:** `admin-bookings-list`
- **Route:** `/admin/bookings`
- **Artifact Type:** `screen-analysis`
- **Date:** 2026-05-16

---

## 1. Visual Overview (Source: `10-Danh_Sach_Don_Hang.html`)

The prototype HTML shows a modern, clean admin interface with:
- **Timeline-style list items** (instead of a traditional table) which provides a richer visual representation of each booking.
- **Stats row** at the top for quick overview.
- **Filter bar** with search, status dropdowns, and date range.
- **Pagination** at the bottom.
- **Confirm Cancel Modal** for order cancellation.

### Key Visual Components:
- **Sidebar**: Dark themed (existing component).
- **Header**: Breadcrumbs, Title, Subtitle, and "Xuất Excel" button.
- **Stats Row**: 4 cards (Total, Pending, Confirmed, Cancelled).
- **Filter Bar**: Search input + 2 Selects (Status, Payment) + 2 Date inputs + "Filter" button + "Reset" button.
- **Timeline/List View**:
    - Each item is a card.
    - Status badges (Booking status & Payment status).
    - Customer info (Avatar, Name, Email).
    - Tour info (Thumbnail, Name, Category).
    - Booking details (Order ID, Amount, Booking Date, Departure Date).
    - Action buttons (View, Confirm, Cancel).
- **Pagination**: Centered/Right aligned pagination controls.

---

## 2. Component Breakdown

| Component | Responsibility | Patterns to reuse |
|-----------|----------------|-------------------|
| `BookingList` | Main container, state management (pagination, filters). | `TourList/index.tsx` |
| `BookingHeader` | Breadcrumbs, Title, Export button. | `TourHeader.tsx` |
| `BookingStats` | Displays aggregate counts. | `TourStats.tsx` |
| `BookingFilter` | Search and dropdown filters. | `TourFilter.tsx` |
| `BookingItem` | Individual timeline/card representation of a booking. | New (based on HTML) |
| `BookingTimeline` | Container for the list of items with the vertical line. | New (based on HTML) |
| `BookingCancelDialog` | Confirmation modal for cancelling. | `TourDeleteDialog.tsx` |
| `Pagination` | Standard pagination component. | `@/components/common/Pagination` |

---

## 3. Data Requirements & API Mapping

### 3.1 Data Model (`BookingItem`)
Based on `admin_bookings_list.md` and `RawBookingItem`:
- `id`: number
- `booking_code`: string (e.g., "#BK-1008")
- `customer`: { name, email, avatar }
- `tour`: { name, thumbnail, category }
- `booked_at`: string (datetime)
- `departure_date`: string (date)
- `total_amount`: number
- `booking_status`: `pending` | `confirmed` | `completed` | `cancelled`
- `payment_status`: `pending` | `paid` | `refunded`
- `cancellation_reason`?: string

### 3.2 Endpoints
- **List/Search/Filter**: `GET /api/v1/admin/bookings`
    - Params: `page`, `per_page`, `status`, `payment_status`, `date_from`, `date_to`, `search`
- **Stats**: `GET /api/v1/admin/bookings/status-counts` (or reused from dashboard stats)
- **Update Status**: `PATCH /api/v1/admin/bookings/{id}/status`
    - Body: `{ booking_status: string }`
- **Export**: `GET /api/v1/admin/bookings/export`

---

## 4. Technical Implementation Strategy

1. **API Layer**:
    - Create `src/api/bookingApi.ts` (extract from `dashboardApi.ts`).
    - Define endpoints in `API_ENDPOINTS.BOOKINGS`.
2. **Data Transformation**:
    - Create `src/dataHelper/booking.dataHelper.ts`.
    - Create `src/dataHelper/booking.mapper.ts`.
3. **Hooks**:
    - Create `src/hooks/useBookingQueries.ts` (migrate from `useDashboardQueries.ts`).
4. **UI Components**:
    - Use `lucide-react` or `Material Symbols` (repo uses Material Symbols in prototype, check repo preference).
    - Implement components sequentially.
    - Use `Tailwind CSS` for styling as per prototype HTML.

---

## 5. Potential Challenges
- **UI Consistency**: The prototype uses a "Timeline" view while other lists in the repo (`Tours`, `Locations`) use `TanStack Table`. I will implement the Timeline view as it is the "Recommended Screen" visual, but ensure it uses the same data-fetching and pagination patterns as the tables.
- **Bulk Actions**: `admin_bookings_list.md` mentions bulk actions for a Table, but the Timeline HTML doesn't show checkboxes. I will follow the Table requirements if bulk actions are prioritized, or adapt the cards to include selection if needed. *Decision: Start with the Card/Timeline view as per HTML, but leave room for selection.*

---

## Approval Required
- [ ] Visual style: Timeline/Card view vs. Traditional Table?
- [ ] API structure: Move booking endpoints to a new `bookingApi.ts`?
