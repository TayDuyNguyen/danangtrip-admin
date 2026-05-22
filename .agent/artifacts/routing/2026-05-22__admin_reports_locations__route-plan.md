# Route Plan: Báo cáo Địa điểm (Locations Report)

> Feature slug: `admin_reports_locations`
> Date: 2026-05-22
> Layout target: `MainLayout`

---

## 1) Summary
- Feature này đăng ký route truy cập chính cho Báo cáo Địa điểm tại `/admin/reports/locations`.
- Route này thuộc khu vực báo cáo quản trị, kế thừa thiết kế MainLayout và chia sẻ cấu trúc menu thống kê.

## 1.1) Route Decision
- Route type: `new` (được kế thừa từ cấu trúc route báo cáo chung)
- Guard needed: `yes` (chỉ cho phép người dùng đã đăng nhập với quyền Admin/Staff truy cập)
- Why: Tránh người dùng vãng lai hoặc tài khoản không có quyền truy cập dữ liệu báo cáo nội bộ của hệ thống.

## 2) Target Routes
| Route Path | Page Component | Guard | Layout | Notes |
|---|---|---|---|---|
| `/admin/reports/locations` | `LocationReport` | `PrivateRoute` | `MainLayout` | Lazy-loaded page-level component |

## 3) Page Structure
| File | Purpose | Status |
|---|---|---|
| `src/pages/Reports/LocationReport/index.tsx` | Trang chính của Báo cáo Địa điểm | `COMPLETED` |
| `src/pages/Reports/LocationReport/components/LocationReportFilterBar.tsx` | Thanh lọc theo ngày, danh mục, quận huyện, trạng thái | `COMPLETED` |
| `src/pages/Reports/LocationReport/components/LocationStatsCards.tsx` | Hiển thị 4 thẻ KPI thống kê nhanh | `COMPLETED` |
| `src/pages/Reports/LocationReport/components/LocationReportCharts.tsx` | Biểu đồ phân bổ theo danh mục (Donut) & quận huyện (Bar) | `COMPLETED` |
| `src/pages/Reports/LocationReport/components/LocationReportTables.tsx` | Bảng xếp hạng địa điểm tương ứng theo tab lựa chọn | `COMPLETED` |

## 3.1) Layout / Guard Notes
| Concern | Decision | Notes |
|---|---|---|
| Layout | `MainLayout` | Hiển thị Sidebar bên trái và Header bên trên |
| ProtectedRoute | `PrivateRoute` | Chặn render trực tiếp khi chưa login |
| Breadcrumb | Sử dụng chung hệ thống Breadcrumbs | Home -> Báo cáo -> Báo cáo Địa điểm |
| Menu item | Tích hợp vào nhóm "Báo cáo" trong Sidebar | Có icon báo cáo đi kèm |

## 4) Navigation / Breadcrumb
| Item | Locale Key | Path | Icon | Notes |
|---|---|---|---|---|
| Menu | `sidebar.reports_locations` | `/admin/reports/locations` | `FileText` | Nằm trong subItems của `sidebar.reports` |
| Breadcrumb | `location_report:breadcrumb.current` | `/admin/reports/locations` | - | Text: "Báo cáo Địa điểm" |

## 5) Locale Updates
| File | Keys to add | Status |
|---|---|---|
| `public/lang/vi/location_report.json` | Đầy đủ khóa dịch tiếng Việt cho bộ lọc, KPI, biểu đồ, bảng biểu | `COMPLETED` |
| `public/lang/en/location_report.json` | Đầy đủ khóa dịch tiếng Anh đồng bộ với file tiếng Việt | `COMPLETED` |

## 6) Risks / Notes
- **R-01**: Cần đảm bảo load đúng namespace `location_report` trong i18next configuration.
  - *Giải pháp*: Namespace `location_report` đã được cấu hình và đăng ký tại [src/i18n/index.ts](file:///d:/DATN/danangtrip-admin/src/i18n/index.ts).
- **R-02**: Lazy load page component cần xử lý Suspense để không gây nháy trang hoặc crash khi render.
  - *Giải pháp*: Được bao bọc qua wrapper helper `withSuspense(LocationReport)` trong [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx).

## 6.1) Open Questions
- Không có câu hỏi nào mở về phần Route.

## 7) Files Expected To Change
- `src/routes/routes.ts` (Đã hoàn tất khai báo route path)
- `src/routes/index.tsx` (Đã hoàn tất đăng ký route component lazy-load)
- `src/components/common/Sidebar.tsx` (Đã hoàn tất đăng ký menu con trên Sidebar)
- `public/lang/vi/location_report.json` (Đã đồng bộ)
- `public/lang/en/location_report.json` (Đã đồng bộ)
