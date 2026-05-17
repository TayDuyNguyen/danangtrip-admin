# Test Report: Admin Payment List

- Feature slug: `admin-payment-list`
- Date: `2026-05-17`
- Verdict: `NOT READY`

## 1. Summary

Static quality gates passed successfully for `admin-payment-list`.
No blocking lint, typecheck, build, or prepush failures were found in the current codebase state.

However, code inspection found at least two user-facing functional risks that should block release confidence:

- payment rows link to `${ROUTES.BOOKINGS_LIST}/${payment.id}` even though the router currently exposes only `/admin/bookings` list and does not register a booking detail route
- route access is implemented as `admin` only, while the screen docs and prompt context still describe the feature as `Admin / Staff`

Browser-based QA phases were not executed because no working dev server URL/session was available for the required screen review.
Additionally, the expected `07-interactions` and `08-auth-permissions` artifacts for `admin-payment-list` were not present at test time, so downstream traceability is incomplete.

## 2. Phase 1 Findings

- PASS - `lint`: completed successfully with 0 reported errors.
- PASS - `typecheck`: completed successfully with no TypeScript errors.
- PASS - `build`: completed successfully.
- PASS - `prepush:check`: passed all configured gates.
- NOTE - Initial `npm` invocation failed because PowerShell script execution is disabled on this machine; reran successfully via `npm.cmd`.

## 3. Phase 2 Findings

- NOT RUN - UI visual, copy, and polish review was not executed because no dev server/browser session was available.
- Required URL from skill was not provided: `http://localhost:5173`.
- CODE FINDING - multiple source files still contain mojibake or broken Vietnamese fallback copy in source literals, which increases i18n and copy-quality risk even though the browser pass was not executed.

## 4. Phase 3 Findings

- NOT RUN - Functional flow testing was not executed because browser-based testing prerequisites were unavailable.
- FAIL (code inspection) - booking navigation from payment rows is likely broken.
  Evidence: [PaymentTable.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx) links to `${ROUTES.BOOKINGS_LIST}/${payment.id}`, but [routes.ts](/D:/DATN/danangtrip-admin/src/routes/routes.ts) and [index.tsx](/D:/DATN/danangtrip-admin/src/routes/index.tsx) only register the bookings list route.

## 5. Phase 4 Findings

- NOT RUN - Edge-case testing was not executed because browser-based testing prerequisites were unavailable.

## 6. Phase 5 Findings

- NOT RUN - Regression testing was not executed because browser-based testing prerequisites were unavailable.

## 7. Copy And Visual Findings

- NOT RUN - No browser review evidence captured.

## 8. Console And Warning Findings

- PASS - `prepush:check` completed.
- SKIPPED - automated console-error browser test was skipped by the project script because no server was running at `http://localhost:5173`.
- WARNING - production build emitted a third-party warning from `lottie-web` about `eval`.
- WARNING - production build emitted chunk-size warnings for bundles larger than 500 kB.

## 9. Residual Risks

- Browser UI for `/admin/payments` was not validated on desktop, tablet, or mobile.
- Copy/i18n issues, layout regressions, modal-focus issues, and runtime console warnings on the real screen may still exist.
- Auth and permission behavior for `admin-payment-list` was not verified in-browser.
- Documentation and implementation disagree on whether `staff` may access this screen.
- Refund validation is stricter on the frontend (`max 255`) than the backend request rule (`max 1000`), which is not blocking but is a contract mismatch.
- The expected `interaction-spec` and `auth-permissions-review` artifacts for `admin-payment-list` were not available for full phase traceability.

## 10. Recommended Next Step

1. Fix booking row navigation to use a real registered route or remove the dead link.
2. Resolve the permission contract mismatch between docs/prompt and `PrivateRoute`.
3. Align frontend refund validation with backend request limits if intended.
4. Start the dev server for `danangtrip-admin`.
5. Re-run `09-testing` with:
   - Dev server URL
   - Feature URL
   - Login credentials if auth is required
