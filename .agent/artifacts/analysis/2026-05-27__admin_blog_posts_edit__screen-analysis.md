# Screen Analysis: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Mockup/SRS: `D:\DATN\DATN_Tài liệu\docs\page\admin_blog_posts_edit.md`

---

## 1) Summary
- Màn hình này phục vụ mục đích chỉnh sửa nội dung bài viết blog đã tồn tại trong hệ thống.
- Người dùng chính là Quản trị viên (Admin) và Nhân viên (Staff) có quyền quản lý nội dung.
- Thuộc module CMS / Quản lý Blog.
- Các tài liệu tham khảo chính:
  - `admin_blog_posts_edit.md` (đặc tả màn hình chỉnh sửa)
  - `admin_blog_posts_create.md` (thiết kế form & layout gốc)
  - `routes/api.php` (danh sách API của backend)

## 2) Component Breakdown
### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| `BlogMarkdownEditor` | `src/pages/Blog/BlogPostCreate/components/BlogMarkdownEditor.tsx` | Không | Import và sử dụng trực tiếp để soạn thảo nội dung (Markdown). |
| `UnsavedChangesGuard` | `src/components/common/UnsavedChangesGuard.tsx` | Không | Sử dụng trực tiếp để chặn chuyển hướng khi form bị dirty. |
| `SectionHeader` | `src/components/common/SectionHeader.tsx` | Không | Dùng hiển thị tiêu đề các section trong form. |
| `Button` | `src/components/ui/Button.tsx` | Không | Nút bấm giao diện. |
| `TextInput` | `src/components/ui/TextInput.tsx` | Không | Ô nhập liệu text. |
| `TextareaField` | `src/components/ui/TextareaField.tsx` | Không | Ô nhập liệu mô tả ngắn (excerpt). |
| `CustomSelect` | `src/components/ui/CustomSelect.tsx` | Không | Select chọn lọc (Pagination). |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| `BlogPostEdit` | Main page container quản lý fetch data, skeleton loading, các thao tác nhanh (Delete, Duplicate) và hiển thị form chỉnh sửa. | Organism (Page) | — |
| `BlogPostForm` | Form chỉnh sửa chứa các fields thông tin bài viết blog, tích hợp logic validate và submit cập nhật. | Organism | `isEdit: boolean; initialData: BlogPostViewModel; onSuccess?: () => void;` |
| `FeaturedImageUploader` | Component upload ảnh đại diện có phần overlay hiển thị "Ảnh hiện tại", nút "Thay đổi" và "Xóa" cố định ở chân ảnh. | Molecule | `value?: string \| null; onChange: (url: string \| null) => void;` |

### [MOD] — Components cần chỉnh sửa
Không có component dùng chung nào cần sửa đổi trực tiếp, đảm bảo tính an toàn cho các chức năng khác.

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | Bố cục 2 cột: Cột trái (65%) chứa Tiêu đề, Slug, Excerpt, Editor. Cột phải (Sidebar 320px) chứa các Cards cấu hình xuất bản, danh mục, ảnh đại diện, hướng dẫn và Thao tác nhanh. | Baseline (admin panel) |
| Tablet (768-1023px) | Chuyển thành bố cục 1 cột dọc xếp chồng. Sidebar chuyển xuống dưới cột nội dung chính. Header thu gọn các nút phụ vào menu hoặc xếp dọc. | Tự động thích ứng |
| Mobile (<768px) | 1 cột dọc. Tiêu đề trang thu nhỏ, ẩn bớt các nút thao tác nhanh ở Header, hiển thị các nút thao tác chính (Cập nhật, Hủy) cố định ở phía dưới cùng màn hình (Mobile Actions) để tăng trải nghiệm. | Tối ưu hóa không gian hiển thị |

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| `BlogPostEdit` Page | Hiển thị Skeleton cho tiêu đề, editor và các card sidebar. | N/A | Hiện trang báo lỗi: "Không tìm thấy bài viết" + Nút quay về danh sách. | Render form và data | N/A | N/A |
| `BlogPostForm` | Submit buttons disabled + hiển thị spinner ở nút đang lưu. | N/A | Show field-level validation errors bên dưới input; show error Toast nếu lưu thất bại. | Show Toast thành công, cập nhật form states | Disable tất cả nút khi đang submit hoặc đang upload ảnh. | Focus border màu xanh `#14B8A6`. |
| Ảnh đại diện | Loading spinner khi đang upload lên Cloudinary. | N/A | Toast báo lỗi tải ảnh lên. | Thay thế preview ảnh mới. | Vô hiệu hóa nút thao tác khi đang upload. | Hover làm mờ nhẹ nút thao tác. |

