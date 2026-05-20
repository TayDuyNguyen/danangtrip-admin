# Auth & Permissions Review: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `src/routes/PrivateRoute.tsx`
  - `src/routes/index.tsx`
  - `src/pages/Tours/TourScheduleEdit/index.tsx`

## 1. Route Guard Review

- **Route:** `/admin/tours/schedules/edit/:id`
- **Tình trạng:** Đã được bảo vệ đúng. Route này nằm trong khối con của `<PrivateRoute />` tại `src/routes/index.tsx`.
- **Guard Level:** Route-level.
- **Logic Guard:** Kiểm tra `authReady`, sau đó `isAuthenticated && hasRole(user, 'admin')`. Nếu thất bại, redirect về `ROUTES.LOGIN`.

## 2. Permission Matrix Review

Hiện tại, theo logic của `PrivateRoute.tsx`, toàn bộ các route admin đều yêu cầu role `admin`. Nếu project sau này có role `staff` thì file `PrivateRoute` phải được mở rộng logic `hasRole(user, ['admin', 'staff'])`. Ở thời điểm hiện tại:

| Action | Admin | Staff | Guest |
|---|---|---|---|
| View màn hình Edit | ✓ | (Chưa setup) | ✗ |
| Edit & Submit form | ✓ | (Chưa setup) | ✗ |
| Xóa lịch (Delete) | ✓ | (Chưa setup) | ✗ |

*Assumptions: Hiện tại chưa có yêu cầu tách biệt quyền Edit và Delete giữa Admin và Staff (cả hai được xem chung là Admin user access).*

## 3. UI Gating Review

Vì toàn bộ component `TourScheduleEdit` nằm sau `PrivateRoute`, mọi element UI bên trong mặc định đều được bảo vệ. 
- Không có phần UI nào cần ẩn hiện (conditional render) theo role bên trong component này. Mọi user vào được màn này đều có quyền lưu hoặc xóa.

## 4. Auth Flow Integrity Review

- **Bootstrap/Loading:** `PrivateRoute` đã sử dụng `<LoadingReact />` nếu `!authReady`, đảm bảo app không chớp tắt (flicker) hay redirect sai trong lúc hydrate token từ local storage.
- **API Interceptor:** Axios client (trong code base) đã tự động đính kèm `Bearer token`, không bị lặp logic thủ công ở `scheduleApi.ts`.
- **Redirect:** Nếu user copy link `/admin/tours/schedules/edit/1` sang tab ẩn danh, họ sẽ bị redirect về `/login`.

## 5. Risk Review / Open Questions

- **Risk:** Nếu project dự định có role Staff và Admin riêng biệt nhưng Staff không được xóa lịch, thì việc gộp logic vào `PrivateRoute` là chưa đủ. Lúc đó cần sửa `ScheduleDeleteDialog` (chỉ render nút Xóa khi `hasRole(user, 'admin')`). Hiện tại không có yêu cầu đặc biệt nào ngoài scope, nên hệ thống được coi là an toàn.
- Frontend Auth flow hoạt động chuẩn xác theo thiết kế gốc.

=> Tính năng đã an toàn để triển khai test và deploy.
