# API Contract: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02
- **Related Routes**: `D:/DATN/danangtrip-api/routes/api.php`
- **Related Types**: `D:/DATN/danangtrip-admin/src/types/landingPage.types.ts`

---

## 1. Database Schema & Migration

Bảng `landing_pages` được khởi tạo thành công với cấu trúc:
- Cột `slug` có thuộc tính `unique` và được đánh index để tối ưu hóa tìm kiếm.
- Cột `filters` và `content_blocks` lưu trữ định dạng `json`.
- Cột `status` dùng enum `['draft', 'published']` với giá trị mặc định là `draft`.

---

## 2. API Endpoints Contract

Tất cả các route đều nằm dưới tiền tố `/admin` và được bảo vệ bởi middleware xác thực `jwt.auth` và middleware phân quyền `role:admin`.

### 2.1. Lấy danh sách (GET `/v1/admin/landing-pages`)
- **Query Params**:
  - `search` (string, optional) - Tìm kiếm theo `slug` hoặc `title`.
  - `page_type` (string, optional) - `destination`, `tour_line`, `promotion`.
  - `status` (string, optional) - `draft`, `published`.
  - `per_page` (integer, optional) - Số dòng trên mỗi trang (mặc định: 15).
  - `sort_by` (string, optional) - Sắp xếp theo cột (mặc định: `created_at`).
  - `sort_dir` (string, optional) - Hướng sắp xếp: `asc` hoặc `desc` (mặc định: `desc`).
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": 200,
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "slug": "du-lich-da-nang",
          "title": "Tour du lịch Đà Nẵng giá rẻ",
          "page_type": "destination",
          "intro": "Tổng hợp tour Đà Nẵng...",
          "hero_image": "/uploads/hero.jpg",
          "seo_title": "Du lịch Đà Nẵng",
          "seo_description": "Mô tả SEO",
          "og_image": null,
          "filters": {"district": "Son Tra"},
          "content_blocks": [],
          "status": "published",
          "created_at": "2026-06-02T10:00:00.000000Z",
          "updated_at": "2026-06-02T10:00:00.000000Z"
        }
      ],
      "first_page_url": "...",
      "from": 1,
      "last_page": 1,
      "last_page_url": "...",
      "per_page": 15,
      "to": 1,
      "total": 1
    }
  }
  ```

### 2.2. Tạo mới (POST `/v1/admin/landing-pages`)
- **Payload**:
  - `slug` (string, required) - regex `/^[a-z0-9\-]+$/`, unique
  - `title` (string, required)
  - `page_type` (string, required) - `destination`, `tour_line`, `promotion`
  - `intro` (string, optional)
  - `hero_image` (string, optional)
  - `seo_title` (string, optional)
  - `seo_description` (string, optional)
  - `og_image` (string, optional)
  - `filters` (array/object, optional) - cast JSON
  - `content_blocks` (array, optional) - cast JSON
  - `status` (string, required) - `draft`, `published`
- **Phản hồi thành công (201 Created)**:
  ```json
  {
    "status": 201,
    "message": "Landing page created successfully.",
    "data": { "id": 2, "slug": "tour-ba-na-hills", ... }
  }
  ```

### 2.3. Chi tiết (GET `/v1/admin/landing-pages/{id}`)
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": 200,
    "data": { "id": 1, "slug": "du-lich-da-nang", ... }
  }
  ```

### 2.4. Cập nhật (PUT `/v1/admin/landing-pages/{id}`)
- **Payload**: Giống như khi tạo mới, nhưng bỏ qua kiểm tra unique slug cho ID hiện tại.
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Landing page updated successfully.",
    "data": { "id": 1, "slug": "du-lich-da-nang-2026", ... }
  }
  ```

### 2.5. Cập nhật Trạng thái (PATCH `/v1/admin/landing-pages/{id}/status`)
- **Payload**:
  - `status` (string, required) - `draft`, `published`
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Landing page status updated successfully."
  }
  ```

### 2.6. Xóa (DELETE `/v1/admin/landing-pages/{id}`)
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Landing page deleted successfully."
  }
  ```

---

## 3. Frontend Types Mapping

Tệp tin types [landingPage.types.ts](file:///d:/DATN/danangtrip-admin/src/types/landingPage.types.ts) khai báo các kiểu dữ liệu tương thích hoàn toàn với backend, hỗ trợ kiểm tra kiểu tĩnh (typecheck) trong quá trình build dự án.
- Các trường `filters` và `content_blocks` được định kiểu rõ ràng, hỗ trợ cast tự động khi parse dữ liệu từ API client.
- Schema yup validation trên frontend sẽ đồng bộ các điều kiện bắt buộc của API validation.
