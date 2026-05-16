# Screen Analysis: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Screen Name:** Chi tiết Tour
- **Date:** 2026-05-14
- **Persona:** Admin / Staff
- **Module:** Quản lý Tour

## 1. Summary and Scope

Màn hình này cho phép Admin/Staff xem toàn bộ thông tin chi tiết của một tour, bao gồm: mô tả, hình ảnh, giá, lịch trình, dịch vụ đi kèm, lịch khởi hành và các đánh giá từ khách hàng. Đồng thời, màn hình cung cấp các thao tác nhanh để thay đổi trạng thái tour (`active`, `inactive`, `sold_out`), bật/tắt các nhãn `Nổi bật`, `Hot`, và các nút điều hướng tới trang chỉnh sửa hoặc quản lý lịch khởi hành.

Mục tiêu chính: Cung cấp cái nhìn 360 độ về một tour du lịch và cho phép quản lý nhanh các thuộc tính quan trọng của tour đó.

## 2. Design and Token Audit

Dựa trên `DESIGN.md` và Prototype:
- **Colors:**
  - Primary: `#0066CC` (Sử dụng cho button, link, active states). *Lưu ý: DESIGN.md ghi primary là `#14B8A6` nhưng Prototype dùng `#0066CC`. Repo thực tế đang dùng màu xanh dương (primary) và cam (accent) theo prototype.*
  - Success: `#10B981` (Dùng cho badge Đang hoạt động, giá trẻ em/em bé).
  - Warning: `#F59E0B` (Dùng cho badge Hết chỗ, rating stars).
  - Error: `#EF4444` (Dùng cho badge Tạm dừng, nút Xóa).
  - Accent: `#FF6B35` (Dùng cho badge Hot, giá giảm).
