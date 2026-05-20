# Screen Analysis: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit
Source Docs: [admin_tour_schedules_edit.md](file:///D:/DATN/DATN_Tài liệu/docs/page/admin_tour_schedules_edit.md)

## 1. Summary and Scope

- **Screen Name:** Chỉnh sửa lịch khởi hành
- **Feature Slug:** `admin-tour-schedule-edit`
- **Objective:** Finalize the hardening of the tour schedule edit screen. Ensure full parity with operational requirements (departure info, booking stats) and protect data integrity (unsaved changes guard, deletion safety).
- **Actor:** Admin / Staff
- **Module:** Tour Operations

## 2. Design and Token Audit (Against DESIGN.md)

- **Layout:** Reuses `TourScheduleCreate` layout (centered column, max-width 680px). Matches design system tokens.
- **Colors:** Uses `bg-slate-50` for page background and `white` for form cards. Highlights use teal (`#14b8a6`) and amber (`#F59E0B`).
- **Typography:** Uses Inter font family. Title is 3xl font-bold.
- **Mismatch found:** The doc specifies `bg #FEF3C7` for the info box, which is amber-50/100. The current implementation uses `bg-amber-50/50`. This is acceptable but could be more vibrant to match "premium" aesthetics.

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `ScheduleForm` | [REUSE] | Molecule | `src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx` | Reused from create flow. |
| `ScheduleStatsBlock` | [MOD] | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleStatsBlock.tsx` | Needs to add "Đã đặt", "Còn trống", "Tối đa" grid and progress bar as per doc. |
| `TourInfoBox` | [REUSE] | Molecule | `src/pages/Tours/TourScheduleCreate/components/TourInfoBox.tsx` | Basic tour context. |
| `ScheduleInfoBox` | [NEW] | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleInfoBox.tsx` | **Missing.** Needs to show Schedule date + status badge (CÒN CHỖ, v.v.). |
| `UnsavedChangesGuard` | [NEW] | Molecule | `src/components/common/UnsavedChangesGuard.tsx` | **Missing.** Need a reusable guard for navigation. |
| `ScheduleDeleteDialog`| [MOD] | Organism | `src/pages/Tours/TourSchedules/components/ScheduleDeleteDialog.tsx` | Needs to add warning if `bookedSlots > 0`. |

## 4. UI States

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Page Header | Skeleton title/breadcrumb | N/A | Toast error | N/A |
| Schedule Form | `LoadingReact` spinner (full page) | N/A | Field validation (Yup) | Toast success |
| Stats Block | Skeleton grid | 0/0 stats | N/A | Live calculation |
| Delete Dialog | N/A | N/A | Toast error | Toast success + Redirect |

## 5. Data and API Analysis

| Field | Type | Required | Validation | Source Endpoint |
|---|---|---|---|---|
| `start_date` | `date` | ✓ | Must be >= today (warning if past) | `PUT /admin/tour-schedules/{id}` |
| `end_date` | `date` | ✓ | Must be >= start_date | `PUT /admin/tour-schedules/{id}` |
| `max_people` | `number` | ✓ | min 0, **>= booked_people** | `PUT /admin/tour-schedules/{id}` |
| `status` | `string` | ✓ | enum: available, full, cancelled | `PUT /admin/tour-schedules/{id}` |
| `price_adult` | `number` | ✗ | min 0 | `PUT /admin/tour-schedules/{id}` |
| `departure_code` | `string` | ✓ | **[MISSING IN DB]** | Needs backend migration |
| `departure_place`| `string` | ✓ | **[MISSING IN DB]** | Needs backend migration |
| `booking_deadline`| `date` | ✗ | **[MISSING IN DB]** | Needs backend migration |

**[ASSUMPTION]**: To meet the 100% "hardening" requirement from the doc, we need to add `departure_code`, `departure_place`, and `booking_deadline` to the backend.

## 6. Business Rules and Edge Cases

- **BR-01**: `max_people` cannot be less than `booked_people`. The UI must block this or show a critical validation error.
- **BR-02**: If `start_date` is in the past, show a persistent warning banner ("Lịch này đã khởi hành...").
- **BR-03**: Deleting a schedule with `booked_people > 0` should be blocked or show a severe warning (doc says "Hãy hủy tất cả đơn đặt trước khi xóa lịch").
- **EC-01**: User tries to leave the page with unsaved changes. Show "Unsaved Changes Guard" modal.
- **EC-02**: API returns 422 for `max_people` mismatch. Handle and show server-side error in form.

## 7. Handoff to Next Steps

- **03-types-api-contract**: Update `Schedule` interface and Mapper to include the new operational fields. Create backend migration for `tour_schedules`.
- **05-ui-components**: Implement `ScheduleInfoBox` and `UnsavedChangesGuard`. Update `ScheduleStatsBlock` to match the 3-column grid design.
- **07-interactions**: Implement the "Unsaved changes" detection using `react-hook-form`'s `isDirty` and `react-router-dom`'s `useBlocker`.
- **08-auth-permissions**: Ensure delete button is only visible to roles with delete permission.
