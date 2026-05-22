# Screen Analysis: Báo cáo Đơn hàng

**Feature slug:** `admin_reports_bookings`  
**Date:** 2026-05-22  
**Sources used:** `admin_reports_bookings.md`, `BookingsReport/index.tsx`, `report.dataHelper.ts`, `useReportQueries.ts`, `endpoints.ts`, `REPO_FACTS.md`, `DESIGN.md` (via Tailwind v4 conventions)

---

## 1. Summary And Scope

| Field | Value |
|-------|-------|
| Screen name | Báo cáo Đơn hàng |
| Feature slug | `admin_reports_bookings` |
| Route | `/admin/reports/bookings` |
| Auth | Admin / Staff — protected via existing `PrivateRoute` |
| Actor | Admin (và Staff với quyền đọc) |
| Module | Reports — sau Dashboard, Booking List/Detail, Payment List/Detail |
| Page file | `src/pages/Reports/BookingsReport/index.tsx` (đã tồn tại — 438 lines) |

**Mục tiêu nghiệp vụ:**  
Cung cấp bức tranh toàn cảnh về tình trạng đặt tour theo khoảng thời gian: tổng số đơn, tỉ lệ hoàn tất/hủy, doanh thu, xu hướng theo ngày, phân bố trạng thái, và bảng chi tiết có thể lọc + xuất Excel.

**Tình trạng hiện tại:**  
UI scaffold ĐÃ ĐƯỢC THỰC HIỆN từ trước. Toàn bộ components, types, hooks, và page đều đã tồn tại. Pipeline này sẽ document hóa, xác định gaps còn lại (i18n, API contract gap, validation), và hardening.

---

## 2. Design Token Audit

| Token | Spec doc | Repo reality |
|-------|----------|--------------|
| Primary color | `#0066CC` (doc) | `[ASSUMPTION]` Repo dùng teal `#14b8a6` theo DESIGN.md — cần đối chiếu BookingsReport |
| Border radius | `radius-16` (card) | Dùng `rounded-2xl` — tương đương ✅ |
| Typography | Inter 600/700 | Tailwind v4, không import font riêng — [ASSUMPTION] kế thừa system |
| Spacing | `p-24 gap-24 mb-24` | Dùng Tailwind spacing utilities — tương thích ✅ |
| Status badge | Pill, per booking.json | BookingsReport dùng inline badge — cần kiểm tra khớp với BookingList |

> [ASSUMPTION] Primary brand color trong BookingsReport đang follow pattern của RatingsReport (teal `#14b8a6`). Doc dùng `#0066CC` (blue). Xác nhận khi review visual.

---

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|-----------|------|-------|------|--------|
| `BookingsReport` (page) | [EXISTS] | Page | `src/pages/Reports/BookingsReport/index.tsx` | Scaffold đã có, cần hardening i18n + gaps |
| `ReportFilterBar` | [EXISTS] | Organism | `src/pages/Reports/BookingsReport/components/ReportFilterBar.tsx` | Dùng lại từ RatingsReport pattern, đã scaffold |
| `BookingStatsCards` | [EXISTS] | Organism | `src/pages/Reports/BookingsReport/components/BookingStatsCards.tsx` | Cards row: total, completed, cancelled, revenue |
| `BookingsReportCharts` | [EXISTS] | Organism | `src/pages/Reports/BookingsReport/components/BookingsReportCharts.tsx` | Line chart trend + donut status |
| `BookingsReportTable` | [EXISTS] | Organism | `src/pages/Reports/BookingsReport/components/BookingsReportTable.tsx` | Paginated table với drill-down links |
| `EmptyState` | [REUSE] | Atom | `src/components/common/EmptyState.tsx` | Đã có và dùng trong RatingsReport |
| `Skeleton` | [REUSE] | Atom | `src/components/ui/Skeleton.tsx` | Đã có |
| i18n namespace `bookings_report` | [MISSING] | Config | `public/lang/vi/bookings_report.json` | CHƯA TỒN TẠI — cần tạo mới |
| i18n namespace `bookings_report` EN | [MISSING] | Config | `public/lang/en/bookings_report.json` | CHƯA TỒN TẠI — cần tạo mới |

