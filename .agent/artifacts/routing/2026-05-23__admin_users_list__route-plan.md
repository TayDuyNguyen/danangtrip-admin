# Route Plan: Danh sách Người dùng (admin_users_list)

> Feature slug: `admin_users_list`
> Date: 2026-05-23
> Scope: `layout & routing`

---

## 1) Route Registration Details

Đăng ký định tuyến cho trang Danh sách Người dùng (`/admin/users`):

- **Tệp đăng ký:** [routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts)
  - Hằng số mới: `USERS_LIST: '/admin/users'`
- **Tệp Router chính:** [index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx)
  - Lazy import:
    ```typescript
    const UserList = React.lazy(() => import('@/pages/Users/UserList'));
    ```
  - Khai báo định tuyến dưới dạng bảo vệ (`PrivateRoute`):
    ```typescript
    { path: ROUTES.USERS_LIST, element: withSuspense(UserList) },
    ```

---

## 2) Navigation & Breadcrumbs

- **Sidebar Integration:**
  - Tệp chỉnh sửa: [Sidebar.tsx](file:///d:/DATN/danangtrip-admin/src/components/common/Sidebar.tsx)
  - Thay đường dẫn cứng `/admin/users` ở dòng 59 bằng hằng số `ROUTES.USERS_LIST` để liên kết chính xác.
  - Sidebar sử dụng icon `Users` từ `lucide-react`.
- **Breadcrumbs Hierarchy:**
  - Nhãn hiển thị: `"Người dùng / Danh sách Người dùng"` (Chuỗi dịch `user:breadcrumb`).
  - Đường dẫn: `/admin/dashboard` ➔ `/admin/users`

---

## 3) Internationalization (i18n) Namespaces

- **Tệp đăng ký Namespace:** [index.ts](file:///d:/DATN/danangtrip-admin/src/i18n/index.ts)
  - Bổ sung `'user'` vào danh sách namespaces preloaded.
- **Tệp dịch thuật (Localization Files):**
  - Tiếng Việt: [public/lang/vi/user.json](file:///d:/DATN/danangtrip-admin/public/lang/vi/user.json) (PASS - 100% key hoàn chỉnh)
  - Tiếng Anh: [public/lang/en/user.json](file:///d:/DATN/danangtrip-admin/public/lang/en/user.json) (PASS - Đồng bộ 100% key)
