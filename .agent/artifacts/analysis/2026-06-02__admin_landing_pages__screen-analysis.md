# Screen Analysis: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Screen Name**: `Quản lý Landing Pages` (Landing Pages Management)
- **Main Route**: `/admin/landing-pages`
- **Target Page Path**: `src/pages/LandingPages/index.tsx`
- **Primary Document**: `D:/DATN/DATN_Tài liệu/docs/page/admin_landing_pages.md`
- **Primary APIs**:
  - `GET /v1/admin/landing-pages` (Danh sách landing pages)
  - `POST /v1/admin/landing-pages` (Tạo mới landing page)
  - `GET /v1/admin/landing-pages/{id}` (Chi tiết landing page)
  - `PUT /v1/admin/landing-pages/{id}` (Cập nhật landing page)
  - `PATCH /v1/admin/landing-pages/{id}/status` (Thay đổi trạng thái hiển thị)
  - `DELETE /v1/admin/landing-pages/{id}` (Xóa landing page)

---

## 1. Objectives & Business Context

Triển khai giao diện quản trị Landing Pages giúp admin có khả năng xây dựng các trang đích phục vụ chiến dịch SEO, dòng sản phẩm tour chuyên biệt hoặc khuyến mãi của DaNangTrip. Các trang này sẽ ánh xạ từ một slug (đường dẫn URL) cụ thể như `/du-lich-da-nang`, tự động kết nối và hiển thị danh sách các tour phù hợp dựa trên cấu hình bộ lọc mặc định (`filters`) lưu trữ dạng JSON, kèm theo các phần nội dung giới thiệu mở rộng (`content_blocks`).

---

## 2. Component Breakdown

### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `UnsavedChangesGuard` | `src/components/common/UnsavedChangesGuard.tsx` | Không | Sử dụng cho Drawer soạn thảo để cảnh báo khi đóng có dữ liệu chưa lưu |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Không | Hiển thị khi danh sách trống |
| `ErrorWidget` | `src/components/common/ErrorWidget.tsx` | Không | Hiển thị khi có lỗi tải dữ liệu |
| `Pagination` | `src/components/common/Pagination.tsx` | Không | Phân trang bảng danh sách |
| `SectionHeader` | `src/components/common/SectionHeader.tsx` | Không | Tiêu đề trang |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `LandingPageTable` | Bảng hiển thị thông tin landing pages (slug, title, page_type, status, updated_at, inline actions) | Organism | `LandingPageTableProps` |
| `LandingPageFilter` | Tìm kiếm theo tiêu đề/slug, lọc theo loại trang và trạng thái hiển thị | Molecule | `LandingPageFilterProps` |
| `LandingPageFormDrawer` | Form thêm mới và cập nhật landing page (dạng Drawer kéo từ bên phải, chứa 3 tab nhập liệu) | Organism | `LandingPageFormDrawerProps` |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | Thêm mục menu "Quản lý Landing Pages" | Thay đổi cấu trúc menu hiển thị bên trái |

---

## 3. Responsive Behavior

| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | Bảng đầy đủ các cột thông tin, bộ lọc dàn hàng ngang, Form Drawer chiếm 40% chiều rộng màn hình. | Trải nghiệm chuẩn trên PC/Laptop |
| Tablet (768-1023px) | Ẩn bớt các cột phụ (updated_at, seo_title). Bộ lọc chuyển sang 2 hàng. Form Drawer chiếm 60% chiều rộng. | Đảm bảo tính cân đối trên máy tính bảng |
| Mobile (<768px) | Chuyển bảng thành dạng danh sách thẻ (card-list), ẩn hầu hết cột phụ, chỉ giữ title, slug, status và nút sửa nhanh. Form Drawer mở rộng 100% màn hình. | Tối ưu hóa không gian hẹp trên điện thoại |

---

## 4. UI States

| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| **LandingPageTable** | Hiển thị Skeleton rows (10 hàng) | Render `EmptyState` kèm mô tả "Chưa có trang landing nào" | Hiển thị `ErrorWidget` kèm nút bấm tải lại | N/A | Vô hiệu hóa toggle status khi đang gọi API | Highlight hàng khi di chuột qua |
| **LandingPageFilter** | N/A | Ẩn các dropdown lọc | N/A | N/A | Vô hiệu hóa input khi đang tải dữ liệu | Thay đổi border khi focus |
| **LandingPageFormDrawer** | Spinner trên nút Lưu dữ liệu | N/A | Hiển thị lỗi nhập liệu ở từng trường (dưới input) | Hiển thị toast thông báo thành công và đóng drawer | Khóa các nút khi đang gửi yêu cầu | Viền input chuyển sang màu primary |

---

## 5. Data Fields

| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `id` | `number` | ✓ | — | `1` | `GET /admin/landing-pages` |
| `slug` | `string` | ✓ | Chữ thường không dấu, gạch ngang, unique | `du-lich-da-nang` | `GET /admin/landing-pages` |
| `title` | `string` | ✓ | Max 150 ký tự | `Tour du lịch Đà Nẵng giá rẻ` | `GET /admin/landing-pages` |
| `page_type` | `string` | ✓ | Phải là: `destination`, `tour_line`, `promotion` | `destination` | `GET /admin/landing-pages` |
| `intro` | `string` | ✗ | Max 500 ký tự | `Tổng hợp các tour du lịch Đà Nẵng...` | `GET /admin/landing-pages` |
| `hero_image` | `string` | ✗ | Định dạng URL | `/uploads/hero.jpg` | `GET /admin/landing-pages` |
| `seo_title` | `string` | ✗ | Max 70 ký tự | `Tour du lịch Đà Nẵng giá rẻ 2026` | `GET /admin/landing-pages` |
| `seo_description`| `string`| ✗ | Max 160 ký tự | `Đặt tour du lịch Đà Nẵng giá cực tốt...` | `GET /admin/landing-pages` |
| `og_image` | `string` | ✗ | Định dạng URL | `/uploads/og_image.jpg` | `GET /admin/landing-pages` |
| `filters` | `object` | ✗ | Định dạng JSON | `{"district": "Son Tra", "price_max": 2000000}`| `GET /admin/landing-pages` |
| `content_blocks` | `array` | ✗ | Mảng các object block nội dung | `[{"type": "faq", "question": "...", "answer": "..."}]`| `GET /admin/landing-pages` |
| `status` | `string` | ✓ | Phải là: `draft`, `published` | `published` | `GET /admin/landing-pages` |

