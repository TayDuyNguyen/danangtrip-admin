# Screen Analysis: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Main Route:** `/admin/blog-categories`
- **Role/Permissions:** Admin, Staff (Authenticated)
- **Status:** Approved for Execution

## 1. Summary & Scope

Màn hình Danh mục Blog cho phép quản trị viên và nhân viên quản lý cách phân loại bài viết trên hệ thống. 
Mục tiêu là hiển thị danh sách các danh mục blog hiện tại cùng số lượng bài viết tương ứng, đồng thời cung cấp form tạo mới và chỉnh sửa trực tiếp (inline) ở cột bên phải.

## 2. Design & Token Audit

- **Layout:** Thiết kế chia 2 cột trên màn hình Desktop:
  - Cột trái: Chiếm toàn bộ chiều rộng còn lại (`flex-1`), hiển thị bảng danh sách danh mục blog và thanh tìm kiếm.
  - Cột phải: Rộng `380px`, sticky tại vị trí `top-24`, hiển thị form thêm mới / chỉnh sửa danh mục.
- **Colors:**
  - Nút chính (Thêm danh mục, Lưu): Màu xanh dương `#0066CC` (`hover:bg-[#004999]`), chữ trắng.
  - Màu nền: Trắng (`bg-white`) cho các card, nền trang xám nhẹ (`bg-slate-50`).
  - Đường viền: `#E2E8F0` và `#F1F5F9`.
  - Icon folder trong bảng: Background màu xanh `#EFF6FF` với màu icon `#0066CC`.
  - Badge trạng thái Form: "MỚI" (`bg-[#D1FAE5] text-[#10B981]`), "ĐANG SỬA" (`bg-[#EFF6FF] text-[#0066CC]`).
- **Typography:**
  - Tiêu đề chính: `24px Inter 700 #1E293B`.
  - Tiêu đề card/cột phải: `15px Inter 600 #1E293B`.
  - Chữ trong bảng: `14px Inter 600` cho tên danh mục, `11px Inter 500` cho slug, `12px` cho mô tả.

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `StatCard` | [REUSE] | Molecule | `src/components/common/StatCard.tsx` | Sử dụng lại để hiển thị số lượng "Tổng danh mục" và "Tổng bài viết". |
| `Breadcrumbs` | [REUSE] | Molecule | `src/components/common/Breadcrumbs.tsx` | Hiển thị điều hướng: Blog / Danh mục Blog. |
| `EmptyState` | [REUSE] | Molecule | `src/components/common/EmptyState.tsx` | Hiển thị khi danh sách danh mục rỗng (kết hợp với icon `FolderOff`). |
| `BlogCategoryTable` | [NEW] | Organism | `src/pages/Blog/BlogCategories/components/BlogCategoryTable.tsx` | Bảng hiển thị danh mục blog với các cột kéo handle, tên, số lượng bài viết, hành động. |
| `BlogCategoryForm` | [NEW] | Organism | `src/pages/Blog/BlogCategories/components/BlogCategoryForm.tsx` | Form nhập dữ liệu inline bên phải: tên, slug, mô tả, kèm khung Preview. |

## 4. Responsive & UI States

- **Desktop (>= 1024px):** Layout 2 cột (Trái: Danh sách & Stats, Phải: Form inline rộng 380px).
- **Tablet (< 1024px) & Mobile (< 768px):** Cột phải chuyển xuống phía dưới bảng danh sách thành bố cục 1 cột dọc chồng lên nhau (`flex-col`). Form không còn sticky.
- **UI States Table:**
  - **Loading:** Render 5 dòng skeleton.
  - **Empty:** Hiển thị `EmptyState` với icon FolderOff và nút "Thêm danh mục" để reset form về trạng thái tạo mới.
  - **Error:** Hiển thị thông báo lỗi kèm nút "Thử lại".
  - **Row đang sửa:** Dòng danh mục đang được chỉnh sửa sẽ có nền màu xanh nhẹ `bg-[#EFF6FF]` và viền trái màu xanh đậm `border-l-3 border-[#0066CC]`.

## 5. Data & API Mapping

| Field | Type | Required | Validation | Source Endpoint |
|---|---|---|---|---|
| `id` | `number` | ✓ | — | `GET /admin/blog-categories` |
| `name` | `string` | ✓ | Tối đa 50 ký tự, unique | `GET /admin/blog-categories` |
| `slug` | `string` | ✓ | Tối đa 60 ký tự, unique | `GET /admin/blog-categories` |
| `description` | `string \| null` | ✗ | — | `GET /admin/blog-categories` |
| `posts_count` | `number` | ✓ | — | `GET /admin/blog-categories` |

- **Endpoints:**
  - Danh sách: `GET /admin/blog-categories`
  - Tạo mới: `POST /admin/blog-categories` (payload: `{ name, slug?, description? }`)
  - Chỉnh sửa: `PUT /admin/blog-categories/{id}` (payload: `{ name, slug?, description? }`)
  - Xóa: `DELETE /admin/blog-categories/{id}`

## 6. Business Rules & Edge Cases

- **BR-01 (Slug tự động):** Slug sẽ được tự động tạo từ Tên danh mục (ví dụ nhập "Văn hóa & Lịch sử" -> tạo slug "van-hoa-lich-su") khi ở chế độ tạo mới và trường Slug chưa được sửa đổi thủ công. Khi chỉnh sửa, slug sẽ không tự động thay đổi theo tên để bảo toàn SEO.
- **BR-02 (Không có trạng thái):** Danh mục Blog luôn có trạng thái hoạt động (không có nút toggle status).
- **EC-01 (Xóa danh mục có bài viết):** Khi xóa danh mục có chứa bài viết, hệ thống hiển thị cảnh báo: "Các bài viết thuộc danh mục này sẽ mất liên kết danh mục". Hành động xóa sẽ gỡ bỏ mối quan hệ trong bảng `blog_post_categories`.

## 7. Handoff To Next Steps

- Các file sẽ bị chỉnh sửa: `src/constants/endpoints.ts`, `src/types/blog.ts`, `src/dataHelper/blog.mapper.ts`, `src/api/blogApi.ts`, `src/hooks/useBlogQueries.ts`, `src/routes/routes.ts`, `src/routes/index.tsx`, `src/components/common/Sidebar.tsx`.
- Các file tạo mới: `src/pages/Blog/BlogCategories/index.tsx`, `src/pages/Blog/BlogCategories/components/BlogCategoryTable.tsx`, `src/pages/Blog/BlogCategories/components/BlogCategoryForm.tsx`.
- Dịch đa ngôn ngữ cần bổ sung vào: `public/lang/vi/blog.json`, `public/lang/en/blog.json`.
