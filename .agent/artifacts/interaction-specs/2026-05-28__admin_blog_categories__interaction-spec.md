# Interaction Spec: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Form Validation & Submitting Flow

- **Trường Tên danh mục:** Bắt buộc phải nhập, độ dài tối đa 50 ký tự. Lỗi hiển thị ngay dưới trường khi submit hoặc khi thay đổi tiêu điểm (blur).
- **Trường Slug:** Không bắt buộc. Nếu để trống khi tạo mới, hệ thống tự động sinh slug từ tên nhờ hàm `slugifyVietnamese` khi submit. Nếu người dùng nhập, slug chỉ được chứa các ký tự chữ thường không dấu, số và dấu gạch ngang (`/^[a-z0-9-]+$/`).
- **Nút gửi (Submit):** Bị vô hiệu hóa và hiển thị loading spinner khi API đang chạy. Sau khi gửi thành công, Form được reset hoàn toàn về chế độ "Tạo mới".

## 2. Edit & Cancel Mode Flow

- Khi click biểu tượng **Bút chì** (Edit) trên dòng bất kỳ:
  - Form bên phải tự động chuyển sang chế độ "Chỉnh sửa".
  - Tiêu đề Form chuyển thành "Chỉnh sửa danh mục" và nhãn trạng thái đổi thành "ĐANG SỬA".
  - Toàn bộ dữ liệu của danh mục đó (Tên, Slug, Mô tả) được điền vào form.
  - Trên màn hình thiết bị di động/tablet, trình duyệt tự động cuộn mượt (scroll mượt) xuống khu vực Form bên dưới để người dùng bắt đầu chỉnh sửa ngay lập tức.
- Khi click **Hủy** (Cancel) hoặc nút đóng `x`:
  - Form được làm sạch dữ liệu.
  - Form khôi phục về chế độ "Thêm danh mục" (Tạo mới).

## 3. Delete Confirmation Flow

- Khi click biểu tượng **Thùng rác** (Delete) trên dòng bất kỳ:
  - Một hộp thoại xác nhận (Confirm Delete Dialog Modal) xuất hiện kèm hiệu ứng mờ nền (`backdrop-blur`).
  - Hộp thoại ghi rõ tên danh mục bị ảnh hưởng và hiển thị hộp cảnh báo màu vàng: "Các bài viết thuộc danh mục này sẽ mất liên kết danh mục".
  - Nút **Xóa danh mục** hiển thị spinner trong khi thực hiện yêu cầu DELETE lên API.
  - Nhấn **Hủy** để tắt modal mà không làm thay đổi dữ liệu.