---

## 4. UI States

| Section | Loading | Empty | Error | Success |
|---------|---------|-------|-------|---------|
| Stats cards | Skeleton 4 cards (đã impl) | N/A — hiển thị 0 | Inline error message | Cards với data + trend badges |
| Charts row | Skeleton placeholder | Empty chart với message | Inline error | Line chart + Donut chart |
| Bookings table | Skeleton rows | EmptyState component | Inline error + retry button | Paginated table rows |
| Filter bar | Không skeleton | N/A | Toast nếu date range invalid | Applied state |
| Export button | Spinner + disabled | N/A | Toast error | Toast success + file download |
| Mock mode toggle | N/A | N/A | N/A | Badge trạng thái On/Off |

---

## 5. Data And API Mapping

### Query Fields (Filter Params)

| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| `from` | `string` (YYYY-MM-DD) | ✓ | ≤ `to`, default: đầu tháng | URL param |
| `to` | `string` (YYYY-MM-DD) | ✓ | ≥ `from`, default: hôm nay | URL param |
| `status` | `'all'\|'pending'\|'confirmed'\|'completed'\|'cancelled'` | ✗ | — | URL param |
| `payment_status` | `'all'\|'pending'\|'paid'\|'refunded'` | ✗ | — | URL param |
| `page` | `number` | ✗ | min 1 | URL param |
| `per_page` | `number` | ✗ | default 10 | Hardcoded |

### API Endpoints (đã khai báo trong endpoints.ts)

| Action | Method | Endpoint | Trigger |
|--------|--------|----------|---------|
| Load report data | GET | `/admin/reports/bookings` | Mount + filter change |
| Export Excel | GET | `/admin/bookings/export` | Click Export |

> [ASSUMPTION] Backend tại `GET /admin/reports/bookings` trả về cấu trúc `{ summary: RawBookingsReportSummary, bookings_list: { data[], current_page, last_page, per_page, total } }`. Cần xác nhận với `danangtrip-api/routes/api.php`.

### Response Fields (Raw → ViewModel)

| Raw Field | ViewModel Field | Type | Notes |
|-----------|----------------|------|-------|
| `summary.total_count` | `stats.total` | `number` | — |
| `summary.completed_count` | `stats.completed` | `number` | — |
| `summary.cancelled_count` | `stats.cancelled` | `number` | — |
| `summary.total_revenue` | `stats.revenue` | `number` | Có thể là string từ API — mapper parse |
| `summary.trends.total` | `stats.totalTrend` | `number` | % so với kỳ trước |
| `summary.status_distribution` | `charts.statuses[]` | Array | Record → Array transform |
| `summary.trend_chart[]` | `charts.trend[]` | Array | date + bookings + revenue |
| `bookings_list.data[].id` | `table.items[].id` | `number` | — |
| `bookings_list.data[].booking_code` | `table.items[].bookingCode` | `string` | — |
| `bookings_list.data[].customer_name` | `table.items[].customerName` | `string` | — |
| `bookings_list.data[].tour_name` | `table.items[].tourName` | `string` | — |
| `bookings_list.data[].total_amount` | `table.items[].totalAmount` | `number` | Parse từ string nếu cần |
| `bookings_list.data[].booking_status` | `table.items[].status` | `string` | — |
| `bookings_list.data[].payment_status` | `table.items[].paymentStatus` | `string` | — |
| `bookings_list.data[].booked_at` | `table.items[].bookedAt + .bookedAtTime` | `string` | Split ISO datetime |

---

## 6. Business Rules

