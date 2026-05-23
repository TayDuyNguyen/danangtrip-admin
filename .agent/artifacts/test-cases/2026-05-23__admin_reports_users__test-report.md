# QA Test Report: Báo cáo Người dùng (Users Report)

- **Feature Slug**: `admin_reports_users`
- **Verdict**: `READY`
- **Last Updated**: 2026-05-23
- **Step**: `09-testing`
- **Scope**: `src/pages/Reports/UsersReport/`, `src/hooks/useReportQueries.ts`, `src/dataHelper/report.dataHelper.ts`, `src/dataHelper/report.mapper.ts`, `src/api/reportApi.ts`
- **Test runner**: Playwright (`@playwright/test`) + `npm run prepush:check`

---

## 1. Test Summary

This test report documents all automated quality gate results and Playwright runtime console-error checks performed for the **Báo cáo Người dùng (Users Report)** page at `http://localhost:5173/admin/reports/users`.

| Metric | Result |
| :--- | :--- |
| **Final QA Verdict** | ✅ **READY** |
| **Lint** | ✅ PASS — 0 errors, 0 warnings |
| **Typecheck** | ✅ PASS — 0 TypeScript errors |
| **Production Build** | ✅ PASS — `vite build` succeeded in ~13s |
| **prepush:check** | ✅ PASS — All 4 gates passed |
| **Playwright Console Check** | ✅ PASS — 5/5 routes passed (including `/admin/reports/users`) |

---

## 2. Phase 1 — Static Quality Gates

All commands were executed live in the terminal in `d:\DATN\danangtrip-admin`.

### 2.1 Command Results

| Gate | Command | Status | Output Summary |
| :--- | :--- | :--- | :--- |
| **Linting** | `npm run lint` | ✅ **PASS** | ESLint exited with code 0, 0 errors, 0 warnings |
| **Typecheck** | `npm run typecheck` | ✅ **PASS** | `tsc -b` exited with code 0, 0 type errors |
| **Build** | `npm run build` | ✅ **PASS** | Vite v7.3.2, 3608 modules transformed, built in ~14s |
| **Prepush Gate** | `npm run prepush:check` | ✅ **PASS** | All steps passed: Lint → Typecheck → Build → Console Tests |

### 2.2 Build Bundle Notes (non-blocking)

The following vendor chunk size warnings are pre-existing and **not caused by this feature**:

- `recharts-*.js` — 401 kB (expected; recharts is used across all report pages)
- `lucide-*.js` — 601 kB (expected; lucide-react is used project-wide)
- `lottie-*.js` — 307 kB (expected; lottie animations are used on multiple pages)

These are pre-existing project-wide concerns and are already mitigated by `manualChunks` in `vite.config.ts`.

---

## 3. Phase 2 — Playwright Runtime Console Error Tests

### 3.1 Fix Applied: `scripts/prepush-check.mjs`

The `isServerRunning()` check was originally fetching `http://127.0.0.1:5173`. On Windows with Node.js >= 17, `localhost` resolves to `::1` (IPv6), so `127.0.0.1` was unreachable and the Playwright step was silently skipped.

**Fix**: Changed the server probe URL from `http://127.0.0.1:5173` → `http://localhost:5173`.

```diff
- const res = await fetch('http://127.0.0.1:5173', { method: 'GET' });
+ const res = await fetch('http://localhost:5173', { method: 'GET' });
```

### 3.2 New Route Added: `tests/console-errors.spec.ts`

The `/admin/reports/users` route was added to the Playwright ROUTES array to include the new screen in runtime console error testing.

```diff
  const ROUTES = [
    '/',
    '/login',
    '/dashboard',
    '/admin/tours/list',
+   '/admin/reports/users',
  ];
```

### 3.3 Playwright Results — Full Run

`npm run prepush:check` with dev server active at `http://localhost:5173`:

```
Running 5 tests using 1 worker

  ok 1  › Runtime Console Error Check › Checking console errors on /               (902ms)
  ok 2  › Runtime Console Error Check › Checking console errors on /login          (7.4s)
  ok 3  › Runtime Console Error Check › Checking console errors on /dashboard      (5.8s)
  ok 4  › Runtime Console Error Check › Checking console errors on /admin/tours/list (5.8s)
  ok 5  › Runtime Console Error Check › Checking console errors on /admin/reports/users (5.7s)

  5 passed (28.7s)
✔ Console Error Testing passed!
✨ All checks passed! Ready to push.
```

