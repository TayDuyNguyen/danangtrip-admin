# Auth & Permissions Review: Danh mục Blog (admin_blog_categories)

- **Feature Slug:** `admin_blog_categories`
- **Date Locked:** `2026-05-28`

## 1. Route Access Protection

Đường dẫn `/admin/blog-categories` đã được bọc hoàn toàn bên dưới route guard `PrivateRoute` trong `src/routes/index.tsx`:

```tsx
{
    element: <PrivateRoute />,
    errorElement: <ErrorPage />,
    children: [
        {
            element: <MainLayout />,
            children: [
                ...
                { path: ROUTES.BLOG_CATEGORIES, element: withSuspense(BlogCategories) },
            ]
        }
    ]
}
```
`PrivateRoute` sẽ kiểm tra trạng thái đăng nhập của người dùng qua `useAuth` hook. Nếu chưa đăng nhập hoặc token hết hiệu lực, người dùng sẽ tự động bị điều hướng về màn hình đăng nhập (`/login`).

## 2. API Level Security

Tất cả các lệnh gọi API đến các đầu cuối (endpoints) thuộc quản lý danh mục blog:
- `GET /api/v1/admin/blog-categories`
- `POST /api/v1/admin/blog-categories`
- `PUT /api/v1/admin/blog-categories/{id}`
- `DELETE /api/v1/admin/blog-categories/{id}`

Đều bắt buộc phải đính kèm Header Authorization: `Bearer <JWT_TOKEN>`. Điều này được đảm bảo tự động bởi interceptor của `axiosClient` trong `src/api/axiosClient.ts`.
Phía backend Laravel sử dụng middleware `role:admin` hoặc `jwt.auth` bảo vệ chặt chẽ các route này. Bất kỳ nỗ lực gọi API nào từ tài khoản không đủ đặc quyền sẽ nhận về mã phản hồi `403 Forbidden` hoặc `401 Unauthorized` và bị xử lý tập trung (logout/redirect).
