# QA Test Report: Báo cáo Đánh giá (Ratings Report)

- Feature Slug: `admin_reports_ratings`
- Verdict: `READY`
- Last Updated: 2026-05-22

---

## 1. Test Summary

This test report details the verification and validation checklist performed to guarantee visual excellence, responsive usability, clean data flows, and secure command structures for the new Báo cáo Đánh giá (Ratings Report) screen.

---

## 2. Test Execution Details

### 2.1 Route Guarding & Authentication
- **Test Case 1**: Attempt to load `/admin/reports/ratings` directly without active cookie/auth token.
  - *Result*: Redirected immediately to `/login` via `<PrivateRoute />`. (PASS)
- **Test Case 2**: Authenticate as Admin user and click the new "Báo cáo Đánh giá" sub-menu in the Sidebar.
  - *Result*: Correctly transitions path to `/admin/reports/ratings` and renders React page chunk via React Lazy loading. (PASS)

### 2.2 Visual Layout & Styling
- **Test Case 3**: Verify typography and layout consistency against `DESIGN.md`.
  - *Result*: Curated teal theme gradients, glassmorphism card shadows, and Inter/Outfit family typography are applied cleanly. Icons render correctly. (PASS)
- **Test Case 4**: Inspect responsive adjustments on multiple viewports:
  - **Desktop (1440px)**: Columns display side-by-side, full stats row, and 7-column table. (PASS)
  - **Tablet (800px)**: Stats cards drop into 2-column flow. Charts scale dynamically. (PASS)
  - **Mobile (375px)**: Total stack conversion. Single-column lists. Tables allow horizontal swipe scrolling without design break. (PASS)

### 2.3 Filter Interactions
- **Test Case 5**: Select an end date `to` that is prior to start date `from`.
  - *Result*: The validation correctly prevents submission, displays a rose red Sonner toast: `"Ngày bắt đầu không thể lớn hơn ngày kết thúc."` (PASS)
- **Test Case 6**: Click quick-range pills (e.g. "7 ngày" or "30 ngày").
  - *Result*: Recalculates absolute dates correctly and populates input forms instantly. (PASS)
- **Test Case 7**: Click **"Mặc định"** (Reset).
  - *Result*: Resets filters, fires confirmation toast, and reloads default month-to-date queries. (PASS)

### 2.4 Data Integration & Recharts Graphs
- **Test Case 8**: Verify loader, error, and empty states.
  - *Result*: Glassy custom skeletons load cleanly. Simulated server failures trigger a clean Red error container with an interactive "Thử lại" refetch option. (PASS)
- **Test Case 9**: Render distribution charts.
  - *Result*: Recharts `AreaChart`, `PieChart`, and `BarChart` draw SVG nodes cleanly with hover tooltips and dynamic color fills. (PASS)

### 2.5 Table Operations & Moderation Commands
- **Test Case 10**: Trigger Pagination clicks.
  - *Result*: Synchronizes query page offset back to URL search queries and executes smooth fetching. (PASS)
- **Test Case 11**: Trigger "Phê duyệt" (Approve) / "Từ chối" (Reject).
  - *Result*: Dispatches axios patch to specific endpoint and displays success toast. (PASS)
- **Test Case 12**: Trigger "Xóa" (Delete).
  - *Result*: Prompts native confirm. On OK, deletes review and updates views immediately. (PASS)

### 2.3 Spreadsheet Excel Export
- **Test Case 13**: Export file under active parameters.
  - *Result*: Dispatches request with active filters, retrieves sheet blob, normalizes MIME type, and initiates direct file download named with structured date strings. (PASS)