- **Typography:** Inter (System Font fallback).
- **Spacing:** Base unit 4px. Card padding 20px - 24px.
- **Shapes:** Radius 10px - 16px cho cards và buttons. Badge rounded-full.
- **Elevation:** Shadow nhẹ cho cards (`shadow-sm`), shadow rõ rệt cho primary buttons.
- **Icons:** Lucide-react (Repo thực tế đang dùng, prototype dùng Material Symbols).

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `PageHeader` | [REUSE] | Molecule | `src/components/common/PageHeader.tsx` | Header chung với breadcrumb và action buttons. |
| `StatusBadge` | [REUSE] | Atom | `src/components/ui/StatusBadge.tsx` | Badge hiển thị trạng thái (active, inactive...). |
| `Card` | [REUSE] | Atom | `src/components/ui/Card.tsx` | Container cho các sections. |
| `TourHero` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourHero.tsx` | Gallery ảnh và thanh thông tin nhanh (duration, max people...). |
| `TourTabs` | [REUSE] | Molecule | `src/components/ui/Tabs.tsx` | Tab cho mô tả ngắn/chi tiết. |
| `TourPriceTable` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourPriceTable.tsx` | Bảng giá người lớn/trẻ em/em bé và thông tin giảm giá. |
| `TourTimeline` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourTimeline.tsx` | Hiển thị lịch trình theo từng ngày. |
| `TourServiceList` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourServiceList.tsx` | Danh sách bao gồm/không bao gồm. |
| `ScheduleTable` | [NEW] | Section | `src/pages/Tours/TourDetail/components/ScheduleTable.tsx` | Bảng quản lý lịch khởi hành (có thể dùng lại `DataTable` nếu có). |
| `ReviewOverview` | [NEW] | Section | `src/pages/Tours/TourDetail/components/ReviewOverview.tsx` | Tổng quan đánh giá và danh sách review gần nhất. |
| `TourSidebarInfo` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourSidebarInfo.tsx` | Card thông tin nhanh (Mã tour, danh mục...). |
| `TourStats` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourStats.tsx` | Card thống kê hiệu quả. |
| `TourQuickSettings` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourQuickSettings.tsx` | Card cài đặt trạng thái, nổi bật, hot. |
| `TourQuickActions` | [NEW] | Section | `src/pages/Tours/TourDetail/components/TourQuickActions.tsx` | Các nút action chính (Sửa, Thêm lịch, Xóa). |

## 4. Responsive and UI States

| Section | Loading | Empty | Error |
|---|---|---|---|
| Toàn bộ trang | `PageSkeleton` | N/A | `ErrorState` + Nút quay lại |
| Lịch khởi hành | `SkeletonTable` | "Chưa có lịch khởi hành" + Nút thêm | Toast error khi xóa lịch |
| Đánh giá | `ReviewSkeleton` | "Chưa có đánh giá nào" | Toast error |
| Gallery ảnh | `SkeletonRect` | Ảnh placeholder | N/A |

**Behavior:**
- Desktop: Layout 2 cột (Main: 70%, Sidebar: 30% fixed/sticky).
- Tablet: Sidebar chuyển xuống dưới Main section hoặc ẩn bớt thông tin phụ.
- Mobile: 1 cột duy nhất, Sidebar chuyển thành các section cuối trang.

## 5. Data and API Analysis

| Field | Type | Required | Source Endpoint |
|---|---|---|---|
| `tour_detail` | `Object` | ✓ | `GET /admin/tours/{id}` |
| `schedules` | `Array` | ✓ | `GET /admin/tours/{id}/schedules` |
| `ratings` | `Array` | ✓ | `GET /admin/tours/{id}/ratings` |
| `rating_stats` | `Object` | ✓ | `GET /admin/tours/{id}/rating-stats` |

**Actions mapping:**
- Cập nhật trạng thái: `PATCH /admin/tours/{id}/status` (body: `status`)
- Bật/tắt nổi bật: `PATCH /admin/tours/{id}/featured` (body: `is_featured`)
- Bật/tắt hot: `PATCH /admin/tours/{id}/hot` (body: `is_hot`)
- Xóa tour: `DELETE /admin/tours/{id}`
- Xóa lịch: `DELETE /admin/tour-schedules/{id}`

## 6. Business Rules and Edge Cases

- **BR-01 (Trạng thái Tour):** Khi chuyển sang `active`, tour phải có ít nhất 1 lịch khởi hành `available` (khuyến nghị, không bắt buộc cứng).
- **BR-02 (Xóa Tour):** Chỉ được xóa nếu tour chưa có booking nào. Nếu đã có booking, API trả về lỗi 400/422, UI hiển thị thông báo "Không thể xóa tour đã có lượt đặt".
- **BR-03 (Xóa Lịch):** Không được xóa lịch đã có người đặt (`booked_people > 0`). Đề xuất chuyển trạng thái lịch sang `cancelled` thay vì xóa.
- **BR-04 (Giảm giá):** `discount_percent` chỉ hiển thị khi > 0. UI tự tính toán giá hiển thị dựa trên giá gốc và % giảm.
- **EC-01 (API Timeout):** Khi load các section con (schedules, ratings) bị lỗi, không làm chết cả trang, chỉ hiển thị lỗi tại section đó.
- **EC-02 (Image Error):** Nếu ảnh tour bị lỗi link, hiển thị ảnh placeholder chuẩn của dự án.

## 7. Handoff to Next Steps

- **Code Areas:** `src/pages/Tours/TourDetail/`, `src/hooks/useTourQueries.ts`, `src/api/tourApi.ts`.
- **Hooks/Services:** Cần tạo `useTourDetail(id)` và các mutations cho status/featured/hot.
- **Auth:** Yêu cầu quyền `admin` hoặc `staff`.
- **Next step:** `03-types-api-contract` để định nghĩa `TourViewModel` và `RawTourResponse`.

## 8. Assumptions / Open Questions

- **[ASSUMPTION]**: Repo đang dùng Lucide Icons mặc dù DESIGN ghi Solar. Sẽ ưu tiên Lucide để nhất quán với code hiện tại.
- **[OPEN QUESTION]**: Có cần hiển thị lịch sử thay đổi trạng thái của tour không? (Prototype chưa có).
- **[OPEN QUESTION]**: Phần "Mô tả chi tiết" có hỗ trợ rich text (HTML) không hay chỉ là text thuần? (Prototype ghi white-space pre-wrap).
