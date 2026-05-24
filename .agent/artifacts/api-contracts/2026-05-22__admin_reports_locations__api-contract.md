# Hợp đồng dữ liệu & Khai báo API (admin_reports_locations)

Tài liệu này xác định hợp đồng giao tiếp giữa giao diện quản trị (`danangtrip-admin`) và backend API Laravel (`danangtrip-api`) cho chức năng **Báo cáo Địa điểm**.

---

## 1. Khảo sát Endpoints API thực tế

Hệ thống sử dụng các endpoints dưới đây để tổng hợp dữ liệu cho màn hình báo cáo địa điểm:

### 1.1. Lấy dữ liệu thống kê phân bổ (Distribution Stats)
* **Endpoint:** `GET /api/v1/admin/reports/locations`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `from` (string, optional, YYYY-MM-DD): Ngày bắt đầu lọc.
  * `to` (string, optional, YYYY-MM-DD): Ngày kết thúc lọc.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": [
      {
        "category_id": 1,
        "district": "Sơn Trà",
        "count": 12,
        "category": {
          "id": 1,
          "name": "Bãi biển"
        }
      },
      {
        "category_id": 2,
        "district": "Hải Châu",
        "count": 8,
        "category": {
          "id": 2,
          "name": "Bảo tàng"
        }
      }
    ]
  }
  ```

### 1.2. Lấy số liệu KPI thống kê nhanh (Location Stats)
* **Endpoint:** `GET /api/v1/admin/locations/stats`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": {
      "total": 120,
      "active": 105,
      "featured": 15,
      "total_views": 45280
    }
  }
  ```

### 1.3. Lấy danh sách địa điểm phục vụ bảng xếp hạng (Top Lượt xem & Top Đánh giá)
* **Endpoint:** `GET /api/v1/admin/locations`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `category_id` (number/string, optional): Lọc theo ID danh mục.
  * `district` (string, optional): Lọc theo Quận/Huyện.
  * `status` (string, optional): Lọc theo trạng thái (`active` | `inactive`).
  * `sort_by` (string, optional): Trường sắp xếp (`view_count` | `avg_rating` | `created_at`).
  * `sort_order` (string, optional): Thứ tự sắp xếp (`desc` | `asc`). Mặc định: `desc`.
  * `page` (number, optional): Số trang hiện tại.
  * `per_page` (number, optional): Số bản ghi trên trang. Mặc định: `10`.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 12,
          "name": "Cầu Rồng",
          "slug": "cau-rong",
          "district": "Sơn Trà",
          "view_count": 1520,
          "favorite_count": 340,
          "avg_rating": "4.8",
          "review_count": 45,
          "status": "active",
          "created_at": "2026-05-22T09:00:00.000000Z",
          "category": {
            "id": 1,
            "name": "Bãi biển"
          }
        }
      ],
      "last_page": 5,
      "per_page": 10,
      "total": 50
    }
  }
  ```

### 1.4. Lấy danh sách địa điểm yêu thích nhất (Top Yêu thích)
* **Endpoint:** `GET /api/v1/admin/dashboard/top-locations`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `limit` (number, optional): Số lượng địa điểm lấy ra. Mặc định: `10`.
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": [
      {
        "id": 12,
        "name": "Cầu Rồng",
        "slug": "cau-rong",
        "district": "Sơn Trà",
        "view_count": 1520,
        "favorite_count": 340,
        "avg_rating": "4.8",
        "review_count": 45,
        "status": "active",
        "category": {
          "id": 1,
          "name": "Bãi biển"
        }
      }
    ]
  }
  ```

### 1.5. Lấy danh mục địa điểm (Categories)
* **Endpoint:** `GET /api/v1/categories`
* **Quyền hạn:** Không yêu cầu
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": [
      {
        "id": 1,
        "name": "Bãi biển",
        "slug": "bai-bien"
      }
    ]
  }
  ```

### 1.6. Lấy danh sách tên Quận/Huyện (Districts)
* **Endpoint:** `GET /api/v1/admin/locations/districts`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Cơ cấu dữ liệu thô trả về (Raw Response):**
  ```json
  {
    "status": 200,
    "data": [
      "Hải Châu",
      "Sơn Trà",
      "Ngũ Hành Sơn",
      "Liên Chiểu",
      "Thanh Khê",
      "Cẩm Lệ",
      "Hòa Vang"
    ]
  }
  ```

### 1.7. Xuất file báo cáo địa điểm
* **Endpoint:** `GET /api/v1/admin/locations/export`
* **Quyền hạn:** `auth:api` (Admin/Staff)
* **Tham số truy vấn (Query Params):**
  * `category_id`, `district`, `status`
* **Kiểu phản hồi (Response):** File nhị phân `Blob` (`text/csv` hoặc spreadsheet).

---

## 2. Mô hình hóa Kiểu dữ liệu TypeScript & View Model

Đã được định nghĩa/sửa đổi tại `src/dataHelper/report.dataHelper.ts`:

* **LocationReportFilters**: Tham số bộ lọc của trang báo cáo địa điểm.
* **RawLocationReportItem**: Cấu trúc bản ghi thô từ API phân bổ địa điểm.
* **LocationReportViewModel**: Mô hình hoàn chỉnh dùng cho UI components:
  * `stats`: KPIs gồm Tổng, Đang hoạt động, Đã nổi bật, Tổng lượt xem.
  * `charts`:
    * `categories`: Mảng `{ name, value }` phân bổ theo danh mục.
    * `districts`: Mảng `{ name, value }` phân bổ theo quận/huyện.
  * `table`: Chứa danh sách địa điểm đã được chuẩn hóa phục vụ cho 3 tab xếp hạng.

---

## 3. Bản đồ ánh xạ dữ liệu (Data Mapper)

Hàm mapper chính `mapLocationsReport` tại `src/dataHelper/report.mapper.ts` thực hiện các vai trò:

1. **Làm sạch & chuẩn hóa phân bổ Danh mục**: Group và tính tổng số lượng địa điểm, gán nhãn cho các danh mục không tồn tại thành "Không xác định".
2. **Làm sạch & chuẩn hóa phân bổ Quận/Huyện**: Group theo tên quận, loại bỏ khoảng trắng dư thừa, sắp xếp giảm dần theo số lượng.
3. **Chuyển đổi kiểu an toàn (Type Safety)**: Dùng `toNumberSafe` để đảm bảo các con số (lượt xem, lượt thích, đánh giá trung bình) không gây sập ứng dụng nếu API trả về null hoặc chuỗi.
4. **Hỗ trợ Mock Data**: Khi chạy chế độ giả lập (Mock Mode), mapper cũng cung cấp bộ dữ liệu tương thích, sinh động và đầy đủ cấu trúc tương ứng.

---

> [!NOTE]  
> Hợp đồng dữ liệu này tạo ra cấu trúc đồng bộ giúp cho việc tích hợp TanStack Query và UI Components ở các bước tiếp theo diễn ra chuẩn xác, giảm thiểu sai sót. Sẵn sàng tích hợp code và chuyển tiếp sang bước **04-layout-routing**.
