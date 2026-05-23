# Interaction Specification: Chi tiết Người dùng (admin_users_detail)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Scope: `interaction specifications`

---

## 1) Luồng Thao Tác & Dialogs Xác Nhận Quản Trị

Để ngăn ngừa tối đa các thao tác sai sót gây hại cho hệ thống, các thao tác quản trị chính đều được trang bị hộp thoại xác nhận (Confirm Dialogs) chi tiết và an toàn:

### 1.1) Xác Nhận Thay Đổi Vai Trò (`ChangeRoleDialog.tsx`)
- **Luồng kích hoạt:** Bấm nút "Thay đổi vai trò" trong Sidebar hoặc Header mở dialog.
- **Lọc vai trò backend:** Dropdown chọn vai trò lọc bỏ quyền `staff` (chỉ hiển thị `user` và `admin` theo ràng buộc của backend API).
- **Hành vi cảnh báo đặc biệt:**
  - Nếu chuyển từ `user` sang `admin`: Hiển thị cảnh báo màu vàng cam cảnh báo đây là quyền quản trị tối cao, có thể can thiệp toàn bộ hệ thống.
  - Hỗ trợ trạng thái `isPending` (vô hiệu hóa các nút điều khiển, hiển thị spinner) trong suốt thời gian API xử lý.

### 1.2) Xác Nhận Khóa/Mở Khóa Tài Khoản (`UserActionsCard.tsx` / `UserDetailHeader.tsx`)
- **Luồng kích hoạt:** Bấm nút toggle/nút bấm "Khóa tài khoản" hoặc "Mở khóa tài khoản".
- **Phản hồi tức thì:**
  - Khi khóa: Badge trạng thái chuyển sang `banned` màu đỏ và toast thông báo thành công hiển thị.
  - Khi mở khóa: Badge trạng thái chuyển sang `active` màu xanh và toast thông báo thành công hiển thị.

### 1.3) Xác Nhận Xóa Tài Khoản Vĩnh Viễn (`ConfirmDeleteUserDialog.tsx`)
- **Luồng kích hoạt:** Bấm nút "Xóa tài khoản" mở modal cảnh báo nguy hiểm cấp độ đỏ (`rose-500`).
- **Nội dung cảnh báo ràng buộc dữ liệu:**
  - "⚠ Hành động này không thể hoàn tác. Toàn bộ thông tin cá nhân, lịch sử giao dịch đặt tour, đánh giá và các dữ liệu liên quan đến tài khoản này sẽ bị xóa vĩnh viễn khỏi hệ thống."
- **Điều hướng:** Sau khi xóa thành công, hệ thống hiển thị toast thành công và tự động điều hướng admin quay lại màn hình danh sách người dùng (`/admin/users`) sau `1000ms`.

---

## 2) Phản Hồi Trạng Thái (Toast Feedback - sonner)

- Mọi hành động thành công đều kích hoạt toast thông báo dạng Success (màu xanh lá mượt) từ thư viện `sonner` với thông điệp song ngữ (VI/EN) tương ứng.
- Khi gặp sự cố mạng hoặc lỗi xác thực từ backend, toast dạng Error (màu đỏ) tự động bắn lên hiển thị chi tiết nguyên nhân lỗi (ví dụ: "Không được tự khóa tài khoản của chính mình").

---

## 3) Tự Bảo Vệ Hệ Thống (Administrative Self-Protection - BR-01)

Để ngăn ngừa thảm họa quản trị viên tự khóa, tự giáng chức hoặc tự xóa tài khoản của chính mình khi truy cập trang cá nhân:
- Hệ thống so sánh trực tiếp ID người dùng đang xem với ID của admin hiện tại đang đăng nhập (`currentAdmin?.id === Number(id)`).
- Nếu khớp (`isSelf = true`):
  - Ẩn hoàn toàn nút "Xóa tài khoản".
  - Vô hiệu hóa (disable) nút "Khóa tài khoản" và "Thay đổi vai trò".
  - Hiển thị tooltip cảnh báo ngắn gọn để nhắc nhở admin về tính tự bảo vệ của hệ thống.