---

## 6. API Endpoints

| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/landing-pages` | ✓ (Admin) | Query: pagination & filters | `{data: LandingPage[], meta: {...}}` | Có |
| `POST` | `/admin/landing-pages` | ✓ (Admin) | JSON body (Create Input) | `{data: LandingPage, message: "..."}`| Có |
| `GET` | `/admin/landing-pages/{id}`| ✓ (Admin)| URL Param: `id` | `{data: LandingPage}` | Có |
| `PUT` | `/admin/landing-pages/{id}`| ✓ (Admin)| URL Param: `id`, JSON body | `{data: LandingPage, message: "..."}`| Có |
| `PATCH`| `/admin/landing-pages/{id}/status`| ✓ (Admin)| URL Param: `id`, status | `{message: "..."}` | Có |
| `DELETE`| `/admin/landing-pages/{id}`| ✓ (Admin)| URL Param: `id` | `{message: "..."}` | Có |

---

## 7. Mapper Requirements

Các dữ liệu JSON như `filters` và `content_blocks` có thể trả về dưới dạng chuỗi string hoặc object tùy thuộc vào parser của driver MySQL/PostgreSQL trong Laravel.
- **Transform logic**: Khi ánh xạ sang ViewModel trên frontend:
  - Nếu `filters` là chuỗi JSON string, thực hiện `JSON.parse(filters)` hoặc trả về `{}` nếu null/lỗi.
  - Nếu `content_blocks` là chuỗi JSON string, thực hiện `JSON.parse(content_blocks)` hoặc trả về `[]` nếu null/lỗi.

---

## 8. Business Rules

- **BR-01 (Slug unique)**: Đường dẫn `slug` của landing page phải là duy nhất trên toàn hệ thống và không được trùng với các route mặc định của hệ thống admin/web.
- **BR-02 (Phân loại trang)**: Phải thuộc 1 trong 3 nhóm: `destination`, `tour_line`, `promotion` nhằm phục vụ việc gom nhóm hiển thị trên web.
- **BR-03 (Bộ lọc Tour)**: Dữ liệu bộ lọc lưu trong `filters` phải chứa các trường hợp lệ tương thích với API tìm kiếm tour (`/tours`).

---

## 9. Actors & Permissions

| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| `admin` | Đọc, Thêm mới, Cập nhật, Thay đổi Trạng thái, Xóa Landing Page | — | Toàn quyền quản trị |
| `user` / `guest` | Chỉ xem được các trang có trạng thái `published` trên giao diện web | Không thể truy cập route admin hay gọi API `/admin/*` | Bị chặn bởi middleware JWT và phân quyền ở server |

---

## 10. Edge Cases

- **EC-01 (Concurrent updates)**: Hai admin cùng cập nhật một trang landing tại một thời điểm. Xử lý: React Query invalidation sẽ làm mới lại dữ liệu ngay sau khi cập nhật thành công.
- **EC-02 (Invalid JSON filters)**: Dữ liệu `filters` bị định dạng lỗi. Xử lý: Thực hiện validate định dạng JSON trên cả Client (thông qua schema Yup) và Server trước khi ghi nhận vào DB.

---

## 11. Assumptions & Open Questions

### Assumptions
- [ASSUMPTION] A-01: Admin Landing Pages có hỗ trợ tải ảnh banner lên thông qua API `/upload/image` giống như các chức năng upload ảnh khác.

---

## 12. Implementation Checklist

- [x] Triển khai Task list (`task.md`) và kế hoạch thực hiện (`implementation_plan.md`)
- [ ] Step 01: Tài liệu Phân tích Màn hình (`screen-analysis.md`) (Hoàn thành)
- [ ] Step 02: Audit cấu trúc cài đặt hệ thống (`project-audit.md`)
- [ ] Step 03: Thiết kế API và Types (`api-contract.md` + Laravel files + TS interfaces)
- [ ] Step 04: Cấu hình Routing, Sidebar & i18n (`route-plan.md` + routes & JSON files)
- [ ] Step 05: Xây dựng UI Components (`ui-spec.md` + Tables, Filters, Form Drawer)
- [ ] Step 06: Data Integration (`data-integration.md` + queries & mutations wiring)
- [ ] Step 07: Thao tác & Kiểm tra tương tác người dùng (`interaction-spec.md`)
- [ ] Step 08: Phân quyền & Bảo mật (`auth-permissions-review.md`)
- [ ] Step 09: Viết và chạy Tests (`test-report.md`)
- [ ] Step 10: Optimize và hoàn thành triển khai (`deploy-report.md` + `review.md`)

---

## 13. Files / Areas Likely To Change

### Frontend (`danangtrip-admin`)
- `src/constants/endpoints.ts`
- `src/routes/routes.ts`
- `src/routes/index.tsx`
- `src/components/common/Sidebar.tsx`
- `src/i18n/index.ts`
- `public/lang/vi/common.json`
- `public/lang/en/common.json`

### Backend (`danangtrip-api`)
- `routes/api.php`
- `app/Providers/RepositoryServiceProvider.php`
