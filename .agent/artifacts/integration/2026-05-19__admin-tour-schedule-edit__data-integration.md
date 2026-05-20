# Data Integration: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `src/hooks/useScheduleQueries.ts`
  - `src/api/scheduleApi.ts`
  - `src/pages/Tours/TourScheduleEdit/index.tsx`

## 1. Data Source Breakdown

Các endpoints được sử dụng ở màn hình này:
- `GET /admin/tour-schedules/{id}`: Load chi tiết thông tin lịch khởi hành ban đầu. Mapped và parse type bằng `scheduleMapper.mapFromRaw`.
- `GET /admin/tours/{id}`: Load thông tin tên tour, hình ảnh để hiển thị trên `TourInfoBox`. Phụ thuộc vào `tour_id` trả về từ `getSchedule`.
- `PUT /admin/tour-schedules/{id}`: Lưu lại những thay đổi (ngày tháng, slots, giá, trạng thái).
- `DELETE /admin/tour-schedules/{id}`: Xóa hẳn lịch. Action này được bảo vệ bởi một confirmation dialog.

## 2. Query Strategy

| Hook / State | Query Key | Trigger / Dependency | Purpose |
|---|---|---|---|
| `useSchedule` | `['schedules', 'detail', id]` | Khi truy cập trang có chứa `id` hợp lệ. | Cung cấp initial form data (`startDate`, `totalSlots`, v.v.). Truyền vào RHF `reset()`. |
| `useTourDetailQuery` | `['tours', 'detail', schedule?.tourId]` | Chỉ run khi có giá trị `schedule?.tourId`. | Cung cấp UI `TourInfoBox`. |
| Validation bypass flag | - | Dựa vào `schedule?.startDate` & `today` | Tính `isPastSchedule`. Nếu true => show alert, bỏ qua validation bắt buộc ngày khởi hành phải >= hôm nay. |

- Loading Skeleton được hiển thị (sử dụng component `<LoadingReact>`) khi `isLoadingSchedule === true`.
- Không sử dụng `staleTime` quá dài cho màn hình Edit để tránh xung đột dữ liệu realtime. (TanStack giữ mặc định 0 ms, stale immediate).

## 3. Mutation Strategy

| Hook | Invalidates Queries | Feedback |
|---|---|---|
| `useUpdateSchedule` | `schedules.lists()`, `schedules.detail(id)`, `tour-edit-schedules`, `tour-detail-schedules` | Toast thành công (`schedules:success.update`), Toast lỗi. |
| `useDeleteSchedule` | `schedules.lists()`, `schedules.all()`, `tour-edit-schedules`, `tour-detail-schedules` | Toast thành công (`schedules:success.delete`), Toast lỗi. |

Hành vi Invalidate Queries rất chặt chẽ, vì mỗi lần sửa/xoá lịch sẽ tự động cập nhật lại màn hình danh sách lịch, cũng như thông tin lịch thu gọn ở màn hình `TourEdit` hay Modal chọn lịch.

## 4. UI State Handling

- **Page Load:** Show `LoadingReact` ở giữa màn hình.
- **Form Submission:** Nút "Lưu thay đổi" disable và hiện icon loader trong lúc call API. Nút "Xóa" cũng bị khóa.
- **Delete Flow:** Bấm "Xóa lịch này" -> Popup Dialog. Khi chọn "Xóa", nút "Xóa lịch" trong dialog vào state `isLoading` (spinner) từ `deleteScheduleMutation.isPending`, khóa mọi click bên ngoài. Xóa xong -> redirect về `/admin/tours/schedules` và show toast.
- **Error:** Nếu API lỗi (e.g., xoá bị block), `sonner` toast hiện lên góc màn hình, form không vỡ.
- **Side effects:** Sau khi edit, tự động route về list (`/admin/tours/schedules?tour_id={id}`), hoặc quay lại form Edit Tour nếu context `location.state.fromTourEdit` là true.

## 5. Implementation Notes

Toàn bộ UI và Data đã được tích hợp đầy đủ trong file `TourScheduleEdit/index.tsx`.
- Component `<ScheduleStatsBlock />` nhận data từ object `schedule` được Tanstack trả về.
- Nút Xóa lịch trigger hàm `handleDelete`, được wrap cẩn thận cùng `isDeleteDialogOpen`.
- Thư mục components đã hoàn chỉnh (vừa được tạo ở bước 05).
