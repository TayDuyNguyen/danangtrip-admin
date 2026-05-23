# Auth & Permissions Review: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `auth & permissions review`

---

## 1) Gating & Route Protection (Bảo vệ Định tuyến)

Màn hình Quản lý Người dùng `/admin/users` là màn hình nhạy cảm và được bảo vệ nghiêm ngặt:

- **Client Route Gating:**
  - Route được wrap hoàn toàn trong `<PrivateRoute />` tại `src/routes/index.tsx`.
  - Quyền tối thiểu để render màn hình: `isAuthenticated && hasRole(user, 'admin')`.
  - Bất kỳ nỗ lực truy cập trái phép nào từ người dùng thường đều tự động kích hoạt chuyển hướng (`Navigate`) về trang đăng nhập `/login`.
- **API Request Security:**
  - Tất cả API truyền tải dữ liệu (`getList`, `updateRole`, `updateStatus`, `delete`, `export`) đều đi qua `axiosClient` đính kèm tiêu đề `Authorization: Bearer <token>` động.

---

## 2) Self-Action Protections (Cơ chế Tự Bảo vệ - BR-01)

Để ngăn ngừa tối đa rủi ro người vận hành hệ thống vô tình tự khóa hoặc tự xóa tài khoản của chính mình:

- **Nhận diện tài khoản hiện tại:** Lấy thông tin `user.id` trực tiếp từ auth store (`useAuth()`).
- **Giao diện người dùng an toàn:**
  - Trên bảng dữ liệu, dòng tương ứng với tài khoản đang đăng nhập được bổ sung nhãn `"YOU"` màu xám nổi bật bên cạnh tên.
  - Checkbox lựa chọn dòng này bị khóa (`disabled`).
  - Các nút hành động: Khóa (Ban), Xóa (Delete), Thay đổi quyền (Role badge clickable) trên dòng này đều bị vô hiệu hóa hoàn toàn trên UI.
  - Khi cố ý gọi API đột biến cho ID của chính mình, hooks kiểm tra đầu vào sẽ tự động chặn lại trước khi gửi request và bắn Toast cảnh báo: *"Bạn không thể tự thực hiện hành động này trên tài khoản của chính mình."*
