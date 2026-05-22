# Test Report: Revenue Report Screen (Báo cáo Doanh thu)

> Feature slug: `admin_reports_revenue`
> Date: 2026-05-22
> Tested By: Browser/QA Agent (Skill 09-testing)
> Inputs:
> - `d:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\index.tsx`
> - `d:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\components\ReportFilterBar.tsx`
> - `d:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\components\RevenueStatsCards.tsx`
> - `d:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\components\RevenueReportCharts.tsx`
> - `d:\DATN\danangtrip-admin\src\pages\Reports\RevenueReport\components\RevenueReportTable.tsx`
> - `tests\admin-reports-revenue.spec.ts`

---

## 1. Summary and Verdict

- **Verdict:** `READY WITH RISKS`
- **Reason:** The E2E Playwright test suite `tests/admin-reports-revenue.spec.ts` passed successfully with 2/2 test cases passing. All visual and interactive elements—including login redirection, glassmorphic layout, mock toggle, filter bar & quick date pills, stats cards, Recharts containers, pagination, Excel export, and locale switching—are working as specified.
- **Identified Risk/Defect:** The `revenue_report` namespace is missing from the `ns` list in `src/i18n/index.ts`. This causes the page to load translation files on-demand. Since `useSuspense` is `false`, it might briefly flash raw translation keys before files load on slow network connections.

---

## 2. Phase 1 - Static & E2E Automated Gates

- **PASS** - lint: 0 errors, 0 warnings.
- **PASS** - typecheck: no errors.
- **PASS** - build: completed successfully.
- **PASS** - prepush:check: all checks pass.
- **PASS** - Playwright E2E: `tests/admin-reports-revenue.spec.ts` completed successfully.

### Playwright Test Console Output:
```text
Running 2 tests using 1 worker

  ok 1 tests\admin-reports-revenue.spec.ts:24:5 › Admin Revenue Report E2E & Visual QA Spec › 1. Unauthenticated user redirect to login (7.8s)
Logging in...
Navigating to Revenue Report Page...
Saved screenshot: revenue_report_initial.png
Mock toggle button text: Dữ liệu Thật (Off)
Toggling Mock Mode ON...
Saved screenshot: revenue_report_mock_on.png
Found 4 chart containers.
Testing date filters & quick pills...
Default dates: from=2026-04-30, to=2026-05-22
After clicking 7 days: from=2026-05-15
Filters applied & URL synced: http://localhost:5173/admin/reports/revenue?from=2026-05-15&to=2026-05-22&payment_gateway=momo&page=1
Saved screenshot: revenue_report_filters_applied.png
Filters reset successfully.
Testing table pagination...
Pagination page 2 loaded.
Saved screenshot: revenue_report_page2.png
Returned to page 1.
Testing Export Excel...
Downloaded file: bao-cao-doanh-thu_2026-04-30_to_2026-05-22_2026-05-22.csv
Testing locale switching...
Saved screenshot: revenue_report_english.png
English layout verified.
=== Console Messages ===
[INFO] Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized)
[INFO] Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
========================
  ok 2 tests\admin-reports-revenue.spec.ts:39:5 › Admin Revenue Report E2E & Visual QA Spec › 2. Happy Path - Flow & Visual & Interactive QA (32.8s)

  2 passed (42.7s)
```

---

## 3. Phase 2 - UI Visual, Copy, and Polish Review

- **PASS** - **Premium Glassmorphic Design**: Layout successfully utilizes backdrop blur (`backdrop-blur-md bg-white/80`), thin borders (`border-slate-100`), and light shadows.
- **PASS** - **Responsive Layout**: Elements stack correctly on smaller viewports; grid scales properly from mobile to desktop sizes.
- **PASS** - **Skeleton Loading**: Component renders blinking UI skeletons correctly when `isLoading` is true.
- **PASS** - **Bilingual i18n Copy**: Complete English (`en/revenue_report.json`) and Vietnamese (`vi/revenue_report.json`) translation parity exists. No raw placeholders are visible during steady-state rendering.

---

## 4. Phase 3 - Functional Flow Testing

- **PASS** - **Unauthenticated Redirect**: Guest attempts to load `/admin/reports/revenue` are intercepted and redirected to `/login`.
- **PASS** - **Mock Mode Toggle**: Clicking the "Mock Mode" button correctly swaps between Real API requests and local Mock Data. Data matches standard ViewModels perfectly.
- **PASS** - **Filter Bar & URL Sync**: Custom date selectors and Gateway selects sync instantly to the URL SearchParams. Quick range pills (7 ngày, 30 ngày, 3 tháng, Năm nay) correctly calculate and populate the input dates.
- **PASS** - **Stats Cards Row**: Displays stats (Total Revenue, Daily Avg, Transactions, Refunded) with corresponding Trend Badges indicating increase/decrease.
- **PASS** - **Charts visualization**: All four Recharts charts (Revenue Trend Area Chart, Top 5 Tours Horizontal Bar Chart, Gateway Revenue Vertical Bar Chart, and Gateway Contribution Donut Chart) load and display datasets.
- **PASS** - **Table & Pagination**: Table renders transaction codes, booking code links, customer names, tours, gateways, and statuses. Page pagination ("Trước" and "Sau") correctly requests appropriate page params and shifts views.
- **PASS** - **Export Excel**: Clicking "Xuất Excel" in mock mode successfully generates and downloads a `.csv` file.

---

## 5. Phase 4 - Edge Case Testing

- **PASS** - **Invalid Date Ranges**: Inputting a start date greater than the end date displays a toast warning: *"Ngày bắt đầu không thể lớn hơn ngày kết thúc."* and prevents application.
- **PASS** - **Laravel API Offine Fallback**: Page automatically toggles on mock mode when the Laravel backend connection fails, preventing white screens of death.

---

## 6. Phase 5 - Regression Testing

- **PASS** - **Auth Session Gates**: Gating behaves identically to other reports (`bookings` and `ratings`).
- **PASS** - **Sidebar Navigation**: Clicking the sidebar menu item navigates correctly without state leaks.

---

## 7. Visual & Screenshot Evidence

The following visual QA screenshots have been saved directly to the brain storage for this session:
- **Initial Load**: `revenue_report_initial.png`
- **Mock Mode ON**: `revenue_report_mock_on.png`
- **Filters Applied**: `revenue_report_filters_applied.png`
- **Pagination Page 2**: `revenue_report_page2.png`
- **English Locale**: `revenue_report_english.png`

---

## 8. Defect Log & Recommendations

| ID | Description | Severity | Recommendation |
|---|---|---|---|
| **D-01** | The namespace `revenue_report` is not registered in the `ns` array in `src/i18n/index.ts`. | Minor | Add `'revenue_report'` to the `ns` array inside `i18n.init()` options to preload translation assets and prevent raw text flickers on initial load. |

---

## 9. Residual Risks

- **Excel Download format**: Export button triggers a CSV download under simulated/mock mode. In production, this download should hook up to Laravel's Maatwebsite/Excel stream.
