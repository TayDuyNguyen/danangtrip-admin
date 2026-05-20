# Route Plan: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `.agent/artifacts/analysis/2026-05-19__admin-tour-schedule-edit__screen-analysis.md`
  - `src/routes/routes.ts`
  - `src/routes/index.tsx`
  - `src/pages/Tours/TourScheduleEdit/index.tsx`

## 1. Route Scope Review

- **Route Path:** `/admin/tours/schedules/edit/:id` (Sử dụng hằng số `ROUTES.TOURS_SCHEDULE_EDIT`)
- **Tình trạng:** Route đã tồn tại và được đăng ký chuẩn xác.
- **Auth/Guard Requirement:** Bắt buộc đăng nhập. Route này đã được đặt bên trong children của `<PrivateRoute />` và `<MainLayout />`. Chỉ Admin/Staff mới có thể truy cập (phân quyền chi tiết sẽ check ở bước 08).
- **Layout Chain:** `AppRoute -> PrivateRoute -> MainLayout -> Suspense -> TourScheduleEdit`.

## 2. Page Skeleton Planning

Trang `TourScheduleEdit` đã được khởi tạo tại `src/pages/Tours/TourScheduleEdit/index.tsx`.
Cấu trúc Page Skeleton bao gồm:
- **Trạng thái Loading:** Khi đang fetch `getSchedule(id)`, hiển thị `<LoadingReact type="spokes" />` full width/height.
- **Trạng thái Sẵn sàng:**
  - Header: Breadcrumb + Tiêu đề + Các nút Actions (Hủy / Sửa).
  - Main Content (Grid):
    - Col trái (Form): Chứa `ScheduleForm` (tái sử dụng từ Create) và `PastEventWarning` (nếu lịch trong quá khứ).
    - Col phải (Preview): Chứa `SchedulePreviewBox` và các thẻ Notice/Help.
  - Mobile Actions Bar: Fixed dưới cùng màn hình ở viewport nhỏ.

## 3. Navigation And i18n Planning

- **Breadcrumb:** Quản lý nội bộ trong trang: `t('schedules:breadcrumb') > t('common:actions.edit')`.
- **Menu Label:** Không thêm menu item riêng biệt vào Sidebar cho màn Edit. Người dùng truy cập thông qua các nút "Edit" trên bảng danh sách Lịch (`TourSchedules`) hoặc danh sách Tour.
- **i18n Keys:**
  - Đã tận dụng `schedules:breadcrumb`, `common:actions.edit`, `common:actions.cancel`.
  - Các key báo lỗi hoặc cảnh báo (`schedules:validation.past_event_title`, `schedules:validation.past_event_desc`) đã được setup. Việc verify language sync (`vi`/`en`) sẽ được đảm bảo ở bước UI/Integration.

## 4. Route Registration Planning

Các file sau đã được đăng ký và không cần chỉnh sửa cấu trúc:
- `src/routes/routes.ts`: `TOURS_SCHEDULE_EDIT: '/admin/tours/schedules/edit/:id'`
- `src/routes/index.tsx`: 
  ```tsx
  const TourScheduleEdit = React.lazy(() => import('@/pages/Tours/TourScheduleEdit'));
  // ... trong router ...
  { path: ROUTES.TOURS_SCHEDULE_EDIT, element: withSuspense(TourScheduleEdit) }
  ```

## 5. Handoff Notes

- **To UI/Data step:** Page shell đã hoàn thiện, React Router đã đăng ký, và page đang được lazy-load đúng chuẩn. Form wiring hiện tại đã connect tạm thời vào `updateScheduleMutation`.
- Các bước tiếp theo (`05-ui-components`, `06-data-integration`) sẽ đi sâu vào việc Refactor hoặc bổ sung các Block còn thiếu so với Mockup (như Block Thống Kê `ScheduleStatsBlock`, Info block, Delete Dialog) vào chính skeleton hiện tại.
