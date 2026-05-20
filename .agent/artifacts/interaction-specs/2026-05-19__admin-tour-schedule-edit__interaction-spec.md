# Interaction Spec: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `src/pages/Tours/TourScheduleEdit/index.tsx`
  - `src/validations/schedule.schema.ts`
  - `src/hooks/useScheduleQueries.ts`

## 1. Action Breakdown

Các action chính của người dùng trên trang này:
- **View:** Xem thông tin hiện tại của một lịch khởi hành (Ngày, max slots, giá, trạng thái, đã book).
- **Edit & Submit:** Thay đổi field trong form và ấn "Lưu thay đổi".
- **Delete:** Ấn "Xóa lịch này" -> Mở Dialog Confirm -> Ấn Xác nhận xóa.
- **Cancel:** Ấn "Hủy" hoặc Back để quay lại trang trước.

## 2. Form Flow Review

- **Schema:** Sử dụng `getScheduleSchema(t, isEdit = true, bookedSlots)` kết hợp với `react-hook-form` và `yupResolver`.
- **Validation Rules (Edit Context):**
  - Bỏ qua check `startDate >= today` (is-future bypass).
  - Check `totalSlots >= bookedSlots` (min-booked constraint).
  - Check `endDate >= startDate`.
  - Các trường giá `priceAdult`, `priceChild`, `priceInfant` có thể null (áp dụng giá theo Tour) hoặc phải >= 0.
- **Submit Flow:**
  - Nút Submit trigger `methods.handleSubmit(onSubmit)`.
  - `updateScheduleMutation` được gọi.
  - Trạng thái `isPending` disable nút Submit, hiển thị spinner/icon.
  - Thành công: Hiện `toast.success`, điều hướng về `/admin/tours/schedules?tour_id=xxx`.
  - Thất bại: Hiện `toast.error` (do Error Boundary hoặc `onError` callback của TanStack).

## 3. URL-Synced State Review

- Feature này là Form chi tiết (`/admin/tours/schedules/edit/:id`), không có List View nội bộ nên không cần setup search/filter/pagination trên URL.
- State duy nhất đọc từ URL là `id` thông qua `useParams`.
- Đọc `location.state.fromTourEdit` để điều hướng ngược về Tour Edit an toàn nếu xuất phát từ đó.

## 4. Destructive Actions Review

- **Action:** Delete Schedule.
- **Trigger:** Nút "Xóa lịch này" (variant: outline, red text).
- **Confirm UI:** Gọi component `<ScheduleDeleteDialog>`.
  - Dialog hiển thị thông tin ngày KH của Tour.
  - Render thêm warning nếu `bookedSlots > 0` (Dialog đã xử lý logic này bằng văn bản tĩnh hoặc truyền từ ngoài vào).
- **Feedback:**
  - Nút "Xóa" trong dialog quay (spinner) trong lúc đang xóa (`isDeleting` prop).
  - Thành công: Toast success, đóng dialog, navigate back.
  - Thất bại: Toast error.
- **Invalidation Strategy:** `SCHEDULE_QUERY_KEYS.lists()`, `SCHEDULE_QUERY_KEYS.all`, `tour-edit-schedules`, `tour-detail-schedules`. (Đã setup trong `useDeleteSchedule`).

## 5. Unsaved Changes Guard

Dự án hiện chưa có setup sẵn component Router Guard (ví dụ: blocker của react-router-dom v6+). Do form này khá ngắn và quy trình hiện tại là Admin/Staff chủ động chỉnh sửa, chúng ta sẽ không custom build hook `<Prompt>` (vì nó bị deprecate ở RRv6 và đòi hỏi setup `useBlocker` data router phức tạp) nếu không có yêu cầu bắt buộc, nhằm giữ codebase clean. State form (dirty) đã được RHF theo dõi.

## 6. Handoff To Implementation

Tất cả các interactions đã được triển khai chính xác ở bước `06-data-integration` trong file `src/pages/Tours/TourScheduleEdit/index.tsx`.
- Form dùng RHF + Yup đúng chuẩn.
- Các mutations nối vào Button đúng chuẩn kèm theo UX disables.
- Dialog Delete hoạt động và được truyền props đầy đủ.
- i18n keys đã sử dụng chuẩn (nếu có key báo thiếu sẽ được add vào `public/locales` ở môi trường dev).

=> Module tương tác UI đã đạt chuẩn. Next Step: Auth & Permissions.
