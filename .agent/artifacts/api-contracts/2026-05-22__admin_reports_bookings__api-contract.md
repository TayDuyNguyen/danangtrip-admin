# API Contract: Báo cáo Đơn hàng

**Feature slug:** `admin_reports_bookings`  
**Date:** 2026-05-22  
**Sources:** `api_list.md` (§ ADMIN — DASHBOARD & REPORTS), `endpoints.ts`, `report.dataHelper.ts`, `report.mapper.ts`, `reportApi.ts`, `useReportQueries.ts`

---

## 1. Source Reconciliation

| Source | Endpoint | Params | Match? |
|--------|----------|--------|--------|
| `api_list.md` line 328 | `GET /admin/reports/bookings` | `?from &to &status &payment_status` | ✅ |
| `endpoints.ts` → `REPORTS.BOOKINGS` | `/admin/reports/bookings` | — | ✅ |
| `reportApi.ts` → `getBookingsReport` | `API_ENDPOINTS.REPORTS.BOOKINGS` | passes `BookingsReportFilters` | ✅ |
| `api_list.md` line 162 | `GET /admin/bookings/export` | `?status &payment_status &date_from &date_to` | ⚠️ **MISMATCH** |
| `endpoints.ts` → `EXPORT.BOOKINGS` | `/admin/bookings/export` | — | ✅ |
| `reportApi.ts` → `exportBookingsReport` | `API_ENDPOINTS.EXPORT.BOOKINGS` | passes `BookingsReportFilters` (uses `from`/`to`) | ⚠️ **MISMATCH** |

> [!WARNING]
> **Export param mismatch:** `api_list.md` specifies `date_from`/`date_to` for the export endpoint, but `BookingsReportFilters` uses `from`/`to`. The `exportBookingsReport` API call passes the filter object directly — if backend expects `date_from`/`date_to`, the export will silently fail. Needs backend confirmation before hardening.

---

## 2. Endpoints

| Action | Method | Endpoint | Auth | Trigger |
|--------|--------|----------|------|---------|
| Load report + table | GET | `/admin/reports/bookings` | 🛡️ Admin | On mount + filter apply |
| Export Excel | GET | `/admin/bookings/export` | 🛡️ Admin | Click "Xuất Excel" |

### 2.1 GET /admin/reports/bookings

**Request params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `from` | `string` (YYYY-MM-DD) | ✗ | Default: first day of current month |
| `to` | `string` (YYYY-MM-DD) | ✗ | Default: today |
| `status` | `'all'\|'pending'\|'confirmed'\|'completed'\|'cancelled'` | ✗ | `'all'` = no filter |
| `payment_status` | `'all'\|'pending'\|'paid'\|'refunded'` | ✗ | `'all'` = no filter |
| `page` | `number` | ✗ | Default: 1 |
| `per_page` | `number` | ✗ | Default: 10 |

**Expected response shape (RawBookingsReport):**

```json
{
  "summary": {
    "total_count": 146,
    "completed_count": 85,
    "cancelled_count": 11,
    "total_revenue": "182500000",
    "trends": {
      "total": 14.8,
      "completed": 18.3,
      "cancelled": -5.4,
      "revenue": 24.6
    },
    "status_distribution": {
      "pending": 18,
      "confirmed": 32,
      "completed": 85,
      "cancelled": 11
    },
    "trend_chart": [
      { "date": "2026-05-01", "bookings": 4, "revenue": "5400000" }
    ]
  },
  "bookings_list": {
    "current_page": 1,
    "last_page": 15,
    "per_page": 10,
    "total": 146,
    "data": [
      {
        "id": 10452,
        "booking_code": "DNT10452",
        "customer_name": "Nguyễn Hoàng Anh",
        "tour_name": "Tour Ngũ Hành Sơn - Hội An 1 ngày",
        "total_amount": "680000",
        "booking_status": "completed",
        "payment_status": "paid",
        "booked_at": "2026-05-20T09:30:00.000000Z"
      }
    ]
  }
}
```

**Error cases:**

| HTTP | Cause | Frontend handling |
|------|-------|-----------------|
| 401 | Token expired | axiosClient interceptor redirects to login |
| 403 | Insufficient role | Show toast error |
| 422 | Invalid date range | Show toast validation error |
| 500 | Server error | Auto-switch to Mock Mode, show retry button |

### 2.2 GET /admin/bookings/export

**Request params:**

| Param | Type | Notes |
|-------|------|-------|
| `status` | `string` | Same as report filter |
| `payment_status` | `string` | Same as report filter |
| `date_from` | `string` | **[ASSUMPTION]** api_list uses `date_from`/`date_to` — may differ from `from`/`to` |
| `date_to` | `string` | **[ASSUMPTION]** Same note |
| `from` | `string` | Currently passed by `exportBookingsReport` |
| `to` | `string` | Currently passed by `exportBookingsReport` |

