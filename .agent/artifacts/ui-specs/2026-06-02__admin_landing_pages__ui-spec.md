# UI Specification: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Components Triển Khai**:
  - [LandingPageFilter.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageFilter.tsx)
  - [LandingPageTable.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageTable.tsx)
  - [LandingPageFormDrawer.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageFormDrawer.tsx)

---

## 1. Design System & Theme Alignment

Sử dụng các token thiết kế chuẩn trong dự án Đà Nẵng Trip để xây dựng giao diện:
- **Màu sắc**:
  - Accent Primary: `#14b8a6` (Teal 500)
  - Accent Hover/Hover text: `#0f766e` (Teal 700)
  - Light Teal Background: `#dff7f4` (Teal 50)
  - Borders/Lines: `#E2E8F0` (Slate 200)
  - Text chính: `#1E293B` (Slate 800)
- **Độ bo góc (Radius)**:
  - Bảng dữ liệu chính, Form Drawer, Filter panel: bo góc `16px` (`rounded-[16px]` hoặc `rounded-2xl`).
  - Inputs, buttons, switches: bo góc `12px` (`rounded-xl`).
  - Badges, small tags: bo góc `8px` (`rounded-lg`).
- **Phân cấp Tiêu đề**:
  - Tiêu đề cột dùng font-black uppercase, cỡ chữ 11px, màu Slate 500.
  - Tên/Tiêu đề Landing Page hiển thị in đậm (`font-bold`), màu Slate 800.

---

## 2. Component Structures

### 2.1. Thanh bộ lọc (`LandingPageFilter`)
- Gồm một ô tìm kiếm chính (kèm icon `Search` định vị bên trái) và 2 dropdown lọc loại trang (`page_type`) và trạng thái (`status`).
- Tự động thay đổi kích thước linh hoạt theo lưới (grid) 1 cột trên mobile và 3 cột hàng ngang trên desktop.

### 2.2. Bảng dữ liệu (`LandingPageTable`)
- Bảng hiển thị thông tin dạng dòng với độ rộng cột được phân chia khoa học (`table-fixed`).
- Có thanh Toolbar phụ phía trên hiển thị tổng số dòng dữ liệu và dropdown cho phép thay đổi số lượng bản ghi hiển thị trên mỗi trang (10, 20, 50).
- Phần chân trang hiển thị trạng thái phân trang (Pagination) kèm các nút chuyển tiếp có hiệu ứng hover mượt mà.

### 2.3. Form Biên tập (`LandingPageFormDrawer`)
- Drawer trượt ra từ lề phải màn hình tạo cảm giác trực quan và không làm mất context làm việc hiện tại của Admin.
- Hệ thống 3 tab phân chia rõ ràng các nhóm thông tin nhập liệu, có thanh chỉ báo Teal trượt dưới chân tab đang active.
- Tích hợp khung tải ảnh Banner chính và ảnh chia sẻ mạng xã hội, tự động hiển thị box preview ảnh tải lên kèm nút Xóa nhanh.

---

## 3. UI States (Loading & Empty States)

- **Loading State**: Bảng danh sách sử dụng component `<LoadingReact />` có hiệu ứng spinner đồng bộ để hiển thị trạng thái đang gọi API.
- **Empty State**: Khi bộ lọc không trả về kết quả, bảng tự động ẩn danh sách và hiển thị một khối thông báo trực quan bao gồm icon quả địa cầu `Globe` màu Slate 300, nhãn "Không có dữ liệu" và định dạng khoảng trắng hợp lý.