| # | Rule |
|---|------|
| BR-01 | `from` không được lớn hơn `to` — validate trước khi submit filter |
| BR-02 | Default date range là đầu tháng hiện tại đến hôm nay |
| BR-03 | URL params phải phản ánh active filter để link chia sẻ được |
| BR-04 | Export Excel dùng chính xác filter params hiện tại (không reset) |
| BR-05 | Booking code là link drilldown đến `/admin/bookings/{id}` |
| BR-06 | Mock Mode tự kích hoạt khi API lỗi, có thể toggle thủ công |
| BR-07 | Tất cả text visible phải đi qua i18n (hiện tại CHƯA đáp ứng) |

---

## 7. Edge Cases

| # | Case | Expected Behavior |
|---|------|------------------|
| EC-01 | API trả về empty `bookings_list.data` | EmptyState với message i18n |
| EC-02 | `total_revenue` là string `"0.00"` từ API | Mapper parse sang `number` |
| EC-03 | `trend_chart` là null hoặc rỗng | Chart hiển thị empty state |
| EC-04 | `trends` object thiếu field | Trend badge hiển thị 0% thay vì crash |
| EC-05 | Export thất bại (network error, 403, 500) | Toast error, không download |
| EC-06 | Người dùng đặt `from` > `to` | Toast validation error, không apply filter |
| EC-07 | Page vượt quá `lastPage` | Reset về page 1 |
| EC-08 | Backend không có endpoint `/admin/reports/bookings` | Mock mode auto-activate |

---

## 8. Gaps Hiện Tại Cần Giải Quyết

| Gap | Mức độ | Bước giải quyết |
|-----|--------|----------------|
| **i18n hoàn toàn thiếu** — toàn bộ strings trong BookingsReport là hardcoded | CRITICAL | Step này + 05/07 |
| Không có `bookings_report.json` trong `public/lang/vi` hoặc `en` | CRITICAL | Tạo trong step này |
| `report.mapper.ts` cần xác nhận `mapBookingsReport` function tồn tại | HIGH | Step 03 |
| API response shape chưa được xác nhận với backend thực | HIGH | Step 03 |
| `BookingsReportTable` drill-down link cần kiểm tra route đúng | MEDIUM | Step 07 |
| `customerAvatar` field không có trong `RawBookingsReportItem` | MEDIUM | Step 03 |

---

## 9. Handoff To Next Steps

### Files Likely To Change

| File | Steps |
|------|-------|
| `public/lang/vi/bookings_report.json` | 03 (tạo mới) |
| `public/lang/en/bookings_report.json` | 03 (tạo mới) |
| `src/dataHelper/report.mapper.ts` | 03 (verify/add mapBookingsReport) |
| `src/api/reportApi.ts` | 03 (verify getBookingsReport + exportBookingsReport) |
| `src/pages/Reports/BookingsReport/index.tsx` | 05/06/07 (i18n + hardening) |
| `src/pages/Reports/BookingsReport/components/*.tsx` | 05/06/07 (i18n cho cả 4 files) |

### Hooks/Services Likely To Exist

- `useBookingsReportQuery` — ĐÃ TỒN TẠI ✅
- `useReportMutations().exportBookingsMutation` — ĐÃ TỒN TẠI ✅
- `reportApi.getBookingsReport` — CẦN XÁC NHẬN
- `reportApi.exportBookingsReport` — CẦN XÁC NHẬN
- `mapBookingsReport` — CẦN XÁC NHẬN

### Auth Requirement

- Route đã bảo vệ bởi `PrivateRoute` — không cần thay đổi
- Không có action nhạy cảm (chỉ read + export)

---

## 10. Open Questions

| # | Question |
|---|---------|
| OQ-01 | Backend có endpoint `/admin/reports/bookings` thực không? Hay chỉ có `/admin/bookings` + `/admin/dashboard/stats`? |
| OQ-02 | `customer_avatar` có trả về từ API không? (Hiện không có trong RawBookingsReportItem) |
| OQ-03 | Export endpoint là `/admin/bookings/export` hay `/admin/reports/bookings/export`? |
| OQ-04 | Trend % `totalTrend` tính so với kỳ nào? (kỳ trước cùng độ dài, hay tháng trước?) |
