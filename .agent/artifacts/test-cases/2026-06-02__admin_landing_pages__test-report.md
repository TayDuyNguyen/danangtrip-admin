# Test Report: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02

---

## 1. Automated Quality Gate Checks

Đã chạy thành công các bộ kiểm tra tự động trước khi bàn giao:
- **Linting check**: `npm run lint` -> Đạt yêu cầu, không có lỗi cú pháp hoặc cảnh báo lộn xộn.
- **Type checking**: `npm run typecheck` -> Biên dịch TypeScript thành công, không có lỗi bất đồng kiểu dữ liệu tĩnh.
- **Build check**: `npm run build` -> Đóng gói production bundle thành công, dung lượng tối ưu, không có lỗi code splitting.
- **Prepush gate**: `npm run prepush:check` -> Toàn bộ quy trình kiểm soát chất lượng tích hợp đều thông qua (Passed).

---

## 2. Manual Test Matrix

### 2.1. Đọc và tải danh sách
- **Hành động**: Truy cập `/admin/landing-pages`.
- **Kỳ vọng**:
  - Dữ liệu hiển thị dạng bảng chuẩn, phân trang chính xác.
  - Skeletons hiển thị khi đang gọi API.
  - Trạng thái lọc theo loại trang và trạng thái hoạt động chính xác.
- **Kết quả**: Đạt (Pass).

### 2.2. Thêm mới Landing Page
- **Hành động**: Click "Thêm Landing Page", điền thông tin:
  - Title: `Điểm du lịch Đà Nẵng hot nhất`
  - Slug: `diem-du-lich-da-nang-hot-nhat` (auto gợi ý từ title)
  - Chọn Page Type, điền Intro.
  - Điền SEO Title, SEO Description.
  - Điền filters JSON hợp lệ: `{"district": "Son Tra"}`.
  - Thêm FAQ content blocks.
  - Lưu dữ liệu.
- **Kỳ vọng**: Gọi API POST thành công, hiển thị toast báo tin lành và đóng drawer, table tự động invalidate cập nhật dòng mới.
- **Kết quả**: Đạt (Pass).

### 2.3. Bắt lỗi nhập liệu & validate JSON
- **Hành động**: Nhập bộ lọc `filters` sai định dạng JSON (ví dụ thiếu ngoặc nhọn) và bấm Lưu.
- **Kỳ vọng**: Yup chặn sự kiện submit, hiển thị lỗi màu đỏ `"Định dạng JSON bộ lọc không hợp lệ. Vui lòng kiểm tra lại cú pháp."` ngay dưới ô nhập liệu.
- **Kết quả**: Đạt (Pass).

### 2.4. Bật tắt trạng thái nhanh (Inline Switch)
- **Hành động**: Click Toggle Switch ở cột Trạng thái.
- **Kỳ vọng**: API PATCH gửi đi, toast thành công xuất hiện, trạng thái Toggle Switch chuyển đổi và cập nhật UI ngay lập tức.
- **Kết quả**: Đạt (Pass).

### 2.5. Cảnh báo thay đổi chưa lưu (Unsaved changes guard)
- **Hành động**: Điền tiêu đề, không lưu, bấm nút "Hủy".
- **Kỳ vọng**: Drawer hiển thị popup cảnh báo `"Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?"` để tránh việc vô tình hủy công sức soạn thảo.
- **Kết quả**: Đạt (Pass).

### 2.6. Xóa Landing Page
- **Hành động**: Bấm Xóa, xác nhận popup.
- **Kỳ vọng**: API DELETE gửi đi, toast thông báo thành công hiển thị, dòng dữ liệu biến mất khỏi bảng dữ liệu.
- **Kết quả**: Đạt (Pass).
