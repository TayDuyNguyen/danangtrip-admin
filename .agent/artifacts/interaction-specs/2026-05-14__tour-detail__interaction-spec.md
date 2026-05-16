# Interaction Specification: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-14
- **Reference:** `.agent/artifacts/analysis/2026-05-14__tour-detail__screen-analysis.md`, `page doc`

## 1. Main User Actions

| Action | Component Trigger | Type | Feedback |
|---|---|---|---|
| Xem trang (Public) | `TourDetailHeader` | Link | Mở tab mới tới website người dùng. |
| Chỉnh sửa Tour | `TourDetailHeader`, `SidebarActions` | Navigation | Chuyển hướng tới `/admin/tours/:id/edit`. |
| Toggle Status | `SidebarSettings` | Patch Mutation | Toast Success/Error + Invalidate Query. |
| Toggle Featured | `SidebarSettings` | Patch Mutation | Toast Success/Error + Invalidate Query. |
| Toggle Hot | `SidebarSettings` | Patch Mutation | Toast Success/Error + Invalidate Query. |
| Thêm lịch | `ScheduleTable`, `SidebarActions` | Navigation | Chuyển hướng tới `/admin/tours/:id/schedules/create`. |
| Sửa lịch | `ScheduleTable` | Navigation | Chuyển hướng tới `/admin/tour-schedules/:id/edit`. |
| Xóa lịch | `ScheduleTable` | Destructive | `ConfirmDialog` + Toast + Invalidate. |
| Xóa Tour | `SidebarActions` | Destructive | `ConfirmDialog` + Toast + Redirect `/admin/tours`. |
| Chuyển Tabs mô tả | `TourInfoSection` | UI State | Toggle nội dung hiển thị (Short vs Detail). |

## 2. Destructive Actions & Confirmation

### 2.1. Xóa Tour (Delete Tour)
- **Trigger:** Nút "Xóa tour vĩnh viễn" tại sidebar.
- **Confirm UI:** Sử dụng `ConfirmDialog`.
  - Title: `tour:dialog.delete_title`
  - Desc: `tour:dialog.delete_confirm` (truyền name của tour).
  - Variant: `destructive`.
- **Logic:** Gọi `deleteMutation`.
- **Success:** Toast "Đã xóa tour thành công" + Điều hướng về danh sách tour.
- **Error:** Toast hiển thị lỗi từ API (VD: "Không thể xóa tour đã có booking").

### 2.2. Xóa Lịch khởi hành (Delete Schedule)
- **Trigger:** Icon xóa tại mỗi dòng trong `TourScheduleTable`.
- **Confirm UI:** Sử dụng `ConfirmDialog`.
  - Desc: "Bạn có chắc chắn muốn xóa lịch khởi hành ngày [date]?"
- **Logic:** Gọi `deleteScheduleMutation`.
- **Success:** Toast "Xóa lịch thành công" + Invalidate `schedules` query.

## 3. Form and Quick Toggles

Màn hình này không có form phức tạp nhưng có các **Quick Toggles** tại sidebar:
- **Trạng thái (Active/Inactive):** Sử dụng `CustomSelect` hoặc `DropdownMenu` nhỏ.
- **Hot / Featured:** Sử dụng `ToggleSwitch` component.
- **Behavior:** Mỗi khi switch thay đổi, gọi mutation ngay lập tức. Hiển thị loading state trên chính toggle đó hoặc dùng overlay nhẹ nếu cần.

## 4. URL and Navigation

- **Detail Route:** `/admin/tours/:id`
- **Back Navigation:** Nút back tại `PageHeader` quay về `/admin/tours`.
- **Sub-pages:** Khi nhấn "Thêm lịch" hoặc "Sửa lịch", URL sẽ thay đổi nhưng breadcrumb của trang đích phải giữ liên kết quay lại trang Detail này.

## 5. i18n Impact

Cần bổ sung/đảm bảo các keys sau trong `tour.json`:
- `detail.actions.view_public`: "Xem trang"
- `detail.actions.edit_tour`: "Chỉnh sửa tour"
- `detail.actions.delete_tour`: "Xóa tour vĩnh viễn"
- `detail.actions.add_schedule`: "Thêm lịch khởi hành"
- `detail.tabs.short_desc`: "Mô tả ngắn"
- `detail.tabs.full_desc`: "Mô tả chi tiết"

## 6. Handoff to Implementation

- **Confirm Component:** Reuse `src/pages/Tours/TourList/components/TourDeleteDialog.tsx` nếu có thể cấu hình linh hoạt, hoặc dùng `ConfirmDialog` chung.
- **Feedback:** Luôn dùng `sonner` cho mọi kết quả mutation.
- **Loading:** Nút bấm phải có `disabled` và icon `loading` khi mutation đang `isPending`.
