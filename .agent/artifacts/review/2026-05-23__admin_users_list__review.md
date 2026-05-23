# Feature Review: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `feature review & alignment`

---

## 1) Goal Alignment (Khớp Mục Tiêu Nghiệp Vụ)

Màn hình Danh sách Người dùng (`/admin/users`) đã được thiết kế và xây dựng bám sát 100% tài liệu mô tả đặc tả giao diện và luồng nghiệp vụ của dự án:

1. **Page Header:** Hiển thị breadcrumb "Người dùng / Danh sách Người dùng", tiêu đề "Danh sách Người dùng", nút Xuất Excel (`exportMutation` với blob download) và nút Thêm người dùng (điều hướng sang `/admin/users/create` khi click).
2. **Stats Row:** Hiển thị 4 thẻ thống kê: Tổng ND, Đang hoạt động, Bị khóa, Admin & Staff với màu sắc, icon, hiệu ứng hover, loading skeleton tương ứng.
3. **Filter Bar:** Tìm kiếm debounce 300ms, dropdown chọn nhanh vai trò (Admin/Staff/User) và trạng thái (Hoạt động/Bị khóa) đồng bộ trực tiếp lên URL Params.
4. **Table Toolbar:** Hiển thị số lượng row đang chọn và cung cấp các hành động hàng loạt (Kích hoạt hàng loạt, Khóa hàng loạt, Xóa hàng loạt) chạy ngầm song song với toast feedback mượt mà.
5. **Interactive Table:**
   - Cột Người dùng: hiển thị Avatar viết tắt/ảnh thật, họ tên, email và username (dạng `@username`).
   - Cột Vai trò (Role): badge click mở dropdown absolute tại chỗ để thay đổi quyền nhanh, hỗ trợ confirm trước khi nâng lên Admin.
   - Cột Trạng thái (Status): badge click thay đổi trực tiếp kích hoạt/khóa tài khoản.
   - Sắp xếp (Sorting): Hiển thị dấu chỉ hướng (ChevronUp/ChevronDown) màu xanh teal nổi bật khi click sort ở cột Đơn hàng và Ngày tham gia.
   - Cột Thao tác: cung cấp nút Xem, Sửa, Khóa/Mở khóa nhanh, và Xóa vĩnh viễn (confirm dialog cảnh báo sâu về mất mát đơn hàng/đánh giá).

---

## 2) Security & Guard Rails (Bảo vệ Hệ thống)
- **Quyền truy cập:** Chỉ tài khoản có quyền `admin` mới được truy cập định tuyến này. Hệ thống tự động chặn và redirect về `/login` nếu chưa đăng nhập hoặc sai vai trò.
- **Tự bảo vệ tài khoản (Self-Protection):** Hệ thống phát hiện tài khoản Admin đang đăng nhập hiện tại và tự động vô hiệu hóa checkbox, badge và các nút Khóa, Xóa để ngăn ngừa rủi ro tự phá hoại tài khoản của chính mình.

---

## 3) Quality Assurance & Code Integrity
- **TypeScript:** Kiểu dữ liệu tĩnh được phân tách rõ ràng thành `Raw` (đáp ứng API backend) và `ViewModel` (đáp ứng giao diện). Mappers xử lý dữ liệu đầu vào cực kỳ an toàn bằng `toNumberSafe` và `toArraySafe`.
- **Localization (i18n):** Đồng bộ hóa 100% key dịch vi/en; đã loại bỏ hoàn toàn các chuỗi cứng tiếng Anh (Role, Status, YOU, bulk delete confirm) sang cơ chế dynamic translation và dynamic locale formatting.
- **Prepush Quality Gate:** Đã chạy thử nghiệm và vượt qua toàn bộ các cổng chất lượng (`eslint`, `tsc`, `vite build`, `playwright tests`) với kết quả 100% passed.
