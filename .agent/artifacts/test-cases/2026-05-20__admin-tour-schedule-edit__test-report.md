# Test Report: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit
Verdict: READY

## 1. Summary

The feature `admin-tour-schedule-edit` has been fully implemented, E2E tested, and verified. All functional requirements for editing operational fields (`departure_code`, `departure_place`, `booking_deadline`), capacity validations (`totalSlots >= bookedSlots`), locale translations, and safety guards (`UnsavedChangesGuard`) are verified as **PASS**.

The automated Playwright E2E test script (`tests/tour-schedule-edit.spec.ts`) was executed successfully against a live running server at `http://localhost:5173`.

---

## 2. Phase 1: Static Gates

| Check | Result | Evidence |
|---|---|---|
| Lint | PASS | `npm run lint` exited with code `0`. 0 errors, 0 warnings. |
| Typecheck | PASS | `npm run typecheck` exited with code `0`. No typescript issues. |
| Build | PASS | `npm run build` exited with code `0`. Successful prepush check. |
| E2E Test Run | PASS | `npx playwright test tests/tour-schedule-edit.spec.ts` completed with `1 passed`. |

---

## 3. Phase 2: UI Visual, Copy, & Polish

### 2.1 Locale and Copy Verification
- **Vietnamese (vi):** Correctly rendering form titles, fields (Ngày khởi hành, Ngày kết thúc, Số người tối đa, Mã chuyến, Điểm khởi hành, Hạn chót đặt chỗ), alert banners, and action buttons. Added translation keys for `stay` ("Ở lại") and `leave` ("Rời đi") in `common.json`.
- **English (en):** Parity check completed successfully. Correctly mapped all labels. Added English translations for `stay` ("Stay") and `leave` ("Leave") in `common.json`.
- **Verdict:** PASS

### 2.2 Visual Polish and Layout
- Fits perfectly into the DaNangTrip admin layout (responsive desktop/mobile).
- **Past Schedule Alert:** Dynamic warning alert banner (`PastEventWarning`) renders correctly when a schedule's start date is in the past.
- **Occupancy Progress Bar:** Dynamic colors (Blue -> Amber -> Red) based on occupancy percentage in `ScheduleStatsBlock` are visually verified.
- **Verdict:** PASS

---

## 4. Phase 3: Functional & Edge Case Validation

### 3.1 Operations Fields Edit Flow
- Editing `departureCode`, `departurePlace`, and `bookingDeadline` works and successfully sends updates via Laravel API endpoint `PUT /api/v1/admin/tour-schedules/{id}`.

### 3.2 Capacity Limits Validation
- Frontend Yup validation throws clear inline errors when `totalSlots` is edited to be less than `bookedSlots` or is a negative number.

### 3.3 Navigation Guard (`UnsavedChangesGuard`)
- The navigation guard detects when the form is dirty (e.g. `totalSlots` modified).
- Clicking away or using sidebar links triggers a custom HeadlessUI React Transition dialog modal warning the user of unsaved changes.
- Click on "Ở lại" (Stay) keeps the user on the page. Click on "Rời đi" (Leave) proceeds to the target route.
- **Verdict:** PASS

---

## 5. Visual Evidence (Screenshots)

Below is the visual verification captured during the automated E2E test run:

### 5.1 Login & Redirection
![Login Page](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/01_login_page.png)
![Dashboard Page](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/02_dashboard_page.png)

### 5.2 Tour Schedule Edit Screen (Loaded)
![Schedule Edit Screen](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/03_loaded_schedule.png)

### 5.3 Form Validation Errors
![Validation Errors](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/04_validation_errors.png)

### 5.4 Saved Success Alert (Sonner Toast)
![Save Success](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/05_save_success.png)

### 5.5 Unsaved Changes Navigation Guard Modal
![Unsaved Changes Modal](file:///C:/Users/TUF/.gemini/antigravity-ide/brain/291742f8-09c4-4062-9569-7d1f3247df33/screenshots/06_unsaved_changes_modal.png)

---

## 6. Residual Risks

- **Server-side validation fallback:** While the frontend validates inputs strictly, backend API must continue enforcing constraints on `PUT` requests to prevent data tampering.
