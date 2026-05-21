# Route Plan: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit

## 1. Route Configuration

The route for editing a tour schedule is already registered and does not require changes to the path structure.

| Route Name | Constant | Path | Page Component |
|---|---|---|---|
| Edit Schedule | `TOURS_SCHEDULE_EDIT` | `/admin/tours/schedules/edit/:id` | `src/pages/Tours/TourScheduleEdit/index.tsx` |

## 2. Layout and Breadcrumbs

- **Parent Layout:** Uses the standard Admin Layout (Sidebar + Header + Content).
- **Breadcrumb Structure:**
  - `Quản lý Tour` (Link to `/admin/tours/list` or breadcrumb placeholder)
  - `Lịch khởi hành` (Link to `/admin/tours/schedules`)
  - `Chỉnh sửa` (Active page)

## 3. i18n Impact

New translation keys added to `schedules.json` (namespaces `schedules`):

### Fields
- `fields.departure_code`: Mã chuyến / Departure code
- `fields.departure_place`: Điểm khởi hành / Departure place
- `fields.booking_deadline`: Hạn chót đặt chỗ / Booking deadline

### Validation
- `validation.booking_deadline_before`: Hạn chót đặt chỗ phải trước hoặc cùng ngày khởi hành / Booking deadline must be before or equal to start date

## 4. Navigation & Redirects

- **On Cancel:** Redirects back to the previous page (usually `/admin/tours/schedules`).
- **On Submit Success:** Remains on the page (to allow further edits) or redirects back if `fromTourEdit` state is present.
- **On Delete Success:** Redirects to `/admin/tours/schedules`.

## 5. Files Updated

- `D:\DATN\danangtrip-admin\public\lang\vi\schedules.json`
- `D:\DATN\danangtrip-admin\public\lang\en\schedules.json`
