# Walkthrough: Admin Booking Management (`admin-bookings-list`)

I have successfully implemented the "Danh sách Đơn hàng" (Booking List) feature for the admin dashboard, following the project's strict Triple-Layer architecture and design system.

---

## 1. Feature Highlights

### ⚡ Modern Activity Stream UI
Instead of a traditional table, we implemented a **Timeline-based activity stream**. This provides a more intuitive view of booking activity over time.
- **Visual Indicators:** Color-coded timeline points based on booking status.
- **Detailed Cards:** Each card displays customer info, tour details, payment status, and quick actions.

### 📊 Real-time Stats
A dashboard header provides immediate visibility into key metrics:
- Total Bookings
- Pending Confirmations
- Confirmed Bookings
- Cancelled Bookings

### 🔍 Powerful Filtering
- **Fuzzy Search:** Search by customer name, email, or booking code (debounced at 300ms).
- **Status & Payment Lọc:** Multi-select compatible filters.
- **Date Range:** Filter bookings by booked date.
- **Active Tags:** Quickly see and remove active filters.

### ⚙️ Admin Actions
- **One-Tap Confirm:** Quickly move a pending booking to 'confirmed'.
- **Smart Cancellation:** Modal dialog with mandatory reason field, integrated with backend state.
- **Excel Export:** Seamless download of filtered datasets for reporting.

---

## 2. Technical Architecture

| Layer | Responsibility | Key Files |
|---|---|---|
| **API** | Communication with backend | [bookingApi.ts](file:///d:/DATN/danangtrip-admin/src/api/bookingApi.ts) |
| **Data Helper** | Types & Mappers (Raw -> ViewModel) | [booking.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/booking.mapper.ts) |
| **Hooks** | Caching, Mutations, Invalidation | [useBookingQueries.ts](file:///d:/DATN/danangtrip-admin/src/hooks/useBookingQueries.ts) |
| **UI Components** | Atomic and Organism components | `src/pages/Bookings/BookingList/components/` |
| **Validation** | Yup schemas | [booking.schema.ts](file:///d:/DATN/danangtrip-admin/src/validations/booking.schema.ts) |

---

## 3. Quality Assurance Results

### ✅ Static Gates Passed
- **Linting:** 0 errors.
- **Type Safety:** 100% strict TS compliance.
- **Build:** Production bundle generated successfully.

### ✅ Functional Verified
- [x] Correct mapping of snake_case API data to camelCase UI models.
- [x] Sidebar navigation and breadcrumbs active.
- [x] Invalidation logic: Status updates correctly refresh the Dashboard and Booking List.
- [x] i18n: verified both Vietnamese and English locales.

---

## 4. Documentation Index

- [Screen Analysis](file:///d:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-16__admin-bookings-list__screen-analysis.md)
- [API Contract](file:///d:/DATN/danangtrip-admin/.agent/artifacts/api-contracts/2026-05-16__admin-bookings-list__api-contract.md)
- [Route Plan](file:///d:/DATN/danangtrip-admin/.agent/artifacts/routing/2026-05-16__admin-bookings-list__routing.md)
- [UI Spec](file:///d:/DATN/danangtrip-admin/.agent/artifacts/ui-specs/2026-05-16__admin-bookings-list__ui-spec.md)
- [Data Integration Plan](file:///d:/DATN/danangtrip-admin/.agent/artifacts/integration/2026-05-16__admin-bookings-list__data-integration.md)
- [Test Report](file:///d:/DATN/danangtrip-admin/.agent/artifacts/test-cases/2026-05-16__admin-bookings-list__test-report.md)
