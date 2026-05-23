# UI Specification: Chi tiết Người dùng (admin_users_detail)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Scope: `ui components spec`

---

## 1) Component Layout & Specs

Màn hình Chi tiết Người dùng được xây dựng theo cấu trúc 2 cột linh hoạt (`grid grid-cols-1 lg:grid-cols-3 gap-8`) kết hợp hệ thống component phong phú, trực quan và hiện đại:

### 1.1) PersonalInfoCard (`components/PersonalInfoCard.tsx`)
- **Vị trí:** Cột trái, trên cùng.
- **Thiết kế:** Bảng thông tin dạng lưới 2 cột (`grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8`).
- **Nội dung:** Hiển thị chi tiết lý lịch người dùng:
  - *Họ và tên, Email (có badge xác thực), Số điện thoại, Ngày sinh, Giới tính, Tỉnh/Thành phố.*
  - *Ngày tham gia & Ngày cập nhật.*
- **Aesthetics:** Sử dụng các icon nhỏ xinh làm điểm nhấn (Mail, Phone, Calendar, User, MapPin, Clock) màu `slate-400`.

### 1.2) UserBookingsTable (`components/UserBookingsTable.tsx`)
- **Vị trí:** Cột trái, ở giữa.
- **Thiết kế:** Bảng dữ liệu thu gọn (`overflow-x-auto`), hiển thị tối đa 5 đơn đặt tour gần đây.
- **Nội dung:** 
  - Mã đơn hàng (dạng `#booking_code` màu xanh dương nổi bật có link truy cập trực tiếp).
  - Tên tour (rút gọn `line-clamp-1 truncate max-w-xs md:max-w-md`).
  - Ngày đặt tour, Tổng số tiền và Trạng thái đơn hàng (Sử dụng badge trạng thái màu HSL hài hòa: `completed`, `confirmed`, `pending`, `cancelled`).
- **UX:** Có link nhanh "Xem tất cả" dẫn đến bộ lọc danh sách booking của người dùng này.

### 1.3) UserRatingsList (`components/UserRatingsList.tsx`)
- **Vị trí:** Cột trái, dưới cùng.
- **Thiết kế:** Danh sách dọc hiển thị tối đa 3 đánh giá gần nhất.
- **Nội dung:**
  - Ảnh đại diện của tour/địa điểm, tên tour/địa điểm.
  - Số sao đánh giá (dạng ngôi sao fill vàng lấp lánh `fill-amber-400 text-amber-400`).
  - Trạng thái đánh giá (Approved, Pending, Rejected) dạng badge bo tròn.
  - Nội dung bình luận hiển thị trong khung quote nhẹ nhàng có đường line xanh nhạt bên trái.

### 1.4) UserStatsCards (`components/UserStatsCards.tsx`)
- **Vị trí:** Cột phải, trên cùng.
- **Thiết kế:** Lưới 2x2 chứa 4 thẻ thống kê trực quan:
  - *Đơn đặt tour:* Icon `ShoppingCart` (nền cam nhạt).
  - *Đánh giá đã viết:* Icon `MessageSquare` (nền tím nhạt).
  - *Đã yêu thích:* Icon `Heart` (nền hồng nhạt).
  - *Tổng chi tiêu:* Icon `DollarSign` (nền xanh lá nhạt), hiển thị số tiền định dạng VND.
- **UX:** Hover hiệu ứng nổi khối nhẹ nhàng tăng tính tương tác.

### 1.5) UserAccountSidebar & UserActionsCard
- **UserAccountSidebar:** Renders trạng thái tài khoản (badge status), vai trò (badge role), ngày đăng nhập cuối cùng, trạng thái xác thực email.
- **UserActionsCard:** Chứa các thao tác quản trị trực tiếp:
  - *Khóa/Mở khóa tài khoản:* Toggle linh hoạt hoặc nút nhấn kèm icon `Lock`/`Unlock`.
  - *Thay đổi vai trò:* Đổi nhanh vai trò qua dialog.
  - *Xóa tài khoản:* Nút màu đỏ (`rose-500`) báo hiệu hành động nguy hiểm kèm icon `Trash2`.

### 1.6) ChangeRoleDialog & ConfirmDeleteUserDialog
- **ChangeRoleDialog:** Dropdown cho phép thay đổi nhanh giữa `admin` và `user` (đã lọc bỏ vai trò `staff` để phù hợp với backend).
- **ConfirmDeleteUserDialog:** Khung cảnh báo màu đỏ chói với các thông điệp cảnh báo mất mát dữ liệu nghiêm trọng, yêu cầu xác nhận kỹ lưỡng.

---

## 2) Aesthetics & Micro-interactions
- **Branded Palette:** Sử dụng màu chủ đạo Teal `#14b8a6` cho các nút hoạt động chính và icon tải dữ liệu. Màu nền thẻ trắng tinh khiết kết hợp viền mờ `border-slate-100` mang lại trải nghiệm Glassmorphism cao cấp.
- **Self-Protection Protection (BR-01):** Nếu admin truy cập trang chi tiết của chính mình, các nút tác động (Khóa tài khoản, Thay đổi quyền, Xóa tài khoản) sẽ tự động bị ẩn hoặc bị disabled kèm tooltip giải thích để ngăn ngừa tai nạn tự khóa tài khoản quản trị.