**Response:** `Blob` (`.xlsx` file stream)

---

## 3. Type Contract

All types already declared and verified in `src/dataHelper/report.dataHelper.ts`.

### 3.1 Filter Types (existing ✅)

```typescript
// BookingsReportFilters — src/dataHelper/report.dataHelper.ts:166
export interface BookingsReportFilters {
    from?: string;
    to?: string;
    status?: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status?: 'all' | 'pending' | 'paid' | 'refunded';
    page?: number;
    per_page?: number;
}
```

### 3.2 Raw Types (existing ✅)

```typescript
// RawBookingsReportItem — src/dataHelper/report.dataHelper.ts:178
export interface RawBookingsReportItem {
    id: number;
    booking_code: string;
    customer_name: string;
    tour_name: string;
    total_amount: number | string;         // Backend may return string
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    booked_at: string;                     // ISO datetime
}
```

> **Missing field:** `customer_avatar` is NOT in `RawBookingsReportItem` and therefore not displayed. The current table shows customer name only — no avatar. If backend adds avatar in future, mapper must be updated.

```typescript
// RawBookingsReportSummary — src/dataHelper/report.dataHelper.ts:192
export interface RawBookingsReportSummary {
    total_count: number;
    completed_count: number;
    cancelled_count: number;
    total_revenue: number | string;
    trends?: { total?: number; completed?: number; cancelled?: number; revenue?: number; };
    status_distribution?: Record<string, number>;
    trend_chart?: { date: string; bookings: number; revenue: number | string; }[];
}
```

### 3.3 ViewModel Types (existing ✅)

```typescript
// BookingsReportViewModel — src/dataHelper/report.dataHelper.ts:263
export interface BookingsReportViewModel {
    stats: { total, totalTrend, completed, completedTrend, cancelled, cancelledTrend, revenue, revenueTrend }
    charts: { trend: BookingTrendChartDataPoint[]; statuses: BookingStatusDistributionPoint[]; }
    table: { items: BookingsReportItemViewModel[]; pagination: { currentPage, lastPage, perPage, total } }
}
```

---

## 4. Mapper Contract

`mapBookingsReport` — **existing and complete** in `src/dataHelper/report.mapper.ts:251`

| Raw field | ViewModel field | Transform |
|-----------|----------------|-----------|
| `summary.total_count` | `stats.total` | direct |
| `summary.completed_count` | `stats.completed` | direct |
| `summary.cancelled_count` | `stats.cancelled` | direct |
| `summary.total_revenue` | `stats.revenue` | `toNumberSafe(value, 0)` |
| `summary.trends?.total` | `stats.totalTrend` | optional chaining with `\|\| 0` |
| `summary.trend_chart[]` | `charts.trend[]` | map `date` → `formatDateLabel(date)` |
| `summary.trend_chart[].revenue` | `charts.trend[].revenue` | `toNumberSafe(value, 0)` |
| `summary.status_distribution` | `charts.statuses[]` | `Record<string,number>` → fixed array of 4 statuses with `%` calc |
| `bookings_list.data[].total_amount` | `table.items[].totalAmount` | `toNumberSafe(value, 0)` |
| `bookings_list.data[].booked_at` | `table.items[].bookedAt` + `.bookedAtTime` | split ISO datetime |
| `bookings_list.data[].booking_status` | `table.items[].status` | direct with fallback `'pending'` |

**Safe guards in mapper:**
- `mapBookingsReport(null)` → returns zero-state ViewModel (no crash) ✅
- `toNumberSafe(revenue, 0)` handles string revenue from backend ✅
- `|| []` fallbacks on all optional array fields ✅

---

## 5. API Module Contract

`reportApi` — **existing and complete** in `src/api/reportApi.ts`

```typescript
getBookingsReport: (params: BookingsReportFilters) => Promise<ApiResponse<RawBookingsReport>>
    → GET /admin/reports/bookings via axiosClient ✅

exportBookingsReport: (params: BookingsReportFilters) => Promise<AxiosResponse<Blob>>
    → GET /admin/bookings/export, responseType: 'blob' ✅
    → ⚠️ param name mismatch (from/to vs date_from/date_to) — needs confirmation
```

---

## 6. Hooks Contract

`useReportQueries.ts` — **existing and complete**

```typescript
useBookingsReportQuery(params: BookingsReportFilters)
    → queryKey: ['reports', 'bookings', params]
    → staleTime: 30s ✅

useReportMutations().exportBookingsMutation
    → mutationFn: exportBookingsReport + prepareSpreadsheetDownload + downloadBlobFile ✅
```

---

## 7. Validation Schema

**No Yup schema needed** — filters are simple selects + date inputs. Validation is imperative in `handleApplyFilters`:

