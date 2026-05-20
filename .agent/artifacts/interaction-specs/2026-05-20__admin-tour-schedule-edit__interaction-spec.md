# Interaction Spec: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit

## 1. Form Interactions

### Validation
- **Requirement:** `startDate`, `endDate`, `totalSlots` are mandatory.
- **Constraints:**
  - `endDate` >= `startDate`.
  - `totalSlots` >= `bookedSlots` (only in Edit mode).
  - `bookingDeadline` <= `startDate`.
- **Feedback:** Inline red text under inputs + red border on focus.

### Date Selection
- Uses browser default date picker (via `TextInput type="date"`).
- Icons provided in the left area of the input.

## 2. Navigation Protection

### `UnsavedChangesGuard`
- **Trigger:** Any change to the form (`isDirty` is true).
- **Behavior:**
  - If user clicks a link or back button: Modal appears.
  - "Stay": Close modal, remain on page.
  - "Leave": Discard changes and proceed to destination.

## 3. Destructive Actions

### Delete Schedule
- **Trigger:** "Xóa lịch này" button at the bottom of the form.
- **Flow:**
  - Open `ScheduleDeleteDialog`.
  - Display warning about existing bookings.
  - Confirm: Call `useDeleteSchedule` mutation.
  - On Success: Redirect to schedules list.

## 4. Notifications (Sonner)

- **Save Success:** "Cập nhật lịch thành công!"
- **Save Error:** "Có lỗi xảy ra khi cập nhật lịch."
- **Delete Success:** "Xóa lịch khởi hành thành công!"

## 5. Visual Polish

- **Stats Progress Bar:** Dynamic colors (Blue -> Amber -> Red) based on occupancy percentage.
- **Past Schedule Alert:** Visible at the top of the form if the schedule start date is in the past.
