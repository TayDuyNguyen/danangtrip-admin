# Deploy Report: Admin Bookings List

- **Date:** 2026-05-17
- **Feature Slug:** `admin-bookings-list`
- **Module:** Bookings
- **Verdict:** Ready for push

## 1. Build Status

- `npm run build` - `PASS`
- `npm run prepush:check` - `PASS`
- `npm run test:console` - `SKIPPED` because `http://localhost:5173` was not running

## 2. Fix Scope

- Added missing booking validation translations in `en` and `vi`.
- Reworked `BookingCancelDialog` to use schema-backed `react-hook-form` validation with inline error feedback and reset behavior.
- Refactored `BookingFilter` into a submit-based form with local draft state for search, selects, and dates.
- Added `BookingDetailDialog` and routed the `View` action to the dialog instead of `/admin/bookings/:id`.

## 3. Quality Notes

- Automated static gates are green: lint, typecheck, build, and prepush.
- Non-blocking build warnings remain unchanged:
  - `lottie-web` `eval` warning
  - bundle chunk size warnings above 500 kB
- No new package dependencies were introduced for this fix set.

## 4. Deployment Readiness

This slice is ready to ship from a code-quality perspective. The remaining limitation is runtime browser verification, which was not exercised in this run because no local dev server session was active for `test:console`.

## 5. Recommended Final Check

If we want one last confidence pass before production, run the admin app locally and smoke-check:

- booking list load
- filter submit/reset
- detail dialog open/close
- confirm action from card and detail dialog
- cancel dialog validation and submit flow
