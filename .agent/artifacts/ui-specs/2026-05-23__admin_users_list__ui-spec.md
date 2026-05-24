# UI Specification: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `ui components spec`

---

## 1) Component Layout & Specs

Màn hình Danh sách Người dùng được xây dựng bằng kiến trúc component tập trung, mượt mà và trực quan theo chuẩn thiết kế `DESIGN.md`:

### 1.1) UserStatsRow (`UserStatsRow.tsx`)
- **Vị trí:** Ngay dưới Page Header, trên Filter Bar.
- **Thiết kế:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`.
- **Nội dung:** 4 thẻ thống kê:
  - *Tổng người dùng:* accent: `secondary`, icon: `Users`.
  - *Đang hoạt động:* accent: `teal` (#14B8A6), icon: `CheckCircle`.
  - *Bị khóa:* accent: `rose`, icon: `Ban`.
  - *Admin & Staff:* accent: `tealSoft`, icon: `ShieldAlert`.
- **UX:** Hỗ trợ render `Skeleton` nhấp nháy khi tải dữ liệu ngầm.

### 1.2) UserFilterBar (`UserFilterBar.tsx`)
- **Nội dung:**
  - Ô tìm kiếm text debounce 300ms với kính lúp bên trái.
  - Dropdown select nhanh Role (Tất cả, User, Staff, Admin) dùng `CustomSelect`.
  - Dropdown select nhanh Trạng thái (Tất cả, Hoạt động, Bị khóa) dùng `CustomSelect`.
  - Nút "Đặt lại" (RotateCcw) chỉ hiện khi có filter hoạt động.
  - Hàng chứa tag filter hiển thị bộ lọc đang áp dụng.

### 1.3) UserTable (`UserTable.tsx`)
- **Nội dung:**
  - Checkbox chọn tất cả / chọn từng dòng (ẩn checkbox hoặc khóa trên dòng của chính mình).
  - Khối hiển thị: Avatar gradient/ảnh thật + Tên đậm + Email + Username (chữ nhỏ màu xám dưới dạng `@username`).
  - Badgeclickable đổi nhanh Role (Click mở Dropdown absolute tùy chọn User / Staff / Admin).
  - Badgeclickable đổi nhanh Trạng thái (Click đổi nhanh active/banned).
  - Sắp xếp (Sorting) ở cột Đơn hàng và Ngày tham gia.
  - Hàng Actions: View (Eye), Edit (Edit2), Block/Unblock, Trash (Xóa).

### 1.4) DeleteUserDialog & UpdateRoleDialog
- **DeleteUserDialog:** Icon Warning đỏ (`rose-600`), cảnh báo nghiêm trọng về ràng buộc dữ liệu (đơn hàng/đánh giá sẽ mất theo), nút xác nhận đỏ nhạt bóng mờ.
- **UpdateRoleDialog:** Icon Shield màu vàng cam, cảnh báo khi cấp quyền Admin tối cao cho người dùng thường, nút xác nhận màu teal mượt.

---

## 2) Micro-animations & Aesthetics
- **Hover Pattern:** Dòng bảng đổi màu nền nhẹ nhàng sang `slate-50/30`. Các nút icon đổi màu 150ms (`#14B8A6` cho view, `#EF4444` cho block/delete).
- **Glass Treatment:** Nền trang chính và bộ lọc sử dụng `bg-white/80 backdrop-blur-md border border-slate-100 shadow-xs`.
- **Loading Transition:** Tích hợp skeleton loading mượt mà cho 5 dòng bảng và stats row trước khi render dữ liệu thực.
