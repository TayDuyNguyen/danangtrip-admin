# Route Plan: Báo cáo Đơn hàng

> Feature slug: `admin_reports_bookings`
> Date: 2026-05-22
> Layout target: `MainLayout`

---

## 1) Summary
- Feature này cần route gì?
  - Báo cáo Đơn hàng (`BookingsReport`) cần được đăng ký với route chính `/admin/reports/bookings`.
- Có route mới hay chỉ mở rộng route cũ?
  - Mở rộng (đăng ký mới và liên kết sidebar) trong hệ thống routing của Admin. Tuy nhiên, route này đã được khai báo sẵn dưới dạng lazy-load trong route matrix, nhiệm vụ của bước này là review, xác nhận tính đúng đắn và lập kế hoạch hardening cấu trúc routing/layout.

## 1.1) Route Decision
- Route type: `extend` (Đã được khai báo trong hệ thống route matrix `/admin/reports/bookings`)
- Guard needed: `yes`
- Why:
  - Route nằm dưới phân hệ quản trị (Admin/Staff), được bảo vệ bằng lớp guard `PrivateRoute` toàn cục để đảm bảo chỉ những tài khoản quản trị viên đã đăng nhập thành công mới có quyền truy cập và sử dụng báo cáo.

## 2) Target Routes
| Route Path | Page Component | Guard | Layout | Notes |
|---|---|---|---|---|
| `/admin/reports/bookings` | `BookingsReport` (`src/pages/Reports/BookingsReport/index.tsx`) | `PrivateRoute` | `MainLayout` | Trang báo cáo chi tiết về tình trạng đơn hàng, doanh thu và xu hướng đặt tour. |

## 3) Page Structure
| File | Purpose | Status |
|---|---|---|
| `src/pages/Reports/BookingsReport/index.tsx` | Main page skeleton và điều phối dữ liệu | [EXISTS] Đã scaffold, cần hardening i18n ở bước tiếp theo |
| `src/pages/Reports/BookingsReport/components/ReportFilterBar.tsx` | Thanh bộ lọc thời gian, trạng thái đơn & thanh toán | [EXISTS] Đã scaffold |
| `src/pages/Reports/BookingsReport/components/BookingStatsCards.tsx` | Hàng thẻ số liệu thống kê tổng quan (Tổng đơn, Hoàn thành, Hủy, Doanh thu) | [EXISTS] Đã scaffold |
| `src/pages/Reports/BookingsReport/components/BookingsReportCharts.tsx` | Biểu đồ xu hướng (Recharts Line) và cơ cấu trạng thái đơn (Donut) | [EXISTS] Đã scaffold |
| `src/pages/Reports/BookingsReport/components/BookingsReportTable.tsx` | Bảng hiển thị danh sách đơn hàng chi tiết có phân trang | [EXISTS] Đã scaffold |

## 3.1) Layout / Guard Notes
| Concern | Decision | Notes |
|---|---|---|
| Layout | Tích hợp vào `MainLayout` | Tự động kế thừa Header, Sidebar trái và Footer chung. |
| ProtectedRoute | Sử dụng `PrivateRoute` | Đảm bảo tính bảo mật và kiểm tra token của admin/staff. |
| Breadcrumb | Breadcrumb được render inline | Sẽ được refactor tích hợp i18n namespace `bookings_report` (breadcrumb.home -> breadcrumb.reports -> breadcrumb.current). |
| Menu item | Tích hợp vào nhóm menu Báo cáo trong Sidebar | Sidebar con có submenu `sidebar.reports` -> `sidebar.reports_bookings` chỉ hướng về `/admin/reports/bookings`. |

## 4) Navigation / Breadcrumb
| Item | Locale Key | Path | Icon | Notes |
|---|---|---|---|---|
| Menu | `sidebar.reports_bookings` (trong `common.json`) | `/admin/reports/bookings` | `FileText` | Nằm trong danh mục Báo cáo của sidebar. |
| Breadcrumb Home | `bookings_report:breadcrumb.home` | `/dashboard` | `LayoutDashboard` | Liên kết quay lại Dashboard. |
| Breadcrumb Reports | `bookings_report:breadcrumb.reports` | `/admin/reports` | — | Danh mục báo cáo. |
| Breadcrumb Current | `bookings_report:breadcrumb.current` | `/admin/reports/bookings` | — | Vị trí hiện tại (Active). |

## 5) Locale Updates
Cả 2 file ngôn ngữ đã được tạo lập đầy đủ và đồng bộ ở Step 03:
- [vi/bookings_report.json](file:///d:/DATN/danangtrip-admin/public/lang/vi/bookings_report.json)
- [en/bookings_report.json](file:///d:/DATN/danangtrip-admin/public/lang/en/bookings_report.json)

*Lưu ý: Các menu translation key của Sidebar (`sidebar.reports`, `sidebar.reports_ratings`, `sidebar.reports_bookings`) được quản lý tập trung trong file `common.json` của cả 2 ngôn ngữ và đã được xác nhận tồn tại khớp hoàn hảo.*

## 6) Risks / Notes
- **R-01 (Đường dẫn drill-down):** `BookingsReportTable` cần đảm bảo link drill-down đi tới đúng chi tiết đơn hàng: `/admin/bookings/:id` (được định nghĩa bởi `ROUTES.BOOKINGS_DETAIL` thay thế cho `/admin/bookings/detail/:id` nếu có lệch). Cần kiểm tra kỹ router path thực tế.
- **R-02 (API endpoint match):** Đường dẫn export booking sử dụng `/admin/bookings/export` thay vì `/admin/reports/bookings/export`. Cần đảm bảo route này hoạt động đúng với query params truyền vào.

## 6.1) Open Questions
- Không có câu hỏi mở nào ở bước này. Toàn bộ routing, sidebar navigation, breadcrumbs và i18n namespaces đã được xác nhận khớp 100% với hiện trạng repo thực tế.

## 7) Files Expected To Change
Do phần routing & sidebar menu đã được tích hợp hoàn chỉnh từ trước, trong các bước UI & Integration tiếp theo chúng ta chỉ tập trung thay đổi các files sau để hardening i18n & logic:
- `src/pages/Reports/BookingsReport/index.tsx`
- `src/pages/Reports/BookingsReport/components/ReportFilterBar.tsx`
- `src/pages/Reports/BookingsReport/components/BookingStatsCards.tsx`
- `src/pages/Reports/BookingsReport/components/BookingsReportCharts.tsx`
- `src/pages/Reports/BookingsReport/components/BookingsReportTable.tsx`
