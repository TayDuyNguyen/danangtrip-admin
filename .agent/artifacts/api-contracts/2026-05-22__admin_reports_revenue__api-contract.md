# Hợp đồng dữ liệu & Khai báo API (admin_reports_revenue)

Tài liệu này xác định hợp đồng giao tiếp giữa giao diện quản trị (`danangtrip-admin`) và backend API Laravel (`danangtrip-api`) cho chức năng **Báo cáo Doanh thu**.

---

## 1. Khảo sát Endpoints API thực tế

Hệ thống sử dụng song song 3 endpoints chính để tổng hợp dữ liệu trên cùng một màn hình báo cáo doanh thu:

### 1.1. Lấy dữ liệu biểu đồ xu hướng (Trend Chart)
* **Endpoint:** `GET /api/v1/admin/dashboard/revenue`
* **Quyền hạn:** `throttle:api.admin`, `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `period` (string, optional): Tần suất gộp nhóm (`day` | `week` | `month` | `year`). Mặc định: `month`.
  * `from` (string, optional, YYYY-MM-DD): Ngày bắt đầu lọc.
  * `to` (string, optional, YYYY-MM-DD): Ngày kết thúc lọc.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": {
      "period": "month",
      "from": "2026-05-01",
      "to": "2026-05-22",
      "stats": [
        {
          "period": "2026-05-20",
          "total_revenue": "12500000.00",
          "transaction_count": 5
        },
        {
          "period": "2026-05-21",
          "total_revenue": "8700000.00",
          "transaction_count": 3
        }
      ]
    }
  }
  ```

### 1.2. Lấy dữ liệu Top Tour doanh thu cao (Revenue by Tour)
* **Endpoint:** `GET /api/v1/admin/reports/revenue-detail`
* **Quyền hạn:** `throttle:api.admin`, `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `from` (string, optional, YYYY-MM-DD): Ngày bắt đầu lọc.
  * `to` (string, optional, YYYY-MM-DD): Ngày kết thúc lọc.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": [
      {
        "tour_id": 1,
        "tour_name": "Tour Ngũ Hành Sơn - Hội An 1 ngày",
        "booking_count": 14,
        "total_revenue": "32500000.00"
      },
      {
        "tour_id": 3,
        "tour_name": "Tour Bà Nà Hills Cáp Treo",
        "booking_count": 8,
        "total_revenue": "24800000.00"
      }
    ]
  }
  ```

### 1.3. Lấy bảng giao dịch chi tiết phân trang (Transaction Table)
* **Endpoint:** `GET /api/v1/admin/payments`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `date_from` (string, optional, YYYY-MM-DD): Ngày bắt đầu.
  * `date_to` (string, optional, YYYY-MM-DD): Ngày kết thúc.
  * `payment_gateway` (string, optional): Cổng thanh toán (`momo` | `vnpay` | `zalopay`).
  * `page` (number, optional): Số trang hiện tại.
  * `per_page` (number, optional): Số bản ghi trên mỗi trang.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "message": "Payments retrieved successfully.",
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 205,
          "transaction_code": "VNP1482093",
          "amount": "2500000.00",
          "payment_gateway": "VNPay",
          "payment_status": "success",
          "paid_at": "2026-05-22T10:15:30.000000Z",
          "created_at": "2026-05-22T10:14:00.000000Z",
          "booking": {
            "id": 10452,
            "booking_code": "DNT10452",
            "user": {
              "id": 42,
              "full_name": "Nguyễn Hoàng Anh",
              "avatar": "https://api.danangtrip.id.vn/storage/avatars/user42.png"
            }
          }
        }
      ],
      "last_page": 5,
      "per_page": 10,
      "total": 50
    }
  }
  ```

### 1.4. Xuất file Excel
* **Endpoint:** `GET /api/v1/admin/payments/export`
* **Quyền hạn:** `throttle:api.exports`, `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `date_from`, `date_to`, `payment_gateway`
* **Kiểu phản hồi (Response):** File nhị phân `Blob` (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

---

## 2. Mô hình hóa Kiểu dữ liệu TypeScript & View Model

Đã triển khai đồng bộ hạ tầng kiểu tại [report.dataHelper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/report.dataHelper.ts):

* **RevenueReportFilters**: Ràng buộc dữ liệu bộ lọc tìm kiếm.
* **RevenueReportViewModel**: Mô hình dữ liệu hoàn chỉnh, an toàn dùng trực tiếp tại giao diện người dùng (UI Components), cấu trúc gồm 3 nhánh:
  * `stats`: Tổng doanh thu, Trung bình/ngày, Tổng giao dịch, Tổng tiền hoàn, kèm theo các trend badges tích hợp sẵn.
  * `charts`: Xu hướng doanh thu (`trend`), Xếp hạng tour (`topTours`), Tỷ lệ đóng góp cổng thanh toán (`gateways`).
  * `table`: Danh sách giao dịch hiển thị (`items`) đã được định dạng chuẩn tiền tệ, định dạng ngày tháng Việt Nam và thông tin khách hàng, tích hợp cùng thông tin phân trang (`pagination`).

---

## 3. Bản đồ ánh xạ dữ liệu (Data Mapper)

Hàm mapper chính `mapRevenueReport` đã được định nghĩa tại [report.mapper.ts](file:///d:/DATN/danangtrip-admin/src/dataHelper/report.mapper.ts):

* **Chức năng:**
  1. Gộp song song kết quả từ 3 API.
  2. Thực hiện làm sạch dữ liệu (Data Sanitization) bằng helper an toàn `toNumberSafe` tránh sập trang do lỗi kiểu dữ liệu từ DB (như chuỗi thay vì số).
  3. Tự động tính toán chỉ số trung bình doanh thu mỗi ngày dựa trên khoảng thời gian lọc động.
  4. Phân tách định dạng thời gian Việt Nam (`DD/MM/YYYY`) và giờ phút (`HH:mm`) cho bảng chi tiết.
  5. Tính toán tỉ trọng đóng góp doanh thu theo phần trăm của MoMo, VNPay, ZaloPay làm đầu vào cho biểu đồ tròn.

---

> [!NOTE]  
> Hợp đồng dữ liệu đã được triển khai hoàn chỉnh trong codebase của `danangtrip-admin`. API đã khớp 100% với tài liệu và backend Laravel. Sẵn sàng chuyển tiếp sang bước tiếp theo **04-layout-routing**.
