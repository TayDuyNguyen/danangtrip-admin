# Phân tích Màn hình Báo cáo Doanh thu (admin_reports_revenue)

> **Ngày tạo:** 22/05/2026  
> **Feature Slug:** `admin_reports_revenue`  
> **Route chính:** `/admin/reports/revenue`  
> **Quyền truy cập:** 🛡️ Admin / Staff (Chỉ dành cho quản trị viên đã đăng nhập)  
> **Tài liệu nguồn:** `D:\DATN\DATN_Tài liệu\docs\page\admin_reports_revenue.md`

---

## 1. Mục tiêu Nghiệp vụ & Triết lý Thiết kế

Màn hình **Báo cáo Doanh thu** cung cấp cái nhìn toàn diện, đa chiều và chính xác về tình hình tài chính của hệ thống đặt tour du lịch Đà Nẵng. Nó giúp ban quản trị theo dõi dòng tiền, đo lường hiệu suất kinh doanh của các tour du lịch hàng đầu, phân tích hành vi thanh toán của khách hàng qua các cổng và xuất dữ liệu báo cáo phục vụ kế toán.

### Triết lý Thiết kế UI/UX (Aesthetics First):
- **Premium Glassmorphism**: Sử dụng nền mờ sương (`backdrop-blur-md bg-white/80`), viền siêu mỏng (`border-slate-100`), bóng đổ nhẹ nhàng (`shadow-xs`) tạo cảm giác hiện đại và tinh tế.
- **Dynamic Micro-animations**: Tương tác hover trên các thẻ số liệu, dòng bảng và các cột biểu đồ làm giao diện sinh động và phản hồi nhanh chóng.
- **Trực quan hóa Dữ liệu (Recharts)**:
  - Màu sắc phối hợp trang nhã: **#14b8a6 (Teal)** cho xu hướng doanh thu tích cực, **#3b82f6 (Blue)** cho giao dịch, **#ef4444 (Red)** cho hoàn tiền, **#FF6B35 (Orange)** cho cổng MoMo.
  - Sử dụng Area Chart có độ cong mềm mại và gradient chuyển màu chuyên nghiệp.
- **Resilient Mock/Real Toggle**: Cho phép kiểm thử viên và quản trị viên linh hoạt chuyển đổi giữa dữ liệu sống từ API Laravel và bộ Mock Data được chuẩn bị kỹ lượng mà không làm gián đoạn trải nghiệm sử dụng.

---

## 2. Phân rã Bố cục Giao diện (Layout Breakdown)

Giao diện trang được chia làm các khu vực chức năng chính theo thứ tự từ trên xuống dưới:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HEADER: Breadcrumb + Tiêu đề + [Mock Toggle] [Xuất Excel]    │
├─────────────────────────────────────────────────────────────────┤
│ 2. FILTER BAR: Từ ngày + Đến ngày + Nút lọc nhanh + Cổng thanh toán│
├─────────────────────────────────────────────────────────────────┤
│ 3. STATS ROW: [Tổng DT] [TB/Ngày] [Giao dịch] [Đã hoàn tiền]     │
├─────────────────────────────────────────────────────────────────┤
│ 4. BIỂU ĐỒ CHÍNH (HÀNG 1 - 2 cột):                               │
│    - [Line/Area: Xu hướng doanh thu] | - [Bar: Top 5 Tour]      │
├─────────────────────────────────────────────────────────────────┤
│ 5. BIỂU ĐỒ PHỤ (HÀNG 2 - 2 cột):                                │
│    - [Bar: Cổng thanh toán]          | - [Donut: Cơ cấu cổng]   │
├─────────────────────────────────────────────────────────────────┤
│ 6. CHI TIẾT GIAO DỊCH (HÀNG 3 - 1 cột):                          │
│    - Bảng chi tiết có phân trang, trạng thái & liên kết mượt mà │
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết các khối UI:
1. **Page Header**:
   - Breadcrumb: `Trang chủ` / `Báo cáo` / `Báo cáo Doanh thu`.
   - Tiêu đề chính: "Báo cáo Doanh thu" + Dòng mô tả phụ.
   - Nút bật tắt chế độ giả lập (Mock Mode Toggle): Hiển thị trạng thái On/Off màu cam bắt mắt.
   - Nút **Xuất Excel**: Tương tác mượt mà, hỗ trợ trạng thái xoay loading khi đang tải xuống.
