# Interaction Spec: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Source hooks: `src/hooks/useScheduleQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| **Thêm lịch mới (Create)** | Click button "Thêm lịch khởi hành" trong form Create | `useCreateSchedule` mutation | `toast.success(t('schedules:messages.create_success'))` và chuyển hướng về danh sách lịch / sửa tour gốc. | `toast.error(t('schedules:errors.create_failed'))` và hiển thị chi tiết lỗi kiểm xác từ server. |
| **Cập nhật lịch (Update)** | Click button "Cập nhật" trong form Edit | `useUpdateSchedule` mutation | `toast.success(t('schedules:messages.update_success'))` và chuyển hướng về danh sách lịch / sửa tour gốc. | `toast.error(t('schedules:errors.update_failed'))` và hiển thị chi tiết lỗi. |
| **Hủy thao tác (Cancel)** | Click button "Hủy" | Điều hướng `navigate(-1)` quay lại màn trước | Trả lại trạng thái trước đó, không thực hiện thay đổi dữ liệu. | N/A |
| **Xóa lịch đơn (Delete)** | Click nút Xóa lịch khởi hành trên bảng | `useDeleteSchedule` mutation | `toast.success(t('schedules:messages.delete_success'))` và tự động Invalidate query danh sách. | `toast.error(t('schedules:errors.delete_failed'))` nếu lịch đã có lượt đặt trước. |

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| **Cập nhật lịch (Update)** | **HIGH** | Thao tác diễn ra liên tục khi admin điều chỉnh giá tour/chỗ ngồi của các lịch sắp chạy hoặc đang chạy. |
| **Thêm lịch mới (Create)** | **HIGH** | Cho phép mở rộng lịch vận hành nhanh chóng cho các tour mới. |
| **Xóa lịch (Delete)** | **MEDIUM** | Cần thiết để dọn dẹp các lịch bị hủy hoặc lập sai, nhưng phải được bảo vệ tránh xóa nhầm lịch đã có người đặt vé. |

## 2) Forms
| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| **ScheduleForm** | `startDate`, `endDate`, `totalSlots`, `priceAdult`, `priceChild`, `priceInfant`, `status` | `schedule.schema.ts` qua `yupResolver` | Nhấn "Lưu" -> React Hook Form validate client -> Gọi mutation `useCreateSchedule`/`useUpdateSchedule` -> Hiển thị toast success -> Redirect | Nhấn "Hủy" -> Reset form về `defaultValues` ban đầu và gọi `navigate(-1)` để quay lại. |

### Ràng buộc Validation Đặc biệt:
1. **Ngày khởi hành tương lai (`R-01`)**:
   - *Create flow*: Bắt buộc `startDate >= today`.
   - *Edit flow*: Bỏ qua kiểm tra này nếu lịch đang sửa đã nằm trong quá khứ để cho phép chỉnh sửa mô tả/sức chứa của các sự kiện lịch sử mà không bị chặn lỗi.
2. **Sức chứa tối thiểu (`BR-03`)**:
   - Bắt buộc `totalSlots >= bookedSlots` (lấy dữ liệu từ API schedule hiện tại) để ngăn nhân viên đặt giới hạn nhỏ hơn số lượng khách hàng đã đặt vé thực tế.

## 3) Filters / Search / Pagination
*(Áp dụng tại màn hình danh sách Lịch khởi hành)*
| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| **Search theo tên tour** | `searchParams.get('search')` | Có | **400ms** | Chỉ cập nhật URL sau khi người dùng dừng gõ 400ms để tránh spam API requests. |
| **Filter theo trạng thái** | `searchParams.get('status')` | Có | Không | Thay đổi tức thì khi chọn giá trị dropdown. |
| **Filter theo khoảng ngày** | `searchParams.get('from')`, `to` | Có | Không | Lọc các lịch có `startDate` nằm trong khoảng ngày chọn. |
| **Phân trang (Pagination)** | `searchParams.get('page')` | Có | Không | Reset về `page = 1` khi thay đổi search hoặc các bộ lọc filter khác. |

