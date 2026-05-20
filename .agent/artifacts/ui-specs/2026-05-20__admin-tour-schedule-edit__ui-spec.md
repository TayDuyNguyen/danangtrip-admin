# UI Spec: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit

## 1. Component Strategy

| Component | Layer | Path | Status | Reason |
|---|---|---|---|---|
| `ScheduleForm` | Molecule | `src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx` | [MOD] | Add `departureCode`, `departurePlace`, `bookingDeadline` fields. |
| `ScheduleStatsBlock` | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleStatsBlock.tsx` | [MOD] | Polish grid and progress bar color logic. |
| `ScheduleInfoBox` | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleInfoBox.tsx` | [NEW] | Display date/tour context in header. |
| `UnsavedChangesGuard` | Common | `src/components/common/UnsavedChangesGuard.tsx` | [NEW] | Reusable navigation guard. |
| `TourInfoBox` | Molecule | `src/pages/Tours/TourScheduleCreate/components/TourInfoBox.tsx` | [REUSE] | Basic tour context. |

## 2. Component Details

### `ScheduleForm` (Modified)
- **New Section:** "Operational Information" (Thông tin vận hành)
- **Fields:**
  - `departureCode`: TextInput, leftIcon `ri-qr-code-line`.
  - `departurePlace`: TextInput, leftIcon `ri-map-pin-2-line`.
  - `bookingDeadline`: TextInput (date), leftIcon `ri-time-line`.
- **Validation:** Visual error feedback using `errors` from `useFormContext`.

### `ScheduleStatsBlock` (Modified)
- **Grid:** 3 columns (Booked, Available, Max).
- **Progress Bar:** 
  - 0-60%: Blue (`#0066CC`)
  - 61-89%: Amber (`#F59E0B`)
  - 90-100%: Red (`#EF4444`)
- **Warning Info:** Visible only if `booked > 0`.

### `ScheduleInfoBox` (New)
- **Purpose:** High-level schedule context in the page header.
- **Visual:** `bg-amber-50` border-amber-200.
- **Content:** Date range + Tour Name + Status Badge (AVAILABLE/CANCELLED).

### `UnsavedChangesGuard` (New)
- **Props:** `isDirty: boolean`.
- **Logic:** Uses `useBlocker` (React Router 7) to intercept navigation.
- **Visual:** Modal dialog with "Continue Editing" and "Discard Changes".

## 3. UI States

| State | Feedback |
|---|---|
| Loading | Full page spinner (`LoadingReact`). |
| Saving | Submit button `isLoading={true}` + disabled. |
| Error | Form field error messages (Yup) + Toast error. |
| Success | Toast success ("Cập nhật lịch thành công!"). |

## 4. Build Order

1.  `UnsavedChangesGuard.tsx` (Shared component)
2.  `ScheduleInfoBox.tsx` (Page local)
3.  Modify `ScheduleForm.tsx`
4.  Modify `ScheduleStatsBlock.tsx`
5.  Update `TourScheduleEdit/index.tsx` to assemble everything.