2. **Filter Bar**:
   - Hai ô chọn ngày bắt đầu ("Từ ngày") và ngày kết thúc ("Đến ngày") định dạng chuẩn HTML Date.
   - Bộ phím lọc nhanh dạng Pill buttons: **7 ngày**, **30 ngày**, **3 tháng**, **Năm nay**. Click sẽ tự động tính toán khoảng ngày tương ứng và điền vào ô date.
   - Hộp chọn cổng thanh toán (Tất cả / MoMo / VNPay / ZaloPay).
   - Nút "Áp dụng" (Blue `#0066CC` hoặc Tailwind `bg-blue-600`) và nút "Mặc định" (Reset).
3. **Stats Row (Thống kê nhanh)**:
   - 4 thẻ hiển thị chỉ số chính:
     - **Tổng doanh thu**: Màu chủ đạo Indigo/Teal kèm trend badge phần trăm so với kỳ trước.
     - **Trung bình / Ngày**: Màu chủ đạo Emerald/Green thể hiện hiệu năng hoạt động.
     - **Giao dịch**: Số lượng thanh toán thành công (Màu Blue).
     - **Đã hoàn tiền**: Số tiền hoàn lại cho các booking bị hủy (Màu Red).
4. **Hàng 1 — Trực quan xu hướng & sản phẩm**:
   - **Bên trái (Line/Area Chart)**: Xu hướng doanh thu theo khoảng thời gian. Có phím chuyển đổi chế độ xem nhanh: **Ngày / Tuần / Tháng**. Đường đồ thị cong mềm mại (`monotone`), có phủ gradient nền mịn.
   - **Bên phải (Horizontal Bar Chart)**: Top 5 Tour có doanh thu cao nhất. Giúp ban quản lý nhận diện nhanh sản phẩm chủ lực. Tên tour dài được cắt ngắn thông minh bằng dấu ba chấm (`ellipsis`).
5. **Hàng 2 — Cơ cấu & Kênh thanh toán**:
   - **Bên trái (Vertical Bar Chart)**: Doanh thu chia theo cổng thanh toán (MoMo, VNPay, ZaloPay) dạng cột dọc sinh động.
   - **Bên phải (Donut Chart)**: Tỷ lệ phần trăm đóng góp doanh thu của từng cổng thanh toán, hiển thị tổng tiền ngay tâm biểu đồ.
6. **Hàng 3 — Bảng chi tiết giao dịch**:
   - Bảng hiển thị: Mã giao dịch, Mã đơn hàng (có link click sang chi tiết đơn hàng `/admin/bookings/{id}`), Tên khách hàng (kèm avatar nhỏ), Tên tour, Cổng thanh toán (Badge màu), Số tiền thanh toán, Ngày giờ giao dịch chi tiết, Trạng thái (Paid/Pending/Refunded/Failed).
   - Phân trang dưới đáy bảng: Hiển thị dòng số trang thân thiện, nút "Trước" & "Sau".

---

## 3. Danh sách Components & Sơ đồ Cấu trúc

Trang sẽ được tổ chức theo kiến trúc module sạch như sau:

```
src/pages/Reports/RevenueReport/
├── index.tsx                         # Trang chủ điều phối State chính & URLSearchParams
└── components/
    ├── ReportFilterBar.tsx           # Bộ lọc khoảng ngày, phím tắt & cổng thanh toán
    ├── RevenueStatsCards.tsx         # Hàng thẻ hiển thị số liệu thống kê nhanh
    ├── RevenueReportCharts.tsx       # Tổng hợp các biểu đồ Recharts (Xu hướng, Top Tour, Cổng)
    └── RevenueReportTable.tsx        # Bảng dữ liệu giao dịch chi tiết kèm phân trang
```

---

## 4. API Endpoints & Khảo sát Dữ liệu