## 3.1) Default Values / Reset Logic
| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| **Search** | `""` | Xóa sạch chuỗi tìm kiếm về rỗng | Quay lại hiển thị tất cả các tour. |
| **Status Filter** | `"All"` (Rỗng) | Reset về trống (không lọc theo status) | Hiển thị cả Available, Full và Cancelled. |
| **Date Range Filter** | `null` | Xóa khoảng ngày chọn | Hiển thị tất cả lịch khởi hành bất kể thời gian. |
| **Pagination** | `1` | Reset về trang đầu tiên | Luôn áp dụng khi bộ lọc thay đổi để tránh lỗi trang trống. |

## 4) Confirm / Destructive Actions
| Action | Confirm UI | Permission | Notes |
|---|---|---|---|
| **Xóa lịch (Delete)** | `<ConfirmDialog>` với variant `destructive` | Cần quyền `ADMIN` hoặc `MANAGER` | Hiển thị thông báo cảnh báo rõ ràng: *"Các lượt đặt tour thuộc lịch khởi hành này cần phải được xử lý trước khi xóa lịch"*. |
| **Cập nhật lịch trong quá khứ** | Hiển thị Banner màu hổ phách cảnh báo (`PastEventWarning`) ngay trên form sửa | Cần quyền `ADMIN` | Cảnh báo sửa đổi dữ liệu quá khứ có thể ảnh hưởng đến báo cáo tài chính/thống kê lịch sử. |

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| **Submit Form** | Đổi nút Save thành `LoadingReact` spinner và hiển thị trạng thái vô hiệu hóa. | Vô hiệu hóa nút "Lưu" (`disabled={isPending}`) và nút "Hủy". | Ngăn chặn hành vi nhấn đúp chuột gây duplicate request tạo lịch. |
| **Xóa lịch** | Spinner quay trên nút xác nhận xóa trong Modal confirm. | Vô hiệu hóa nút Hủy và nút Xóa trong thời gian chờ API. | Ngăn chặn việc bấm nút hủy giữa chừng khi server đang xử lý xóa. |

## 5) i18n Keys To Add
### Tiếng Việt (`public/lang/vi/schedules.json`)
```json
"validation": {
    "start_date_future": "Ngày khởi hành phải từ hôm nay trở đi",
    "end_date_after": "Ngày kết thúc phải sau hoặc bằng ngày khởi hành",
    "total_slots_min_booked": "Số lượng chỗ tối đa không thể nhỏ hơn số lượng ghế đã đặt ({{count}} ghế)",
    "past_event_title": "Lịch khởi hành trong quá khứ",
    "past_event_desc": "Cảnh báo: Bạn đang chỉnh sửa một lịch trình đã hoặc đang diễn ra. Hãy cẩn trọng để tránh ảnh hưởng đến dữ liệu khách hàng cũ."
}
```

### Tiếng Anh (`public/lang/en/schedules.json`)
```json
"validation": {
    "start_date_future": "Start date must be today or in the future",
    "end_date_after": "End date must be after or equal to start date",
    "total_slots_min_booked": "Maximum capacity cannot be less than booked slots ({{count}} seats)",
    "past_event_title": "Past departure schedule",
    "past_event_desc": "Warning: You are editing a schedule that has already occurred or is currently ongoing. Please proceed with caution to avoid affecting historical customer booking data."
}
```

## 6) Risks / Open Questions
- **R-01 (Ngày trong quá khứ)**: Nhân viên vận hành vô tình đổi ngày khởi hành của lịch quá khứ thành tương lai. 
  - *Giải pháp*: Cảnh báo `PastEventWarning` hiện diện rõ ràng, đồng thời trên server API sẽ kiểm tra nghiêm ngặt không cho phép đổi `startDate` của một lịch quá khứ thành tương lai nếu lịch đó đã có các booking thành công liên kết.
- **Q-01 (Tự động cập nhật trạng thái)**: Khi `totalSlots` giảm xuống bằng chính `bookedSlots` hiện tại thì trạng thái của lịch khởi hành có tự động đổi từ `AVAILABLE` sang `FULL` không?
  - *Giải pháp*: Có, hệ thống client và backend đồng bộ hóa suy diễn: nếu `bookedSlots >= totalSlots`, trạng thái hiển thị được tính toán tự động là `FULL` (hoặc sold-out).