> The `/admin/reports/users` page loaded with **zero console errors, zero critical warnings, and zero page crashes**.

---

## 4. Phase 3 — UI Visual, i18n Copy, and Polish Review

Visual consistency audited at standard layout breakpoints against `DESIGN.md` and existing report screen patterns:

### 4.1 Responsive Viewport Audits

| Viewport | Status | Notes |
| :--- | :--- | :--- |
| **Desktop (1280px+)** | ✅ PASS | Glassmorphic layout, teal Area chart (`#14b8a6`), Outfit typography, year filter, stats table |
| **Tablet (768px–1024px)** | ✅ PASS | KPI cards and chart scale fluidly; SVG bounds resize dynamically |
| **Mobile (375px–667px)** | ✅ PASS | Single-column scrolling layout; table supports horizontal scroll |

### 4.2 i18n Copy Parity

| Locale | Status | Verified Strings |
| :--- | :--- | :--- |
| **Vietnamese** | ✅ PASS | `Báo cáo người dùng`, `Tổng người dùng mới`, `Tháng`, `Số lượng đăng ký`, `Số lượng lũy kế` |
| **English** | ✅ PASS | `Users Report`, `Total New Users`, `Month`, `Registrations`, `Cumulative` — zero raw i18n keys exposed |

---

## 5. Phase 4 — Functional Flow Testing

| Test Case | ID | Status | Notes |
| :--- | :--- | :--- | :--- |
| Mock mode toggle | TC-01 | ✅ PASS | Toast: `Đã chuyển sang chế độ Giả lập` / `API thực tế` |
| API error → auto Mock fallback | TC-02 | ✅ PASS | Graceful degradation; no white screen of death |
| Mapper month backfill | TC-03 | ✅ PASS | All 12 months rendered; 0-fill for months with no signups |
| Cumulative count correctness | TC-04 | ✅ PASS | Each month cumulates from prior months' totals |

---

## 6. Phase 5 — Filters and URL Syncing

| Test Case | Selector | Status | Notes |
| :--- | :--- | :--- | :--- |
| Year filter → URL sync | `#users-filter-apply` | ✅ PASS | URL updates to `?year=YYYY` on apply |
| Reset filter | `#users-filter-reset` | ✅ PASS | URL pruned to current year defaults |
| Excel export | `#users-report-export-btn` | ✅ PASS | File download triggered; filename: `bao-cao-nguoi-dung_year_2026_...xlsx` |

---

## 7. Phase 6 — Regression and Console Review

| Check | Status | Details |
| :--- | :--- | :--- |
| React key errors | ✅ PASS | 0 key errors in console |
| Prop type warnings | ✅ PASS | 0 warnings |
| Unhandled network exceptions | ✅ PASS | 0 unhandled errors |
| Adjacent routes stable | ✅ PASS | `/dashboard`, `/admin/tours/list`, other report pages unaffected |

---

## 8. Changes Made During Step 09

| File | Change | Reason |
| :--- | :--- | :--- |
| `scripts/prepush-check.mjs` | `127.0.0.1` → `localhost` in server probe | Windows IPv6 resolution fix so Playwright step is not silently skipped |
| `tests/console-errors.spec.ts` | Added `/admin/reports/users` to ROUTES | Ensure new screen is covered by automated runtime console error checks |

---

## 9. Skipped / Not Applicable

| Command | Status | Reason |
| :--- | :--- | :--- |
| Unit tests (vitest/jest) | ⚪ SKIPPED | No unit test framework configured in this repo; repo pattern uses Playwright only |
| `npm run test` | ⚪ NOTE | `test` script is aliased to `npm run lint` in `package.json`; this is by design |

---

## 10. Residual Risks

| Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| API param mismatch (backend accepts `year` only) | Low | Report hook sends `year` only; export hook isolates its own params |
| Backend missing months | Low | `mapUsersReport` backfills all 12 months with 0 |
| Vendor chunk size warnings | Low (pre-existing) | `manualChunks` already configured in `vite.config.ts` |
## Step 10 revalidation override - 2026-05-23

- After reviewing code, mock mode query behavior was fixed: `useUsersReportQuery` now supports `enabled`, and `UsersReport` disables the real API query while mock mode is active.
- `npm.cmd run prepush:check` was rerun after the fix.
- Final revalidation result: lint PASS, typecheck PASS, Vite production build PASS, console tests PASS.
- Console test evidence: 5/5 routes passed, including `/admin/reports/users`.
- Verdict remains: READY.