```typescript
// In index.tsx
if (new Date(localFilters.from) > new Date(localFilters.to)) {
    toast.error(t('bookings_report:filter.validation.date_range'));
}
```

→ This needs i18n key `filter.validation.date_range` in `bookings_report` namespace.

---

## 8. i18n Contract — NEW FILES REQUIRED

**Gap:** No `bookings_report.json` namespace exists in `public/lang/vi/` or `public/lang/en/`.  
**All 5 components** have fully hardcoded Vietnamese strings.

### Namespace structure planned

```
public/lang/vi/bookings_report.json  ← CREATE
public/lang/en/bookings_report.json  ← CREATE
```

Full key inventory:

| Key path | VI value | Used in |
|----------|----------|---------|
| `title` | Báo cáo Đơn hàng | `index.tsx` |
| `subtitle` | Thống kê xu hướng đặt tour... | `index.tsx` |
| `breadcrumb.home` | Trang chủ | `index.tsx` |
| `breadcrumb.reports` | Báo cáo | `index.tsx` |
| `breadcrumb.current` | Báo cáo Đơn hàng | `index.tsx` |
| `mock.toggle_title` | Nhấp để bật/tắt... | `index.tsx` |
| `mock.mock_on` | Dữ liệu Giả lập (On) | `index.tsx` |
| `mock.mock_off` | Dữ liệu Thật (Off) | `index.tsx` |
| `mock.toast_to_mock` | Không kết nối được API... | `index.tsx` |
| `mock.toast_switched_mock` | Đã chuyển sang Mock Data | `index.tsx` |
| `mock.toast_switched_real` | Đã chuyển sang Dữ liệu thật | `index.tsx` |
| `export.btn_label` | Xuất Excel | `index.tsx` |
| `export.toast_loading` | Đang chuẩn bị... | `index.tsx` |
| `export.toast_success` | Xuất báo cáo Excel thành công! | `index.tsx` |
| `export.toast_error` | Xuất file Excel thất bại... | `index.tsx` |
| `export.toast_mock_loading` | Đang chuẩn bị file Excel giả lập... | `index.tsx` |
| `export.toast_mock_success` | Xuất báo cáo Excel giả lập thành công! | `index.tsx` |
| `error.load_failed` | Không thể tải dữ liệu từ API | `index.tsx` |
| `error.connection` | Đã xảy ra sự cố kết nối... | `index.tsx` |
| `error.retry_btn` | Thử lại | `index.tsx` |
| `error.use_mock_btn` | Sử dụng Mock Data | `index.tsx` |
| `filter.from_date` | Từ ngày | `ReportFilterBar.tsx` |
| `filter.to_date` | Đến ngày | `ReportFilterBar.tsx` |
| `filter.booking_status` | Trạng thái đơn hàng | `ReportFilterBar.tsx` |
| `filter.payment_status` | Trạng thái thanh toán | `ReportFilterBar.tsx` |
| `filter.status_all` | Tất cả trạng thái | `ReportFilterBar.tsx` |
| `filter.status_pending` | Chờ xử lý | `ReportFilterBar.tsx` |
| `filter.status_confirmed` | Đã xác nhận | `ReportFilterBar.tsx` |
| `filter.status_completed` | Đã hoàn thành | `ReportFilterBar.tsx` |
| `filter.status_cancelled` | Đã hủy | `ReportFilterBar.tsx` |
| `filter.payment_all` | Tất cả trạng thái | `ReportFilterBar.tsx` |
| `filter.payment_pending` | Chờ thanh toán | `ReportFilterBar.tsx` |
| `filter.payment_paid` | Đã thanh toán | `ReportFilterBar.tsx` |
| `filter.payment_refunded` | Đã hoàn tiền | `ReportFilterBar.tsx` |
| `filter.quick_filters` | Lọc nhanh: | `ReportFilterBar.tsx` |
| `filter.range_7days` | 7 ngày | `ReportFilterBar.tsx` |
| `filter.range_30days` | 30 ngày | `ReportFilterBar.tsx` |
| `filter.range_3months` | 3 tháng | `ReportFilterBar.tsx` |
| `filter.range_thisyear` | Năm nay | `ReportFilterBar.tsx` |
| `filter.btn_reset` | Mặc định | `ReportFilterBar.tsx` |
| `filter.btn_apply` | Áp dụng | `ReportFilterBar.tsx` |
| `filter.validation.date_range` | Ngày bắt đầu không thể lớn hơn... | `index.tsx` |
| `filter.toast_reset` | Đã lập lại bộ lọc về mặc định | `index.tsx` |
| `stats.total` | Tổng đơn hàng | `BookingStatsCards.tsx` |
| `stats.completed` | Đơn thành công | `BookingStatsCards.tsx` |
| `stats.cancelled` | Đơn đã hủy | `BookingStatsCards.tsx` |
| `stats.revenue` | Doanh thu tạm tính | `BookingStatsCards.tsx` |
| `charts.trend_title` | Xu hướng đơn hàng | `BookingsReportCharts.tsx` |
| `charts.trend_subtitle` | Theo ngày/tuần/tháng | `BookingsReportCharts.tsx` |
| `charts.status_title` | Phân bố trạng thái | `BookingsReportCharts.tsx` |
| `charts.no_data` | Không có dữ liệu... | `BookingsReportCharts.tsx` |
| `charts.bookings_label` | Đơn hàng | `BookingsReportCharts.tsx` |
| `table.title` | Danh sách đơn hàng | `BookingsReportTable.tsx` |
| `table.subtitle` | Danh sách đơn hàng chi tiết... | `BookingsReportTable.tsx` |
| `table.total_count` | {{total}} đơn hàng | `BookingsReportTable.tsx` |
| `table.header_code` | Mã đơn hàng | `BookingsReportTable.tsx` |
| `table.header_customer` | Khách hàng | `BookingsReportTable.tsx` |
| `table.header_tour` | Tour du lịch | `BookingsReportTable.tsx` |
| `table.header_amount` | Tổng tiền | `BookingsReportTable.tsx` |
| `table.header_status` | Trạng thái đơn | `BookingsReportTable.tsx` |
| `table.header_payment` | Thanh toán | `BookingsReportTable.tsx` |
| `table.header_date` | Ngày đặt | `BookingsReportTable.tsx` |
| `table.header_detail` | Chi tiết | `BookingsReportTable.tsx` |
| `table.status_completed` | Hoàn thành | `BookingsReportTable.tsx` |
| `table.status_confirmed` | Đã xác nhận | `BookingsReportTable.tsx` |
| `table.status_cancelled` | Đã hủy | `BookingsReportTable.tsx` |
| `table.status_pending` | Chờ xử lý | `BookingsReportTable.tsx` |
| `table.payment_paid` | Đã thanh toán | `BookingsReportTable.tsx` |
| `table.payment_refunded` | Đã hoàn tiền | `BookingsReportTable.tsx` |
| `table.payment_pending` | Chờ thanh toán | `BookingsReportTable.tsx` |
| `table.tooltip_detail` | Xem chi tiết đơn hàng | `BookingsReportTable.tsx` |
| `table.no_data_title` | Không tìm thấy đơn hàng nào | `BookingsReportTable.tsx` |
| `table.no_data_desc` | Không tìm thấy đơn hàng... | `BookingsReportTable.tsx` |
| `table.pagination_showing` | Hiển thị {{from}}–{{to}} trong tổng số {{total}} đơn hàng | `BookingsReportTable.tsx` |
| `table.btn_prev` | Trước | `BookingsReportTable.tsx` |
| `table.btn_next` | Sau | `BookingsReportTable.tsx` |

