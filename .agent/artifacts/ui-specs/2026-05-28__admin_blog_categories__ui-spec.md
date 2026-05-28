# UI Spec: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Component Design & Layout

Giao diện trang được cấu trúc dưới dạng bố cục chia 2 cột responsive (flex layout):
- **Cột Trái (Danh sách):**
  - Chứa thanh tìm kiếm tìm kiếm nhanh danh mục (`search_placeholder`: "Tìm danh mục...").
  - `BlogCategoryTable`: Bảng hiển thị danh mục blog (Tên, Slug, Mô tả ngắn), Số bài viết tương ứng kèm thanh tiến độ tỷ lệ, và các nút Thao tác (Sửa/Xóa).
  - Footer hướng dẫn kéo thả (được thiết kế tĩnh làm placeholder).
- **Cột Phải (Form):**
  - sticky tại `top-24` rộng `380px` (trên Desktop).
  - Tự động thay đổi tiêu đề Form: "Thêm danh mục" / "Chỉnh sửa danh mục".
  - Tự động thay đổi badge trạng thái: "MỚI" / "ĐANG SỬA".
  - Hộp Xem trước (Preview Box): Hiển thị realtime Tên, Slug, và Mô tả danh mục khi người dùng nhập thông tin.

## 2. UI States

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Bảng danh sách | Skeletons hiển thị | `EmptyState` kèm icon `FolderOff` | Icon AlertCircle + nút Thử lại | Tải lại danh sách danh mục mới |
| Form | Trạng thái bình thường | N/A | Hiện thông báo lỗi của từng trường dưới ô nhập | Toast thông báo + Reset Form |
| Xác nhận xóa | N/A | N/A | N/A | Đóng Modal + Toast thông báo thành công |

## 3. Localization Keys Added

Đã bổ sung dịch tiếng Việt và tiếng Anh cho các nhãn giao diện trong `blog.json`:
- `category.title`: "Danh mục Blog" / "Blog Categories"
- `category.subtitle`: "Quản lý danh mục phân loại bài viết blog" / "Manage blog classification categories"
- `category.stats.total`: "TỔNG DANH MỤC" / "TOTAL CATEGORIES"
- `category.stats.total_posts`: "TỔNG BÀI VIẾT" / "TOTAL POSTS"
- `category.table.col_name`: "Danh mục" / "Category"
- `category.table.col_posts_count`: "Số bài viết" / "Posts Count"
- `category.table.col_actions`: "Thao tác" / "Actions"
- `category.form.add_title`: "Thêm danh mục" / "Add Category"
- `category.form.edit_title`: "Chỉnh sửa danh mục" / "Edit Category"
- `category.form.preview`: "XEM TRƯỚC" / "PREVIEW"
- `category.delete.confirm_title`: "Xóa danh mục này?" / "Delete this category?"
- `category.delete.confirm_body`: "Danh mục \"{{name}}\" sẽ bị xóa vĩnh viễn." / "The category \"{{name}}\" will be permanently deleted."
