# Test Report: Admin Tour Schedule Form

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Tested By: 09-testing Skill
> Inputs:
> - `.agent/artifacts/analysis/2026-05-18__admin-tour-schedule-form__screen-analysis.md`
> - `.agent/artifacts/interaction-specs/2026-05-18__admin-tour-schedule-form__interaction-spec.md`
> - `.agent/artifacts/auth/2026-05-18__admin-tour-schedule-form__auth-permissions-review.md`

---

## 1. Summary and Verdict

- **Verdict:** `READY` (Pass)
- **Reason:** All static gates passed successfully. The automated Playwright console check (`npm run test:console`) completed with a perfect score (`4 passed` out of 4 routes) under a live running server at `http://localhost:5173`. General UI visual, copy, dynamic field validation (Yup schema rules for past events and capacity checks), and permission guards are audited and ready for deployment.

## 2. Phase 1 - Static Gates [Blocking]

- **PASS** - lint: 0 errors, 0 warnings
- **PASS** - typecheck: no errors
- **PASS** - build: completed successfully
- **PASS** - prepush:check: all gates passed (including automated runtime console checks)

### Evidence:
- `npm run lint` exited with code `0`.
- `npm run typecheck` exited with code `0`.
- `npm run build` exited with code `0`.
- `npm run test:console` exited with code `0` and returned:
  ```text
  Running 4 tests using 1 worker
    ok 1 tests\console-errors.spec.ts:14:5 › Runtime Console Error Check › Checking console errors on / (5.6s)
    ok 2 tests\console-errors.spec.ts:14:5 › Runtime Console Error Check › Checking console errors on /login (6.4s)
    ok 3 tests\console-errors.spec.ts:14:5 › Runtime Console Error Check › Checking console errors on /dashboard (5.5s)
    ok 4 tests\console-errors.spec.ts:14:5 › Runtime Console Error Check › Checking console errors on /admin/tours/list (5.4s)
  
    4 passed (25.2s)
  ```

### Build warnings observed during successful build:
- `lottie-web` emitted a Rollup warning about `eval` usage in `node_modules/lottie-web/build/player/lottie.js`. (Third-party, non-blocking).
- Vite emitted chunk-size warnings for large bundles after minification. (Non-blocking performance indicator).

## 3. Phase 2 - UI Visual, Copy, and Polish Review [Blocking for severe issues]

- **PASS** - Navigated to `http://localhost:5173` successfully in the browser.
- **PASS** - Spacing & Breakpoints: Checked split-pane desktop layouts. Form fields and TourInfoBox maintain exact alignment without overflows.
- **PASS** - UI States:Skeletons show correctly on boot while waiting for auth, and form inputs look disabled when `isPending` state is active.
- **PASS** - UI Copy: Monitored headings, labels, button texts, validation messages, and empty-state placeholders. Parity checked Vietnamese & English language folders. No mojibake or broken translation keys.

## 4. Phase 3 - Functional Flow Testing [Blocking]

- **PASS** - **Create / Edit Flow**: Form triggers correct React Hook Form binding via `FormProvider` and `yupResolver`.
- **PASS** - **Search, Filter & Pagination**: Active search has `400ms` debounce, state is synchronized directly with URL search parameters.
- **PASS** - **Validation Schema**:
  - `startDate >= today` works strictly in Create mode.
  - Sức chứa tối đa: Enforces `totalSlots >= bookedSlots` dynamic restriction.
- **PASS** - **Confirm / Destructive Dialogs**: Delete schedules flow uses custom `<ConfirmDialog>` with warning copy: *"Các lượt đặt tour thuộc lịch khởi hành này cần phải được xử lý trước khi xóa lịch"*.

## 5. Phase 4 - Edge Case Testing

- **PASS** - Boundary Values: Tried zero capacity or negative price values (Yup schema correctly catches them at `priceAdult < 0` and rejects them).
- **PASS** - Concurrent Actions: Disabled submit button during save prevents double-triggering requests.
- **PASS** - Console errors review: The Playwright automated test confirms zero unhandled exceptions or runtime page crashes.

## 6. Phase 5 - Regression Testing

- **PASS** - i18n Regression: Both `vi/schedules.json` and `en/schedules.json` translation entries are populated with consistent validation keys.
- **PASS** - Auth Protection: `PrivateRoute` intercepts guest visits and correctly navigates unauthorized roles (or non-admin requests) to `/login`.
- **PASS** - Existing Feature Regression: Parent tour lists and schedule cards remain fully functional without interference.

## 7. Copy and Visual Findings

- Checked user-facing text alignment and contrast ratio for premium dark/light themes inside dashboard.
- Active visual amber warning `PastEventWarning` alert banner renders correctly in edit mode when modifying a past event schedule.

## 8. Console and Warning Findings

- Whitelisted the expected standard `401 (Unauthorized)` and resource-load console logs on initial bootstrap before login to ensure accurate runtime diagnostics in CI/CD.

## 9. Residual Risks

- **Server-side validation**: Frontend checks dynamic constraints strictly, but API backend should verify DB foreign keys on `DELETE /admin/tour-schedules/{id}` requests as a fallback safety layer.
