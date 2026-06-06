# Data Integration: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Query Data Flow

- Trang quản lý tích hợp API thông qua React Query Hook `useBlogCategoriesQuery()`.
- Data được tải tự động khi mount component và lưu trữ trong bộ nhớ đệm (Cache) của React Query.
- Khi người dùng gõ tìm kiếm trên Toolbar, dữ liệu được lọc trực tiếp trên client để tăng tốc độ phản hồi:
```typescript
const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) => {
        return (
            item.name.toLowerCase().includes(query) ||
            item.slug.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
    });
}, [categories, search]);
```

## 2. Mutation & Cache Invalidation

Các mutations tạo mới, cập nhật và xóa danh mục được cấu hình tự động làm mới cache (Invalidate Queries) sau khi thực hiện thành công:

- **Tạo mới:** `useCreateBlogCategoryMutation()`
  - Gọi `POST /admin/blog-categories`
  - Thành công: Invalidate `['blogs', 'categories']` -> Tải lại danh sách danh mục tự động.
- **Cập nhật:** `useUpdateBlogCategoryMutation()`
  - Gọi `PUT /admin/blog-categories/{id}`
  - Thành công: Invalidate `['blogs', 'categories']`.
- **Xóa:** `useDeleteBlogCategoryMutation()`
  - Gọi `DELETE /admin/blog-categories/{id}`
  - Thành công: Invalidate `['blogs', 'categories']`.

## 3. Error & Loading Feedback

- Bảng danh sách hiển thị spinner tải dữ liệu khi trang đang mount lần đầu.
- Trình bày thông báo lỗi trực quan kèm nút "Thử lại" (`refetch`) nếu máy chủ lỗi.
- Trình bày spinner vô hiệu hóa trên nút submit của Form khi đang xử lý API để tránh click trùng lặp (Double Submit).
- Thông báo Toast phản hồi thành công/thất bại thông qua thư viện `sonner`.