## 5) Data Fields
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| `title` | `string` | ✓ | Tối đa 255 ký tự, không trống. | "Khám phá Bà Nà Hills trong ngày" | `GET /admin/blog-posts/{id}` |
| `slug` | `string` | ✓ | Tự động tạo hoặc nhập thủ công, cảnh báo nếu sửa đổi. | "kham-pha-ba-na-hills-trong-ngay" | `GET /admin/blog-posts/{id}` |
| `excerpt` | `string` | ✗ | Tối đa 500 ký tự. | "Bài viết chia sẻ kinh nghiệm chi tiết..." | `GET /admin/blog-posts/{id}` |
| `content` | `string` | ✓ | Không trống (định dạng Markdown/HTML). | "# Khám phá..." | `GET /admin/blog-posts/{id}` |
| `featured_image` | `string` | ✗ | Định dạng URL ảnh. | "https://res.cloudinary.com/..." | `GET /admin/blog-posts/{id}` |
| `category_ids` | `number[]` | ✓ | Chọn tối thiểu 1 danh mục. | `[1, 2]` | `GET /admin/blog-posts/{id}` |
| `status` | `string` | ✓ | Phải là `draft`, `published` hoặc `archived`. | "published" | `GET /admin/blog-posts/{id}` |
| `published_at` | `string` | ✗ | Chuỗi datetime dạng `YYYY-MM-DD HH:mm:ss`. | "2026-05-27 10:00:00" | `GET /admin/blog-posts/{id}` |

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| `GET` | `/admin/blog-posts/{id}` | ✓ | — | `RawBlogPost` | ✓ (DETAIL) |
| `PUT` | `/admin/blog-posts/{id}` | ✓ | `UpdateBlogPostPayload` | `RawBlogPost` | ✓ (UPDATE) |
| `PATCH` | `/admin/blog-posts/{id}/status` | ✓ | `{ "status": string }` | `void` | Không (đã có) |
| `DELETE`| `/admin/blog-posts/{id}` | ✓ | — | `null` | Không (đã có) |
| `GET` | `/admin/blog-categories` | ✓ | — | `RawBlogCategory[]` | Không (đã có) |
| `POST` | `/upload/image` | ✓ | `FormData (image)` | `{ url, public_id }` | Không (đã có) |

## 7) Mapper Requirements
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| `published_at` | `string \| null` | `publishedAt` | Chuyển đổi thành đối tượng `Date \| null`. |
| `created_at` | `string` | `createdAt` | Chuyển đổi thành đối tượng `Date`. |
| `featured_image` | `string \| null` | `featuredImage` | Map sang camelCase hoặc giữ nguyên nếu khớp. |
| `categories` | `RawBlogCategory[]` | `categories` | Map mảng danh mục qua `mapBlogCategory`. |
| `author` | `RawBlogPostAuthor` | `author` | Map thông tin tác giả qua `mapBlogPostAuthor`. |

## 8) Business Rules
- **BR-01 (Slug modification alert)**: Khi người dùng chỉnh sửa trường tiêu đề (làm thay đổi slug tự động) hoặc thay đổi slug thủ công trên bài viết đã tồn tại, ứng dụng phải hiển thị một hộp cảnh báo (warning box) màu vàng cam lưu ý rằng việc thay đổi slug sẽ làm hỏng các liên kết (URL) cũ dẫn tới bài viết.
- **BR-02 (Publishing scheduling status)**: Trạng thái của bài viết phụ thuộc vào tuỳ chọn xuất bản:
  - Chọn "Bản nháp" -> `status = 'draft'`, `published_at = null`
  - Chọn "Xuất bản ngay" -> `status = 'published'`, `published_at = null` (hoặc thời gian hiện tại từ server)
  - Chọn "Lên lịch" -> `status = 'published'`, `published_at = YYYY-MM-DD HH:mm:00` (ở tương lai).
