# Security & Guard Review: Quản lý Landing Pages (`admin_landing_pages`)

- **Feature Slug**: `admin_landing_pages`
- **Date**: 2026-06-02

---

## 1. Client-Side Router Guards

Trong frontend [index.tsx (Vite/React)](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx), tuyến đường `/admin/landing-pages` được đặt trong danh sách con của `<PrivateRoute />`:
- Nếu một người dùng chưa đăng nhập cố gắng truy cập trực tiếp bằng cách gõ URL, `PrivateRoute` sẽ tự động chuyển hướng họ về trang đăng nhập `/login`.
- Trạng thái đăng nhập được quản lý thông qua Zustand store `useAuth()` và được đồng bộ hóa với localStorage.

---

## 2. Server-Side Route & Role Protection

Trong backend [api.php (Laravel)](file:///d:/DATN/danangtrip-api/routes/api.php), toàn bộ các API endpoint quản trị Landing Pages đều được bao bọc bởi 2 lớp middleware:
```php
Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
    ...
    // Landing Pages
    Route::get('/landing-pages', [AdminLandingPageController::class, 'index']);
    ...
});
```
- **`jwt.auth`**: Bắt buộc mọi request phải đính kèm Header `Authorization: Bearer <Token>`. Nếu Token không tồn tại, hết hạn hoặc không hợp lệ, Laravel sẽ lập tức trả về mã lỗi `401 Unauthorized` và chặn không cho truy cập sâu hơn.
- **`role:admin`**: Kiểm tra thực tế trường `role` của người dùng đã được giải mã từ Token JWT. Nếu `role !== 'admin'`, server lập tức từ chối và trả về mã lỗi `403 Forbidden`.

---

## 3. Axios Interceptor Integration

- Tất cả các thao tác gọi API thông qua `landingPageApi` đều đi qua `axiosClient` của hệ thống.
- `axiosClient` tự động lấy Token từ storage và tiêm vào header cho mỗi request.
- Tự động bắt mã lỗi `401` từ server trả về để kích hoạt cơ chế xóa token lỗi và chuyển hướng người dùng về trang đăng nhập, đảm bảo an toàn bảo mật.

---

## 4. Conclusion

Hệ thống phân quyền được thiết kế hai lớp cực kỳ chặt chẽ, ngăn ngừa triệt để các hành vi dò tìm hoặc giả mạo request từ phía client không có quyền Admin.