---

## 9. Files To Change In Next Steps

| File | Action | Step |
|------|--------|------|
| `public/lang/vi/bookings_report.json` | **CREATE** | **Step 03 (now)** |
| `public/lang/en/bookings_report.json` | **CREATE** | **Step 03 (now)** |
| `src/pages/Reports/BookingsReport/index.tsx` | MODIFY — add `useTranslation`, replace hardcoded strings | Step 05/07 |
| `src/pages/Reports/BookingsReport/components/ReportFilterBar.tsx` | MODIFY — add i18n | Step 05/07 |
| `src/pages/Reports/BookingsReport/components/BookingStatsCards.tsx` | MODIFY — add i18n | Step 05/07 |
| `src/pages/Reports/BookingsReport/components/BookingsReportCharts.tsx` | MODIFY — add i18n | Step 05/07 |
| `src/pages/Reports/BookingsReport/components/BookingsReportTable.tsx` | MODIFY — add i18n | Step 05/07 |
| `src/api/reportApi.ts` | VERIFY export param names after backend confirmation | Step 06 |

---

## 10. Contract Status Summary

| Item | Status |
|------|--------|
| `RawBookingsReport` type | ✅ Complete |
| `BookingsReportViewModel` type | ✅ Complete |
| `BookingsReportFilters` type | ✅ Complete |
| `reportApi.getBookingsReport` | ✅ Complete |
| `reportApi.exportBookingsReport` | ⚠️ Param name mismatch — needs backend confirm |
| `mapBookingsReport` mapper | ✅ Complete with safe guards |
| `useBookingsReportQuery` hook | ✅ Complete |
| `exportBookingsMutation` | ✅ Complete |
| i18n `vi/bookings_report.json` | ❌ Missing — **create in this step** |
| i18n `en/bookings_report.json` | ❌ Missing — **create in this step** |
