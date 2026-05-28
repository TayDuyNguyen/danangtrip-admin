# Route Plan: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Route Constant
Đã thêm hằng số định nghĩa đường dẫn trong `src/routes/routes.ts`:
```typescript
BLOG_CATEGORIES: '/admin/blog-categories'
```

## 2. Route Registration
Đăng ký lazy loading trong `src/routes/index.tsx`:
```typescript
const BlogCategories = React.lazy(() => import('@/pages/Blog/BlogCategories'));

// Trình con PrivateRoute > MainLayout:
{ path: ROUTES.BLOG_CATEGORIES, element: withSuspense(BlogCategories) }
```

## 3. Sidebar Navigation Submenu
Đã gom nhóm "Bài viết" cũ thành "Quản lý Blog" với 2 đường dẫn con trong `src/components/common/Sidebar.tsx`:
- **Nhãn:** `sidebar.blog` -> "Quản lý Blog"
- **Danh sách bài viết:** `ROUTES.BLOG_POSTS`
- **Danh mục Blog:** `ROUTES.BLOG_CATEGORIES`

Đồng thời thiết lập tự động mở rộng submenu khi truy cập đường dẫn `/admin/blog/*` thông qua trạng thái khởi đầu của `openMenus`:
```typescript
'/admin/blog': location.pathname.startsWith('/admin/blog')
```
