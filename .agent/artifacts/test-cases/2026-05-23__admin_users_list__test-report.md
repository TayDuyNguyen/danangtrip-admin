# QA Test Report: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `testing & QA report`

---

## 1) Thống Kê Kết Quả Kiểm Thử (QA Test Summary)

Chúng tôi đã chạy kiểm thử toàn diện trên toàn bộ hệ thống để đảm bảo chất lượng giao diện và mã nguồn:

| Giai đoạn kiểm thử | Lệnh thực thi | Kết quả | Ghi chú |
|-------------------|---------------|---------|---------|
| **1. Linter** | `npm run lint` | **PASS** | 0 lỗi cú pháp, 0 cảnh báo. Đã tinh chỉnh triệt để cảnh báo React 19 render. |
| **2. Type Check** | `npm run typecheck` | **PASS** | Hoàn toàn khớp kiểu dữ liệu tĩnh (`tsc -b` thành công). |
| **3. Production Build**| `npm run build` | **PASS** | Đóng gói thành công. Cảnh báo rollup lottie-web là non-blocking. |
| **4. E2E Console Test**| `npm run test:console`| **PASS** | 6/6 kịch bản Playwright (bao gồm `/admin/users`) passed thành công tuyệt đối. |
| **5. Cổng chất lượng** | `npm run prepush:check`| **PASS** | Trình kiểm tra tích hợp thông báo thành công: `All checks passed!`. |

---

## 2) Chi Tiết Các Kịch Bản Thử Nghiệm Giao Diện (Manual QA Scenarios)

### 2.1) Kịch bản 1: Đồng bộ hóa URL (URL Sync)
- **Các bước thực hiện:**
  1. Người dùng nhập `"Nguyễn Văn"` vào ô tìm kiếm Search.
  2. Chọn Role: `Admin` trong dropdown.
  3. Chọn Trạng thái: `Hoạt động`.
  4. Bảng danh sách tự động tải lại và URL cập nhật thành: `?q=Nguyễn+Văn&role=admin&status=active&page=1&per_page=10`.
  5. Nhấn F5 tải lại trang.
- **Kết quả mong muốn:** Bộ lọc trên URL được phân tích ngược lại, điền đầy đủ vào các ô input/select tương ứng, và danh sách lọc giữ nguyên.
- **Trạng thái:** **PASS** (Đã đồng bộ hóa an toàn trong render phase).

### 2.2) Kịch bản 2: Cơ chế Tự Bảo vệ (Self-Protection - BR-01)
- **Các bước thực hiện:**
  1. Tìm dòng chứa tài khoản có ID trùng khớp với ID của Admin đang đăng nhập.
  2. Quan sát giao diện hành động của dòng này.
- **Kết quả mong muốn:**
  - Cột Checkbox trên dòng này bị ẩn/khóa (`disabled`).
  - Cột Role badge và Status badge bị vô hiệu hóa (`disabled` và không có hiệu ứng hover pointer).
  - Nút Khóa (Ban) và Xóa (Trash) trên cột Thao tác bị ẩn/disable.
- **Trạng thái:** **PASS** (Bảo vệ an toàn 100% tránh việc Admin tự khóa tài khoản của chính mình).

### 2.3) Kịch bản 3: Hộp thoại Xác nhận Nâng quyền & Xóa
- **Các bước thực hiện:**
  1. Nhấn vào Role Badge của một người dùng thường và chọn `Admin`.
  2. Nhấn nút Xóa (Trash) trên cột thao tác của một người dùng bất kỳ.
- **Kết quả mong muốn:**
  - Đối với nâng quyền: Xuất hiện `UpdateRoleDialog` cảnh báo rủi ro chiếm quyền Admin.
  - Đối với xóa: Xuất hiện `DeleteUserDialog` cảnh báo màu đỏ kèm lưu ý mất đơn hàng/đánh giá.
- **Trạng thái:** **PASS** (Hoạt động chính xác, nút xác nhận hiển thị trạng thái loading mượt mà).

---

## 3) Đánh Giá Kết Luận (Verdict)
- **QA Verdict:** **`READY`** 🟢
- **Rủi ro còn lại:** Không phát hiện rủi ro nào. Màn hình hoạt động đồng bộ với API backend hiện tại của hệ thống.
