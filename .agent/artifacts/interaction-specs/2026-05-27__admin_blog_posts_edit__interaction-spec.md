# Interaction Spec: Chỉnh sửa Bài viết Blog (BlogPostEdit)

> Feature slug: `admin_blog_posts_edit`
> Date: 2026-05-27
> Source hooks: `src/hooks/useBlogQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| Cập nhật bài viết | Nhấn nút "Lưu thay đổi" ở Header hoặc Mobile Bar | `useUpdateBlogPostMutation` | Toast: "Cập nhật bài viết thành công!", tắt dirty state | Toast: "Cập nhật bài viết thất bại!" |
| Thêm nhanh danh mục | Submit mini form thêm danh mục | `useCreateBlogCategoryMutation` | Toast: "Tạo danh mục thành công!", tự động chọn danh mục đó | Toast: Lỗi backend hoặc "Lỗi mạng" |
| Upload ảnh đại diện | Chọn ảnh qua file picker ở Card Ảnh đại diện | `useBlogUploadMutations().uploadImageMutation` | Cập nhật URL ảnh và hiển thị preview | Toast: "Lỗi tải ảnh lên!" |
| Gỡ ảnh đại diện | Click nút "Xóa" (icon X) ở chân ảnh đại diện | `useBlogUploadMutations().deleteImageMutation` | Gỡ ảnh khỏi form | Không |
| Nhân bản bài viết | Click nút "Nhân bản bài viết" ở Card Thao tác nhanh | Chuyển hướng với Location state | Toast: "Đã nhân bản bài viết thành công!", chuyển tới màn Tạo mới | Không |
| Xóa bài viết | Click nút "Xóa bài viết" ở Card Thao tác nhanh | `useBlogMutations().deleteMutation` | Toast: "Đã xóa bài viết.", chuyển hướng về danh sách bài viết | Toast: "Lỗi mạng hoặc máy chủ không phản hồi" |

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| Cập nhật bài viết | High | Nghiệp vụ cốt lõi của màn hình. |
| Chặn rời trang (Unsaved changes guard) | High | Đảm bảo an toàn dữ liệu khi người dùng sơ ý thoát trang. |
| Xóa bài viết | Medium | Thao tác destructive cần xác nhận chặt chẽ. |
| Nhân bản bài viết | Medium | Tiện ích nâng cao cho người quản trị. |

## 2) Forms
| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| `BlogPostForm` | `title`, `slug`, `excerpt`, `content`, `featured_image`, `category_ids`, `status`, `published_at` | `createBlogPostSchema` | Trình submit dữ liệu cập nhật qua `PUT /admin/blog-posts/{id}`, sau khi thành công thì reset form bằng data mới để xóa `isDirty` | Bấm Hủy hoặc biểu tượng quay lại -> Điều hướng về danh sách `/admin/blog-posts` |

## 3) Filters / Search / Pagination
Không áp dụng cho màn hình chi tiết chỉnh sửa (chỉ áp dụng ở danh sách).

## 3.1) Default Values / Reset Logic
| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| Trạng thái Xuất bản | Lấy từ `initialData.status` | Trả về trạng thái cũ | — |
| Lên lịch ngày/giờ | Định dạng thời gian `published_at` cũ nếu có | Trả về ngày/giờ đã lưu | Chỉ xuất hiện khi tuỳ chọn là `scheduled` |

## 4) Confirm / Destructive Actions
| Action | Confirm UI | Permission | Notes |
|---|---|---|---|
| Xóa bài viết | `DeleteConfirmDialog` (Custom Modal) | Admin | Staff bị vô hiệu hóa nút xóa. |
| Nhân bản bài viết | `window.confirm` | Admin / Staff | Hiển thị hộp thoại xác nhận nhanh trước khi sao chép. |
| Rời trang khi form bẩn | `UnsavedChangesGuard` (Dialog Modal) | Admin / Staff | Chặn chuyển hướng và hiển thị hộp thoại xác nhận thoát trang. |

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| Đang lưu thay đổi | Hiển thị spinner và text "Đang lưu..." ở nút | Vô hiệu hóa nút Lưu, Hủy và Xóa | Tránh gửi trùng yêu cầu |
| Đang upload ảnh | Spinner quay trên vùng uploader | Vô hiệu hóa nút Thay đổi/Xóa ảnh | Tránh click trùng |

## 5) i18n Keys To Add
Đã thêm đầy đủ ở Step 05 tại:
- `public/lang/vi/blog.json`
- `public/lang/en/blog.json`

## 6) Risks / Open Questions
- R-01: Thay đổi slug làm hỏng các liên kết cũ dẫn tới SEO 404 ở trang client.
  - *Giải pháp*: Hiển thị hộp thông tin màu vàng cảnh báo trực quan ngay dưới trường Slug khi phát hiện slug thay đổi so với slug gốc.