- **BR-03 (Unsaved changes protection)**: Nếu form bị thay đổi (dirty) và người dùng bấm các nút điều hướng hoặc chuyển trang, ứng dụng phải chặn hành động này và hiển thị hộp thoại xác nhận rời trang ("Unsaved Changes Dialog").

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| `admin` | Xem, Chỉnh sửa, Thay đổi trạng thái, Nhân bản, Xóa bài viết. | — | Toàn quyền quản trị. |
| `staff` | Xem, Chỉnh sửa, Thay đổi trạng thái, Nhân bản bài viết. | Xóa bài viết. | Nút Xóa bài viết ở Card Thao tác nhanh bị vô hiệu hóa hoặc ẩn đối với nhân viên (Staff). |

## 10) Edge Cases
- **EC-01 (Cloudinary Upload Timeout/Fail)**: Khi đang upload ảnh đại diện mới nhưng gặp lỗi mạng. Giải pháp: Không cập nhật URL ảnh trong form, hiển thị Toast báo lỗi chi tiết, giữ nguyên ảnh cũ để người dùng thử lại.
- **EC-02 (Duplicate Slug conflict)**: Khi lưu thay đổi nhưng slug mới trùng lặp với một bài viết khác trong cơ sở dữ liệu. Giải pháp: Backend trả về lỗi validation `422`, hiển thị lỗi này ngay cạnh ô nhập tiêu đề/slug.
- **EC-03 (Concurrent updates)**: Hai quản trị viên cùng chỉnh sửa một bài viết cùng thời điểm. Người lưu sau sẽ ghi đè nội dung. Nhắc nhở người dùng về rủi ro này.

## 11) Assumptions & Open Questions
### Assumptions
- [ASSUMPTION] A-01: Đường dẫn frontend cho việc xem bài viết ngoài trang khách hàng (Client Web) là `/blog/{slug}`. Nút "Xem bài viết" sẽ mở đường dẫn này trong một tab mới.
- [ASSUMPTION] A-02: Quyền hạn của Staff chỉ giới hạn không được xóa bài viết, còn việc sửa đổi nội dung và danh mục vẫn được phép hoàn toàn.

### Open Questions
- Q-01: Backend có trả về trường thống kê lượt xem (`view_count`) trong API chi tiết bài viết `/admin/blog-posts/{id}` không?
  - *Trả lời dựa trên database schema*: Trường `view_count` tồn tại trong bảng `blog_posts` và model `BlogPost`, do đó API chi tiết chắc chắn trả về trường này để hiển thị thông tin thống kê.

## 12) Implementation Checklist
- [x] Types & API contract (03-types-api-contract)
- [x] Route & layout (04-layout-routing)
- [x] UI components — list: `BlogPostEdit`, `BlogPostForm`, `FeaturedImageUploader`
- [x] Data integration — list hooks: `useAdminBlogPostQuery`, `useUpdateBlogPostMutation`, `useBlogCategoriesQuery`, `useBlogUploadMutations`
- [x] Interactions — list actions: Cập nhật bài viết, Nhân bản bài viết, Xóa bài viết, Cảnh báo đổi slug, Guard chặn rời trang
- [x] Auth/permissions (phân quyền nút Xóa cho Staff)
- [x] Testing (lint + typecheck + build)
- [x] Deploy

## 13) Files / Areas Likely To Change
- `src/constants/endpoints.ts` (Thêm endpoint detail/update)
- `src/types/blog.ts` (Thêm UpdateBlogPostPayload)
- `src/api/blogApi.ts` (Thêm API methods)
- `src/hooks/useBlogQueries.ts` (Thêm hooks query/mutation)
- `src/routes/index.tsx` (Khai báo route lazy)
- `public/lang/vi/blog.json` và `public/lang/en/blog.json` (Thêm các khoá ngôn ngữ mới)
- `src/pages/Blog/BlogPostEdit/index.tsx` (Tạo mới màn hình edit)
- `src/pages/Blog/BlogPostEdit/components/BlogPostForm.tsx` (Tạo mới form edit)
- `src/pages/Blog/BlogPostEdit/components/FeaturedImageUploader.tsx` (Tạo mới uploader edit)
