# Interaction Spec: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Tệp tin Thực thi**:
  - Yup validation: [landingPage.schema.ts](file:///d:/DATN/danangtrip-admin/src/validations/landingPage.schema.ts)
  - Drawer form: [LandingPageFormDrawer.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/components/LandingPageFormDrawer.tsx)
  - Main page: [index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/LandingPages/index.tsx)

---

## 1. Form Validation (Yup + react-hook-form)

Các điều kiện ràng buộc nhập liệu được kiểm tra tức thời (realtime) ở client trước khi gửi lên server:
- **Tiêu đề trang**: Bắt buộc nhập, tối đa 150 ký tự.
- **SEO Slug**: Bắt buộc nhập, tự động gợi ý chuyển chữ Tiếng Việt sang dạng slug gạch ngang không dấu khi gõ tiêu đề. Kiểm tra regex chỉ cho phép chữ thường không dấu, số và ký hiệu `-` (ví dụ: `du-lich-da-nang-2026`).
- **Bộ lọc Tour (Filters JSON)**: Nếu nhập dữ liệu, Yup sẽ tiến hành phân tích thử (`JSON.parse(value)`). Nếu cú pháp bị lỗi (thiếu dấu ngoặc, sai key), sẽ lập tức xuất thông báo cảnh báo lỗi cấu trúc JSON dưới trường nhập liệu và chặn thao tác Submit.

---

## 2. Toast Notifications & User Feedback

Sử dụng thư viện `sonner` để hiển thị thông báo góc màn hình:
- **Tạo mới thành công**: Hiển thị toast thông báo `"Đã tạo Landing Page thành công!"`.
- **Cập nhật thành công**: Hiển thị toast thông báo `"Đã cập nhật Landing Page thành công!"`.
- **Xóa thành công**: Hiển thị toast thông báo `"Đã xóa Landing Page thành công!"`.
- **Đổi trạng thái**: Hiển thị toast thông báo `"Đã cập nhật trạng thái hiển thị thành công!"`.
- **Lỗi tải/gửi**: Xuất thông báo lỗi chi tiết tương ứng.

---

## 3. Inline & Dialog Interactions

- **Thay đổi trạng thái nhanh (Toggle Switch)**: Khi admin click vào toggle switch của cột Trạng thái trên bảng dữ liệu, hệ thống lập tức gọi API cập nhật trạng thái của bản ghi đó và hiển thị hiệu ứng đổi màu switch (Teal <-> Slate) mà không cần mở form Drawer.
- **Xác nhận xóa (Confirm Dialog)**: Khi admin click biểu tượng thùng rác, một popup confirm mặc định của trình duyệt sẽ hiển thị yêu cầu xác nhận kèm thông tin slug để tránh xóa nhầm dữ liệu.
- **Cảnh báo thay đổi chưa lưu (Unsaved Changes Guard)**:
  - Nếu admin đã sửa bất kỳ ký tự nào trên form (form dirty) và click nút "Hủy", click dấu "X" hoặc click ra ngoài vùng Drawer để đóng, hệ thống sẽ mở cảnh báo hỏi xem admin có thực sự muốn rời đi hay không.
  - Ngăn chặn việc bấm nhầm tắt drawer làm mất toàn bộ nội dung đã soạn thảo.

---

## 4. Content Blocks Builder

- Cho phép admin bấm nút để thêm động các block nội dung:
  - **Khối FAQ**: Tự động sinh ra 2 input nhập "Câu hỏi" và "Câu trả lời".
  - **Khối mô tả điểm đến**: Tự động sinh ra 2 input nhập "Tiêu đề khối" và "Nội dung".
- Mỗi khối đều có nút "Xóa" (biểu tượng Trash) tương ứng bên cạnh để admin loại bỏ khối đó ra khỏi danh sách nhanh chóng.
