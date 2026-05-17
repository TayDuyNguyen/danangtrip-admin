# Test Report: Admin Bookings List

- **Feature Slug:** `admin-bookings-list`
- **Date:** 2026-05-16
- **Sources:**
  - `package.json`
  - `.agent/artifacts/analysis/2026-05-16__admin-bookings-list__screen-analysis.md`
  - `src/pages/Bookings/BookingList/**/*`
  - `src/routes/index.tsx`
  - `src/routes/routes.ts`
  - `src/routes/PrivateRoute.tsx`
  - `src/validations/booking.schema.ts`
  - `public/lang/en/booking.json`
  - `public/lang/vi/booking.json`
- **Missing Inputs:**
  - `.agent/artifacts/interaction-specs/2026-05-16__admin-bookings-list__interaction-spec.md`
  - `.agent/artifacts/auth/2026-05-16__admin-bookings-list__auth-permissions-review.md`
- **Environment Limits:**
  - No dev server URL or credentials were provided with this skill activation.
  - `npm run prepush:check` skipped `npm run test:console` because `http://localhost:5173` was not running.
  - Browser-only phases are therefore recorded as `SKIPPED` or source-review-only.
- **Verdict:** `NOT READY`

## 1. Summary

- `PASS` Phase 1 static gates: `lint`, `typecheck`, `build`, and `prepush:check`.
- `FAIL` Phase 2 copy/i18n review: booking validation locale keys referenced by code are still missing in both `vi` and `en`.
- `FAIL` Phase 3 functional review: the card `View` action navigates to an unregistered route, and the visible Apply filter button has no handler.
- `FAIL` Phase 4 form behavior review: cancel-reason copy says optional, but schema requires it and the dialog does not apply that schema.
- `SKIPPED` Phase 5 authenticated auth/permission regression: missing feature-specific auth review plus no runnable authenticated browser session.

## 2. Phase 1 Findings

- `PASS` lint: `npm.cmd run lint` exited `0`.
- `PASS` typecheck: `npm.cmd run typecheck` exited `0`.
- `PASS` build: `npm.cmd run build` exited `0`.
- `PASS` prepush:check: `npm.cmd run prepush:check` exited `0`.
- `SKIPPED` test:console inside `prepush:check`: script output reported `Skipping Console Error Testing because server is not running at http://localhost:5173`.
- `PASS` Build completed successfully despite warnings.
- `PASS WITH WARNINGS` build output still reported non-blocking warnings about `lottie-web` `eval` usage and large chunks.

## 3. Phase 2 Findings

- `PASS` Booking locale assets exist for both `en` and `vi`.
  - Evidence: [booking.json](/D:/DATN/danangtrip-admin/public/lang/en/booking.json:1) and [booking.json](/D:/DATN/danangtrip-admin/public/lang/vi/booking.json:1)
- `FAIL` Validation copy keys referenced by the booking schema are missing from locale assets.
  - Evidence: [booking.schema.ts](/D:/DATN/danangtrip-admin/src/validations/booking.schema.ts:12) expects `booking:validation.reason_required`, `reason_min_length`, and `reason_max_length`, but neither booking locale file contains a `validation` section.
- `PASS` Visible page copy in both locale files is readable and complete for the currently defined keys.
- `SKIPPED` Desktop/tablet/mobile visual review in a browser.
  - Reason: no working dev server URL or authenticated browser session was available.
- `SKIPPED` Real loading/empty/error/disabled-state review in a browser.
  - Reason: no runtime browser session was available.

## 4. Phase 3 Findings

- `FAIL` Primary `View` action leads to a route that is not registered.
  - Evidence: [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/index.tsx:131) navigates to `/admin/bookings/${id}`, but the router only registers the list page at [index.tsx](/D:/DATN/danangtrip-admin/src/routes/index.tsx:80).
- `FAIL` The visible Apply filter button is non-functional.
  - Evidence: [BookingFilter.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingFilter.tsx:124) renders the button with no `onClick`, no `type="submit"`, and no surrounding `<form>`.
- `PASS` Search and filter state wiring exists in source for search, selects, date fields, and reset.
  - Evidence: [BookingFilter.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingFilter.tsx:19), [BookingFilter.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingFilter.tsx:28), [BookingFilter.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingFilter.tsx:32)
- `PASS` Confirm/cancel/export mutations are wired to toast callbacks and query refresh logic in source.
  - Evidence: [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/index.tsx:71), [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/index.tsx:85), [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/index.tsx:100)
- `SKIPPED` Authenticated happy-path interaction testing for list, confirm, cancel, export, and pagination.
  - Reason: no working authenticated browser session or credentials were provided.

## 5. Phase 4 Findings

- `FAIL` Cancellation UX and validation rules are inconsistent.
  - Evidence: [booking.json](/D:/DATN/danangtrip-admin/public/lang/en/booking.json:56) and [booking.json](/D:/DATN/danangtrip-admin/public/lang/vi/booking.json:56) label the reason as optional, but [booking.schema.ts](/D:/DATN/danangtrip-admin/src/validations/booking.schema.ts:10) makes it required with minimum length `5`.
- `FAIL` The cancel dialog does not apply the schema that was added for it.
  - Evidence: [BookingCancelDialog.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingCancelDialog.tsx:23) uses local `useState`, and [BookingCancelDialog.tsx](/D:/DATN/danangtrip-admin/src/pages/Bookings/BookingList/components/BookingCancelDialog.tsx:90) submits directly via `onConfirm(reason)`.
- `SKIPPED` Timeout/offline/4xx/5xx simulation.
  - Reason: no working browser/devtools session was available.
- `SKIPPED` Double-submit, rapid filter-change, and console-warning runtime checks.
  - Reason: `test:console` was skipped and the page was not exercised live.

## 6. Phase 5 Findings

- `PASS` Route protection exists for `/admin/*`.
  - Evidence: [PrivateRoute.tsx](/D:/DATN/danangtrip-admin/src/routes/PrivateRoute.tsx:15)
- `SKIPPED` Feature-specific auth/permission regression verdict.
  - Reason: the feature-specific auth review artifact is missing, and the current repo-wide pattern is `admin`-only. The analysis artifact mentions `Admin / Staff`, but that mismatch cannot be finalized as a defect without the missing auth review or a live permission matrix.
- `SKIPPED` Live protected-route redirect, session-loss, and adjacent-screen regression checks.
  - Reason: no authenticated runtime session was available.

## 7. Copy And Visual Findings

- `FAIL` Booking validation messages are referenced in code but not defined in locale assets.
- `FAIL` The Apply button presents as an actionable primary CTA but has no behavior.
- `FAIL` Cancel-reason copy says optional while the available schema requires the field.
- `SKIPPED` Visual polish review for spacing, overflow, modal layering, and responsive layout under real rendering conditions.

## 8. Console And Warning Findings

- `SKIPPED` Runtime console review.
  - Evidence: `prepush:check` explicitly skipped `test:console` because no local server was running.
- `PASS` Static toolchain produced no lint or TypeScript errors.
- `PASS WITH WARNINGS` Production build still emits non-blocking warnings about bundle size and `lottie-web` `eval` usage.

## 9. Residual Risks

- The feature has not been exercised in a real authenticated browser session, so layout, focus management, runtime API error handling, and console cleanliness remain unverified.
- Missing interaction-spec and auth-review artifacts reduce confidence that the implemented behavior matches the intended UX and permissions model.
- `NOT READY` is currently driven by source-confirmed functional issues in the `View` route, Apply button behavior, and cancel validation/copy mismatch.
