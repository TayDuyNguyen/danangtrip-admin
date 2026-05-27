# Data Integration Plan: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> API module: `src/api/blogApi.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| Lấy chi tiết bài viết | `GET /admin/blog-posts/{id}` | `useAdminBlogPostQuery` | Dữ liệu chính để đổ vào form. |
| Cập nhật bài viết | `PUT /admin/blog-posts/{id}` | `useUpdateBlogPostMutation` | Thay đổi dữ liệu chính trên server. |
| Lấy danh mục | `GET /admin/blog-categories` | `useBlogCategoriesQuery` | Dữ liệu lookup cho danh mục sidebar. |
| Thêm danh mục nhanh | `POST /admin/blog-categories` | `useCreateBlogCategoryMutation` | Thêm nhanh danh mục từ sidebar. |
| Tải ảnh đại diện | `POST /upload/image` | `useBlogUploadMutations` | Upload ảnh lên Cloudinary. |
| Xóa bài viết | `DELETE /admin/blog-posts/{id}` | `useBlogMutations().deleteMutation` | Xóa bài viết vĩnh viễn. |

## 1.1) Data Ownership Notes
- Query `useAdminBlogPostQuery(id)` là source of truth duy nhất cho dữ liệu chi tiết của bài viết được hiển thị trên trang.
- Query `useBlogCategoriesQuery` cung cấp dữ liệu hỗ trợ lựa chọn danh mục.

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| `['blogs', 'detail', id]` | Detail | Mount component (khi `id` tồn tại) | 30 giây | `mapBlogPost` |
| `['blogs', 'categories']` | Lookup | Mount component | 5 phút | `mapBlogCategory` |

## 2.1) Parallel / Dependent Query Notes
- `useAdminBlogPostQuery` và `useBlogCategoriesQuery` chạy **song song** (Parallel) khi mở trang, vì chúng hoàn toàn độc lập và không phụ thuộc kết quả của nhau.

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| Cập nhật bài viết | `PUT /admin/blog-posts/{id}` | Invalidate query `['blogs']`, `['dashboard']`, hiển thị Toast thành công và reset form dirty state. | Hiển thị Toast thất bại. |
| Xóa bài viết | `DELETE /admin/blog-posts/{id}` | Invalidate query `['blogs']`, hiển thị Toast xóa thành công và chuyển hướng về danh sách bài viết. | Hiển thị Toast lỗi mạng. |
| Thêm danh mục | `POST /admin/blog-categories` | Invalidate query `['blogs', 'categories']`, tự động tích chọn danh mục mới. | Hiển thị Toast lỗi backend. |
| Tải ảnh | `POST /upload/image` | Cập nhật URL ảnh mới vào form state. | Hiển thị Toast lỗi upload. |

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Toàn bộ trang chỉnh sửa | `BlogPostFormSkeleton` | N/A | Báo lỗi không tìm thấy bài viết, kèm nút Cancel | Hiển thị `BlogPostForm` đầy đủ dữ liệu |
| Danh sách Categories | Hiển thị spinner nhỏ cạnh tiêu đề | N/A | Ẩn danh sách | Render danh sách các checkbox |

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|---|---|---|---|
| API 404 | Chuyển sang giao diện lỗi đặc biệt "Post Not Found" | Không | Nhấn nút quay lại để retry |
| Lỗi Submit | Giữ nguyên form, hiển thị lỗi dưới input (nếu có) | Toast: "Cập nhật bài viết thất bại!" | Bấm Cập nhật lại |
| Lỗi Upload | Giữ nguyên ảnh cũ | Toast: "Lỗi tải ảnh lên!" | Chọn và upload lại |

## 5) Files Expected To Change
- `src/hooks/useBlogQueries.ts` (Đã bổ sung trong Step 03)
- `src/pages/Blog/BlogPostEdit/index.tsx` (Đã tạo trong Step 05)
- `src/pages/Blog/BlogPostEdit/components/BlogPostForm.tsx` (Đã tạo trong Step 05)

## 6) Risks / Open Questions
- R-01: Upload ảnh đại diện bị timeout. Giải pháp: uploader component kiểm soát lỗi và giữ nguyên ảnh cũ để tránh mất mát.
