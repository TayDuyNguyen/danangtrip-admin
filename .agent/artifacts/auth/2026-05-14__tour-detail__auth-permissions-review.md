# Auth & Permissions Review: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **Feature Type:** authenticated-only | role-based
- **Relevant Roles:** `admin`, `staff`

## 1. Protected Route Review

| Route | Path | Current Guard | Status |
|---|---|---|---|
| Tour Detail | `/admin/tours/:id` | `PrivateRoute` (admin-only) | ⚠️ Need Update |

**Review Note:**
Hiện tại `src/routes/PrivateRoute.tsx` đang chặn cứng chỉ cho phép role `admin`. Để hỗ trợ role `staff` như yêu cầu, cần cập nhật logic guard để chấp nhận cả `['admin', 'staff']`.

## 2. Permission Matrix

Dựa trên yêu cầu và pattern chung của hệ thống quản lý:

| Action | Admin | Staff | Note |
|---|---|---|---|
| View Detail | ✓ | ✓ | Xem toàn bộ thông tin tour. |
| Toggle Status | ✓ | ✓ | Đổi trạng thái hiển thị nhanh. |
| Toggle Hot/Featured | ✓ | ✓ | Đổi nhãn nổi bật/hot. |
| Edit Tour | ✓ | ✓ | Chuyển sang trang chỉnh sửa. |
| Delete Tour | ✓ | ✗ | **Admin-only**. Chỉ admin mới có quyền xóa vĩnh viễn. |
| Add/Edit Schedule | ✓ | ✓ | Quản lý lịch khởi hành. |
| Delete Schedule | ✓ | ✗ | **Admin-only** (Khuyến nghị). |

## 3. Guarded UI Actions

Để đảm bảo UX tốt và Security, các action không có quyền sẽ được xử lý như sau:

- **Nút "Xóa tour vĩnh viễn" (Sidebar):**
  - Role `staff`: Ẩn hoàn toàn (không render) để tránh nhầm lẫn.
- **Icon "Delete" (Schedule Table):**
  - Role `staff`: Ẩn hoặc disable kèm tooltip giải thích.
- **Nút "Chỉnh sửa" & "Thêm lịch":**
  - Hiển thị cho cả `admin` và `staff`.

## 4. Auth Flow Integrity

- **Token Attachment:** Đã được xử lý tự động qua `axiosClient` interceptor. Không cần can thiệp ở feature level.
- **Token Expired:** Tự động logout và xóa state qua interceptor 401.
- **Redirect Behavior:** Nếu chưa đăng nhập, `PrivateRoute` điều hướng về `/login`.

## 5. Risks and Assumptions

- **[RISK]**: Role `staff` hiện chưa có trong type definition `UserRole` (`src/types/auth.ts`) và chưa được check trong `PrivateRoute`. Cần cập nhật code nền trước khi implement UI.
- **[ASSUMPTION]**: Backend API đã có logic check quyền tương ứng (VD: API DELETE tour chỉ cho admin). Frontend review này dựa trên giả định backend cũng tuân thủ matrix trên.
- **[NOTE]**: Cần thống nhất xem `staff` có được phép xóa lịch khởi hành không, hay chỉ được phép thêm/sửa.

## 6. Files Expected to Change

| File | Action | Reason |
|---|---|---|
| `src/types/auth.ts` | Edit | Thêm `staff` vào `UserRole`. |
| `src/routes/PrivateRoute.tsx` | Edit | Cập nhật `hasRole(user, ['admin', 'staff'])`. |
| `src/pages/Tours/TourDetail/components/TourQuickActions.tsx` | Edit | Thêm logic `user.role === 'admin'` để hiển thị nút Xóa. |
