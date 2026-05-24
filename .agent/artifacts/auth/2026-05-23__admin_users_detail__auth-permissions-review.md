# Auth & Permissions Review: Chi tiết Người dùng (`admin_users_detail`)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Guard file: `src/routes/PrivateRoute.tsx`

---

## 1) Routing Guard Verification
- **Route protected**: `/admin/users/:id`
- **Security element**: Managed strictly under `PrivateRoute` layout in `src/routes/index.tsx`.
- **Condition for entry**:
```typescript
isAuthenticated && hasRole(user, 'admin')
```
- **Redirect behavior**: Unauthenticated visitors or non-admin roles (e.g. `user`) are automatically blocked and redirected to `ROUTES.LOGIN` (`/login`) with parameter replacement enabled.

---

## 2) Administrative Self-Protection (BR-01)
To ensure system stability and prevent admins from locking themselves out of the system, strict check conditions are implemented at both Frontend and Backend:

### 2.1 Frontend Protection Controls
Inside `UserDetail/index.tsx`, `UserDetailHeader.tsx`, `UserActionsCard.tsx`, and `UserTable.tsx`:
- Compute active self-comparison check: `isSelf = currentAdmin?.id === Number(id)`
- If `isSelf === true`, the following buttons are automatically **disabled**:
  - Khóa tài khoản / Mở khóa (Block/Unblock)
  - Thay đổi vai trò (Change Role)
  - Xóa tài khoản (Delete)
- A friendly localized `"BẠN" / "YOU"` badge is rendered next to the name to clarify the restricted actions to the active admin.

### 2.2 Backend Protection Safeguards
Inside `D:\DATN\danangtrip-api\app\Services\UserService.php`:
- **`updateStatus` (lines 83-88)**:
```php
if ($id === $currentAdminId) {
    return [
        'status' => HttpStatusCode::FORBIDDEN->value,
        'message' => 'You cannot change your own status.',
    ];
}
```
- **`updateRole` (lines 128-135)**:
```php
if ($id === $currentAdminId) {
    return [
        'status' => HttpStatusCode::FORBIDDEN->value,
        'message' => 'You cannot change your own role.',
    ];
}
```
- **`deleteUser` (lines 296-301)**:
```php
if ($id === $currentAdminId) {
    return [
        'status' => HttpStatusCode::FORBIDDEN->value,
        'message' => 'You cannot delete your own account.',
    ];
}
```
This double-layered security enforces absolute safety.

---

## 3) Network Authorization Header
- `axiosClient.ts` contains a request interceptor that automatically reads the verified JWT from localStorage/store and attaches it as a `Bearer` token inside the `Authorization` header.
- Token refresh silent mechanism (`refreshAccessToken`) proactively monitors expiry within 5 minutes or handles 401 response challenges by queuing requests and renewing seamlessly without interrupting the UI experience.
