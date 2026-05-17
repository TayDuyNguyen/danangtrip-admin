# Báo cáo Phân tích Giao diện: Danh sách Giao dịch (Admin Payment List)

- **Feature Slug:** `admin-payment-list`
- **Mã định danh:** `Danh sách Giao dịch`
- **Ngày lập:** 2026-05-17
- **Bố cục mục tiêu:** `/admin/payments`

---

## 1. Phân tích Cấu trúc & Bố cục Giao diện (Layout Analysis)

Màn hình Quản lý Giao dịch Thanh toán được thiết kế theo tỷ lệ chuẩn của Admin Dashboard, hỗ trợ phản hồi (Responsive) hoàn hảo từ Desktop đến Tablet. Cấu trúc chia làm 3 phân vùng chính từ trên xuống dưới:

### A. Thanh tiêu đề & Tóm tắt số liệu (Header & Stats Summary)
- **Tiêu đề trang (Page Title):** H1 với phông chữ `Outfit`/`Inter` sang trọng, cỡ chữ `text-2xl` hoặc `text-3xl font-bold tracking-tight text-slate-900`.
- **Hàng số liệu thống kê (Stats Summary Row):** 4 thẻ Glassmorphic thông số đặt ngang:
  1. **Tổng doanh thu thực tế (Total Revenue):** Tính từ các giao dịch có trạng thái `success`.
  2. **Giao dịch thành công (Paid Transactions):** Đếm số giao dịch `success`.
  3. **Giao dịch đang chờ (Pending Transactions):** Đếm số giao dịch `pending`.
  4. **Số tiền hoàn trả (Refunded Amount):** Tính tổng số tiền có trạng thái `refunded`.
- *Hiệu ứng mỹ thuật:* Sử dụng viền mờ `border border-white/20`, bóng đổ nhẹ `shadow-sm`, nền kính mờ `bg-white/80 backdrop-blur-md` và các icon màu sắc tương phản tinh tế (Teal cho doanh thu, Emerald cho thành công, Amber cho chờ, Rose cho hoàn tiền).

### B. Bộ lọc tích hợp (Integrated Filter Bar)
- **Thanh tìm kiếm (Search Box):** Tìm kiếm theo Mã giao dịch (`transaction_code`) hoặc Mã đặt chỗ (`booking_code`). Thiết lập cơ chế Trì hoãn sự kiện (Debounce 500ms) để tối ưu truy vấn API.
- **Bộ lọc Trạng thái (Status Filter):** Menu chọn lựa (Dropdown) chứa các trạng thái giao dịch: *Tất cả*, *Đang chờ*, *Thành công*, *Lỗi*, *Đã hoàn tiền*.
- **Bộ lọc Cổng thanh toán (Gateway Filter):** Dropdown chọn: *Tất cả*, *MoMo*, *VNPay*, *ZaloPay*.
- **Bộ lọc Khoảng ngày (Date Range Filter):** Lọc theo khoảng thời gian thanh toán (`date_from` đến `date_to`).
- **Nút xuất Excel (Export Button):** Đặt ở góc phải, sử dụng màu nhấn Teal chủ đạo `#14B8A6`, khi hover sẽ chuyển màu mượt mà trong 150ms kèm biểu tượng Excel/Download.

### C. Bảng dữ liệu chính (Main Transaction Table)
- **Bảng dữ liệu (Responsive Table):**
  - **Cột 1: Mã giao dịch** (`transaction_code`) - In đậm, dễ đọc.
  - **Cột 2: Đơn hàng** (`booking_code`) - Clickable link trỏ đến chi tiết đơn đặt chỗ `/admin/bookings`.
  - **Cột 3: Khách hàng** - Kết hợp avatar tròn nhỏ và thông tin Email/Tên khách hàng.
  - **Cột 4: Số tiền** - Định dạng tiền tệ VND chuyên nghiệp (ví dụ: `1,500,000 ₫`).
  - **Cột 5: Cổng thanh toán** - Hiển thị logo/badge đặc trưng của MoMo (hồng), VNPay (xanh dương), ZaloPay (xanh lá).
  - **Cột 6: Trạng thái** - Huy hiệu màu sắc mềm mại biểu thị trạng thái tương ứng.
  - **Cột 7: Ngày giao dịch** - Định dạng DD/MM/YYYY HH:mm.
  - **Cột 8: Hành động** - Nút "Hoàn tiền" (chỉ kích hoạt cho vai trò Admin khi giao dịch có trạng thái `success`).
- **Thanh phân trang (Pagination):** Hiển thị số lượng bản ghi hiện tại và bộ chọn tiến lùi.

---

## 2. Đối chiếu Token Thiết kế với `DESIGN.md` (Design Token Audit)

| Tham số thiết kế | Giá trị áp dụng | Quy định trong `DESIGN.md` | Đánh giá |
| --- | --- | --- | --- |
| **Màu chủ đạo (Primary)** | Teal (`#14B8A6`) | `#14B8A6` (Primary Accent) | Khớp hoàn hảo |
| **Nền cơ sở (Neutral)** | Trắng tinh khôi (`#FFFFFF`) | `#FFFFFF` | Khớp hoàn hảo |
| **Phông chữ (Typography)** | `Outfit` / `Inter` | Google Fonts Outfit & Inter | Đảm bảo tính sang trọng |
| **Hình học (Shapes)** | Bo góc `rounded-xl` (12px) | Corner roundness (medium/large) | Đạt chuẩn thiết kế |
| **Chuyển động (Motion)** | `transition-all duration-150 ease-in-out` | Timing 150ms, ease transitions | Mượt mà, nhạy bén |

