# UI Specification: Admin Users Report (`admin_reports_users`)

> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Source analysis: `D:\DATN\danangtrip-admin\.agent\artifacts\analysis\2026-05-23__admin_reports_users__screen-analysis.md`

---

## 1) Summary
- **Mục tiêu:** Thiết kế một trang báo cáo phân tích người dùng tối giản, cao cấp phục vụ quản trị viên, cung cấp bộ lọc tương tác năm, các KPI quan trọng, biểu đồ tăng trưởng đăng ký mới sinh động và bảng chi tiết hóa cộng dồn theo thời gian.
- **Above-the-fold:** Menu Sidebar, Tiêu đề trang, Breadcrumbs, các hằng số bộ lọc Năm/Role/Status, và 3 thẻ KPI.

---

## 2) Component Matrix

### [REUSE]
- **MainLayout.tsx** (`src/layouts/MainLayout.tsx`): Cung cấp bộ khung admin panel.
- **Sidebar.tsx** (`src/components/common/Sidebar.tsx`): Tích hợp trực tiếp menu con dưới mục Báo cáo.
- **Skeleton.tsx** (`src/components/ui/Skeleton.tsx`): Cung cấp hiệu ứng nhấp nháy chuyển động khi đang tải dữ liệu.
- **EmptyState.tsx** (`src/components/common/EmptyState.tsx`): Phản hồi khi mảng dữ liệu rỗng.

### [NEW] (Tất cả được định nghĩa dưới `src/pages/Reports/UsersReport/components/`)
| Component | Layer | Purpose | Expected Props |
|---|---|---|---|
| `UsersReportFilterBar` | Molecule | Cung cấp bộ chọn dropdown lọc dữ liệu Năm, Role, Status | `{ filters, onFilterChange, onApply, onReset, isSubmitting }` |
| `UsersStatsCards` | Molecule | Hiển thị 3 thẻ KPI (New Users, Total Users N/A, Active Rate N/A) | `{ totalNewUsers, isLoading }` |
| `UsersReportCharts` | Organism | Render biểu đồ Recharts AreaChart màu xanh Teal ngọc lam | `{ data, isLoading }` |
| `UsersReportTable` | Organism | Render danh mục bảng 12 tháng so sánh tăng trưởng và lũy kế | `{ data, isLoading }` |

---

## 3) UI States

| Component | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| **Filter Bar** | Hiển thị dropdown tĩnh không cho bấm | N/A | Khung viền đỏ | Hoạt động bình thường | Khóa khi đang tải hoặc xuất |
| **KPI Cards** | Hiển thị 3 khung Skeleton nhấp nháy | Hiện `0` cho New Users | Hiện `-` | Số hiệu cỡ lớn đậm nét | N/A |
| **Chart** | Khung xám Skeleton cao 400px | Renders nhãn "Chưa có dữ liệu" | Renders banner lỗi hệ thống | AreaChart ngọc lam mượt mà | N/A |
| **Table** | 5 hàng Skeleton xám chạy nhấp nháy | Renders EmptyState | Renders `ErrorWidget` có nút refetch | Renders đầy đủ 12 dòng | N/A |

---

## 4) Responsive Breakdown
- **Mobile (<768px):** 
  - Toàn bộ cards KPI chuyển thành 1 cột xếp chồng dọc.
  - Chiều cao biểu đồ thu gọn lại 250px-300px để vừa vặn.
  - Bảng cuộn ngang tự động.
- **Tablet (768px - 1023px):**
  - KPI cards tự động chia lưới 2 cột.
  - Biểu đồ AreaChart nới rộng 100% chiều ngang.
- **Desktop (≥1024px):**
  - KPI cards chia lưới 3 cột cân đối.
  - Lưới bảng biểu xếp dọc đồng bộ với biểu đồ AreaChart.

---

## 5) Build & Assembly Order
1. **Atoms / Types Definition:** Khóa kiểu dữ liệu trong `report.dataHelper.ts`.
2. **Mappers:** Cài đặt logic lấp đầy 12 tháng tại `report.mapper.ts`.
3. **Molecules:** Tạo `UsersReportFilterBar.tsx` và `UsersStatsCards.tsx`.
4. **Organisms:** Cài đặt biểu diễn Recharts `UsersReportCharts.tsx` và bảng `UsersReportTable.tsx`.
5. **Page assembly:** Tích hợp và đóng gói hoàn chỉnh trong `index.tsx`.
