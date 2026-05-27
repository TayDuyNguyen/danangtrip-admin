# Route Plan: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Layout target: `MainLayout` (bọc trong PrivateRoute)

---

## 1) Summary
- Feature này triển khai màn hình chỉnh sửa bài viết Blog.
- Thay thế các redirect cũ trên đường dẫn `/admin/blog-posts/:id/edit` và `/admin/blog-posts/edit/:id` bằng việc hiển thị trực tiếp trang `BlogPostEdit`.

## 1.1) Route Decision
- Route type: `extend` (thay thế redirect bằng page component thực tế)
- Guard needed: `yes`
- Why: Đây là màn hình quản lý nghiệp vụ CMS dành cho Quản trị viên/Nhân viên, cần xác thực token JWT và kiểm tra quyền admin/staff.

## 2) Target Routes
| Route Path | Page Component | Guard | Layout | Notes |
|---|---|---|---|---|
| `/admin/blog-posts/:id/edit` | `BlogPostEdit` | `PrivateRoute` (jwt.auth + role:admin) | `MainLayout` | Hỗ trợ truy cập theo ID |
| `/admin/blog-posts/edit/:id` | `BlogPostEdit` | `PrivateRoute` (jwt.auth + role:admin) | `MainLayout` | Dự phòng cấu hình cũ |

## 3) Page Structure
| File | Purpose | Status |
|---|---|---|
| `src/pages/Blog/BlogPostEdit/index.tsx` | Main page skeleton & data container | [NEW] |
| `src/pages/Blog/BlogPostEdit/components/BlogPostForm.tsx` | Form editing logic | [NEW] |
| `src/pages/Blog/BlogPostEdit/components/FeaturedImageUploader.tsx` | Featured image specialized uploader | [NEW] |

## 3.1) Layout / Guard Notes
| Concern | Decision | Notes |
|---|---|---|
| Layout | Sử dụng `MainLayout` | Kế thừa sidebar navigation và topbar header chung của dashboard admin. |
| PrivateRoute | Gắn bọc ngoài cụm route | Tự động kiểm tra JWT và vai trò người dùng (redirect về `/login` nếu không thoả mãn). |
| Breadcrumb | Blog / Danh sách Bài viết / Sửa | Breadcrumb được định vị động dựa trên ngôn ngữ chọn. |
| Menu item | Không đổi | Vẫn là menu "Blog" hiện tại đang trỏ tới `/admin/blog-posts`. |

## 4) Navigation / Breadcrumb
| Item | Locale Key | Path | Icon | Notes |
|---|---|---|---|---|
| Breadcrumb | `blog:breadcrumb_edit` | `/admin/blog-posts/:id/edit` | `BookOpen` | "Blog / Chỉnh sửa Bài viết" |

## 5) Locale Updates
Chúng ta sẽ đồng bộ các khoá ngôn ngữ mới tại:
- `public/lang/vi/blog.json`
- `public/lang/en/blog.json`

| File | Keys to add |
|---|---|
| `blog.json (vi)` | `edit_title`, `edit_subtitle`, `slug_warning`, `featured_image_current`, `quick_actions`, `view_post`, `duplicate_post`, `delete_post`, `info_section`, `info_created`, `info_updated`, `info_author`, `info_views`, `info_views_val`, `duplicate_confirm_title`, `duplicate_confirm_body`, `actions.save_changes`, `actions.discard_changes`, `actions.continue_editing`, `toast.update_success`, `toast.update_error`, `toast.duplicate_success`. |
| `blog.json (en)` | Các khoá tương ứng dịch sang tiếng Anh. |

## 6) Risks / Notes
- R-01: Nhầm lẫn giữa 2 route `/admin/blog-posts/:id/edit` và `/admin/blog-posts/edit/:id`. Việc trỏ cả hai về cùng một trang `BlogPostEdit` sẽ triệt tiêu hoàn toàn rủi ro này.

## 6.1) Open Questions
Không có.

## 7) Files Expected To Change
- `src/routes/index.tsx` (Xoá redirect, đăng ký route lazy)
- `public/lang/vi/blog.json`
- `public/lang/en/blog.json`