| Hành động | Method | Endpoint | Tham số đầu vào (Params) | Dữ liệu trả về (Response) |
|---|---|---|---|---|
| **Lấy số liệu xu hướng** | GET | `/admin/dashboard/revenue` | `period` (day/week/month), `from` (YYYY-MM-DD), `to` (YYYY-MM-DD) | Mảng chứa `{ date, revenue }` |
| **Lấy bảng chi tiết** | GET | `/admin/reports/revenue-detail` | `from`, `to`, `payment_gateway`, `page`, `per_page` | Tổng quan tóm tắt (`summary`) + Mảng phân trang các giao dịch |
| **Xuất Excel** | GET | `/admin/payments/export` | `date_from`, `date_to`, `payment_gateway` | File Excel nhị phân (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) |

---

## 5. Chiến lệnh Xử lý Hiệu năng & Tải dữ liệu

Để tối ưu hóa trải nghiệm quản trị viên và tránh tình trạng nghẽn cổ chai:
1. **Parallel Query Execution**: Sử dụng cơ chế nạp song song của TanStack Query:
   - Một truy vấn lấy dữ liệu biểu đồ xu hướng doanh thu (`/admin/dashboard/revenue`).
   - Một truy vấn lấy dữ liệu tóm tắt và bảng chi tiết giao dịch (`/admin/reports/revenue-detail`).
   - Hai truy vấn này chạy hoàn toàn độc lập, không bị ràng buộc ( waterfall ), giúp màn hình hiển thị tức thì các phần dữ liệu đã tải xong.
2. **URL SearchParams Synchronization**: Toàn bộ trạng thái bộ lọc (Từ ngày, Đến ngày, Cổng thanh toán, Số trang hiện tại) được đồng bộ thời gian thực lên thanh URL.
   - Giúp quản trị viên có thể F5 tải lại trang hoặc chia sẻ link báo cáo chính xác cho đồng nghiệp mà không bị mất bộ lọc.
3. **Smart Skeletons**: Khi đang tải dữ liệu, hệ thống hiển thị hiệu ứng skeleton nhấp nháy mượt mà trùng khớp 100% với bố cục biểu đồ và bảng thật, loại bỏ cảm giác giật cục màn hình.
4. **Resilient Data Sanitization (Mapper)**: Toàn bộ dữ liệu thô từ Laravel API sẽ đi qua tầng mapper trong `report.mapper.ts`. Sử dụng các hàm chuyển đổi an toàn (`toNumberSafe`, `toArraySafe`) để đảm bảo không bao giờ bị sập màn hình (White Screen of Death) nếu backend gửi sai kiểu dữ liệu hoặc bị khuyết thiếu trường.

---

## 6. Rủi ro & Giải pháp Phòng ngừa

| Rủi ro tiềm ẩn | Mức độ | Giải pháp phòng ngừa |
|---|---|---|
| Môi trường API Laravel chưa được seeder đầy đủ dữ liệu thanh toán sống | Trung bình | Xây dựng bộ Mock Data mô phỏng chính xác và sinh động (đầy đủ biểu đồ xu hướng, cơ cấu Donut, bảng giao dịch 5 trang) để hệ thống hoạt động mượt mà trong chế độ giả lập. |
| Khoảng cách ngày quá rộng (ví dụ: lọc 2 năm) gây chậm tải dữ liệu biểu đồ | Thấp | Giới hạn hiển thị hoặc gộp nhóm period thông minh (tự động chuyển `period=month` nếu khoảng lọc > 90 ngày). |
| Lỗi định dạng font hoặc mã hóa tiếng Việt khi xuất file CSV giả lập | Thấp | Sử dụng ký tự Byte Order Mark (BOM `\uFEFF`) ở đầu chuỗi CSV để Excel hiển thị tiếng Việt có dấu chuẩn 100%. |

---

> [!NOTE]  
> Phân tích màn hình hoàn tất và không phát sinh rủi ro chặn (blocker). Tiến hành cập nhật trạng thái làm việc sang bước **03-types-api-contract** để triển khai hạ tầng kiểu dữ liệu và module API.
