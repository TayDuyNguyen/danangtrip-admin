# Tài liệu Kỹ thuật: Thiết kế Giao diện mỹ thuật (UI Component Specification)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Thông số Giao diện`
- **Ngày lập:** 2026-05-17
- **Trạng thái:** **FULLY BUILT & STYLED**

---

## 1. Bản tả Thư mục Thành phần (Component Catalog)

Tất cả các thành phần giao diện mỹ thuật cao cấp đã được phát triển thành công tại thư mục [components](file:///d:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components):

### A. Huy hiệu Trạng thái giao dịch (`PaymentStatusBadge.tsx`)
- **Vai trò:** Hiển thị trạng thái giao dịch trực quan.
- **Phong cách mỹ thuật:** Kết hợp nền nhạt mờ (`backdrop-blur-xs`) với màu chữ HSL tương phản sâu, kèm theo một chấm tròn chỉ thị trạng thái nhấp nháy phát sáng (**glowing bullet**) cho các giao dịch thành công.
- **Ánh xạ màu sắc:**
  - `pending`: Amber (vàng ấm).
  - `success`: Emerald (xanh lục bảo).
  - `failed`: Slate (xám chì).
  - `refunded`: Rose (đỏ hồng thảo).

### B. Huy hiệu Cổng thanh toán (`PaymentGatewayBadge.tsx`)
- **Vai trò:** Giúp người quản trị dễ dàng nhận biết phương thức thanh toán của khách hàng.
- **Phong cách mỹ thuật:** Tích hợp trực tiếp logo nhãn hiệu tối giản dưới dạng đồ họa vector SVG sắc nét:
  - **MoMo:** Chữ `M` trắng trên nền hình tròn hồng `#D82D8E` đặc trưng.
  - **VNPay:** Chữ `VN` trắng trên nền hình tròn xanh dương `#005AAB` đặc trưng.
  - **ZaloPay:** Chữ `Z` trắng trên nền hình tròn xanh lá `#00C2FF` đặc trưng.

### C. Khối chỉ số Tóm tắt (`PaymentStatsRow.tsx`)
- **Vai trò:** Trình bày 4 số liệu tài chính quan trọng của hệ thống: Doanh thu, Thành công, Đang chờ, Đã hoàn.
- **Phong cách mỹ thuật:** Thẻ kính mờ Glassmorphism, bo góc rộng `rounded-2xl` (16px), phản hồi khi hover di chuột (`group-hover:scale-110`, di chuyển nâng card lên 4px, đổ bóng sâu rực rỡ mang màu sắc đặc trưng của từng card).
- **Hỗ trợ tải:** Tích hợp khối giả lập dữ liệu (**skeleton animate-pulse**) đồng điệu.

### D. Thanh bộ lọc đa chức năng (`PaymentFilterBar.tsx`)
- **Vai trò:** Tìm kiếm, lựa chọn trạng thái, cổng giao dịch và khoảng thời gian.
- **Phong cách mỹ thuật:** Đầu vào nhập dữ liệu phẳng màu xám nhạt, đổi màu viền sang Teal `#14B8A6` khi focus. Nút xuất Excel màu Teal nổi bật, có hiệu ứng bouncing khi đang xử lý tải xuống.

### E. Bảng dữ liệu Giao dịch (`PaymentTable.tsx`)
- **Vai trò:** Hiển thị danh sách giao dịch, phân trang và các hành động tương tác.
- **Phong cách mỹ thuật:** Cột dữ liệu lồng ghép Avatar khách hàng tròn, các liên kết click nổi màu Teal quyến rũ.
- **Bảo mật phân quyền:** Tích hợp kiểm tra vai trò `user?.role === 'admin'`. Nếu là nhân viên (`staff`), nút hoàn tiền bị khóa (`disabled`), và khi di chuột hover vào sẽ hiển thị một Tooltip chỉ dẫn cực kỳ trực quan trên nền đen mờ.

### F. Hộp thoại Xác nhận hoàn tiền (`RefundPaymentDialog.tsx`)
- **Vai trò:** Hộp thoại cảnh báo và thu thập lý do hoàn trả tiền.
- **Phong cách mỹ thuật:** Phủ lớp kính mờ tối màu (`bg-slate-900/60 backdrop-blur-xs`), khối cảnh báo Alert màu cam nổi bật với biểu tượng `AlertTriangle`. Form kiểm tra an toàn tích hợp spinner xoay tròn khi đang gửi yêu cầu hoàn tiền.