---

## 3. Phân rã Thành phần (Component Breakdown)

Để tối ưu hóa mã nguồn và dễ bảo trì, cấu trúc thành phần được phân rã rõ rệt:

1. **`PaymentListIndex` (Trang chính):** Quản lý luồng trạng thái bộ lọc (`search`, `status`, `gateway`, `date_range`, `page`) và đồng bộ lên URL Query Params để lưu trạng thái trang.
2. **`PaymentStatsRow` (NEW):** Nhận số liệu trực tiếp từ API tổng hợp và hiển thị 4 thẻ Glassmorphic thông số tổng quan.
3. **`PaymentFilterBar` (NEW):** Chứa các bộ chọn lựa và ô nhập tìm kiếm.
4. **`PaymentTable` (NEW):** Hiển thị dữ liệu, hiển thị skeleton khi đang tải, và tích hợp bộ phân trang.
5. **`PaymentStatusBadge` (NEW):** Xử lý ánh xạ màu sắc trạng thái giao dịch:
   - `pending`: Nền Amber nhạt, chữ Amber đậm.
   - `success`: Nền Emerald nhạt, chữ Emerald đậm.
   - `failed`: Nền Slate nhạt, chữ Slate đậm.
   - `refunded`: Nền Rose nhạt, chữ Rose đậm.
6. **`PaymentGatewayBadge` (NEW):** Hiển thị logo/badge tối giản chuyên nghiệp cho từng cổng.
7. **`RefundPaymentDialog` (NEW):** Modal biểu mẫu nhập lý do hoàn trả tiền, sử dụng validation schema bằng Yup để ngăn lý do quá ngắn.

---

## 4. Bản đồ Dữ liệu và Ánh xạ API (API & Data Mapping)

### Endpoint sử dụng: `GET /admin/payments`
```json
// Yêu cầu bộ lọc:
{
  "search": "string (mã giao dịch/mã đơn)",
  "payment_status": "pending | success | failed | refunded",
  "payment_gateway": "momo | vnpay | zalopay",
  "date_from": "YYYY-MM-DD",
  "date_to": "YYYY-MM-DD",
  "page": 1,
  "per_page": 10
}
```

### Ánh xạ Đối tượng dữ liệu (Mapper)

| Trường API Backend (`AdminRawPaymentItem`) | Trường hiển thị UI (`PaymentItem`) | Kiểu dữ liệu chuẩn hóa | Quy tắc Mapper |
| --- | --- | --- | --- |
| `id` | `id` | `number` | Giữ nguyên |
| `transaction_code` | `transactionCode` | `string` | Giữ nguyên |
| `booking.booking_code` | `bookingCode` | `string` | Trích xuất từ quan hệ `booking` |
| `booking.customer.name` | `customerName` | `string` | Trích xuất từ quan hệ `booking.user` |
| `amount` | `amount` | `number` | Chuyển đổi an toàn qua `toNumberSafe` |
| `payment_method` | `gateway` | `'momo' \| 'vnpay' \| 'zalopay'` | Đồng bộ chữ thường |
| `payment_status` | `status` | `'pending' \| 'success' \| 'failed' \| 'refunded'` | Chuẩn hóa ánh xạ trạng thái |
| `created_at` | `transactionDate` | `string` | Định dạng ngày theo chuẩn vùng |

---

## 5. Quy tắc Nghiệp vụ & Kịch bản Tương tác (Business Rules & Edge Cases)

1. **Khóa chức năng Hoàn tiền (Refund Gating):**
   - Chỉ được hoàn tiền khi giao dịch có trạng thái `payment_status === 'success'`.
   - Nút hoàn tiền bị ẩn hoặc vô hiệu hóa kèm tooltip giải thích nếu giao dịch đã ở trạng thái `refunded`, `failed` hoặc `pending`.
2. **Kiểm soát vai trò (Role Control):**
   - Tài khoản `staff` chỉ có quyền xem danh sách và xuất file Excel.
   - Khi `staff` hover vào nút hoàn tiền, hiển thị tooltip thông báo: *"Chỉ người quản trị (Admin) mới có quyền thực hiện hoàn tiền"*, nút hoàn tiền ở trạng thái `disabled`.
3. **Trường hợp danh sách trống (Empty State):**
   - Thiết kế giao diện trống cực kỳ bắt mắt với icon minh họa mờ ảo, thông báo thân thiện: *"Không tìm thấy giao dịch nào khớp với bộ lọc"* kèm theo nút bấm *"Xóa tất cả bộ lọc"* để đưa người dùng trở lại danh sách mặc định.
4. **Xử lý lỗi kết nối / Lỗi API (Error State):**
   - Hiển thị Toast thông báo lỗi trực quan từ thư viện `Sonner` khi API xảy ra sự cố, đồng thời cung cấp nút "Tải lại trang" trên vùng dữ liệu bị lỗi.
