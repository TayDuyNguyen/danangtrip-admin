# Route Plan: Tạo / Sửa lịch khởi hành

> Feature slug: `admin-tour-schedule-form`
> Date: 2026-05-18
> Layout target: `MainLayout`

---

## 1) Summary
- **Mục đích**: Feature này cấu hình hai luồng nghiệp vụ chính là **Thêm mới lịch khởi hành** và **Cập nhật lịch khởi hành** của Tour du lịch.
- **Tình trạng Route**: Cả hai route `/admin/tours/:id/schedules/create` và `/admin/tours/schedules/edit/:id` đều đã được khai báo sẵn trong hệ thống định tuyến của ứng dụng React Admin SPA.
- **Mục tiêu chính của bước này**: Xác minh tính hợp lệ của luồng điều hướng, cấu trúc phân cấp Layout, luồng chuyển trang sau khi hoàn thành form, và định vị chính xác vị trí của các Page Skeleton nhằm chuẩn bị cho việc tích hợp dữ liệu sạch ở bước sau.

---

## 1.1) Route Decision
- **Route type**: `extend` (Kế thừa và chuẩn hóa cấu hình Router hiện tại).
- **Guard needed**: `yes` (Bảo vệ thông qua lớp `PrivateRoute` ở cấp Route-level để đảm bảo chỉ những tài khoản Admin hoặc Staff đã đăng nhập thành công mới có quyền truy cập).

---

## 2) Target Routes

Dưới đây là sơ đồ chi tiết các Route được cấu hình tại `src/routes/index.tsx` và `src/routes/routes.ts`:

| Route Path | Page Component | Guard | Layout | Notes |
|:---|:---|:---|:---|:---|
| `/admin/tours/:id/schedules/create` | `TourScheduleCreate` | `PrivateRoute` | `MainLayout` | Lấy tham số `:id` đại diện cho `tourId` để tạo lịch trình khởi hành mới. |
| `/admin/tours/schedules/edit/:id` | `TourScheduleEdit` | `PrivateRoute` | `MainLayout` | Lấy tham số `:id` đại diện cho `scheduleId` để chỉnh sửa lịch trình hiện có. |

---

## 3) Page Structure

Cấu trúc phân mục thư mục và file giao diện của module Lịch khởi hành:

| File | Purpose | Status |
|:---|:---|:---|
| [TourScheduleCreate/index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/index.tsx) | Trang Thêm mới lịch khởi hành. Sử dụng `useForm` quản lý form state và hiển thị Preview live. | **Đã có Skeleton cơ bản** |
| [TourScheduleEdit/index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleEdit/index.tsx) | Trang Chỉnh sửa lịch khởi hành. Tự động load dữ liệu cũ của lịch trình và truyền vào form. | **Đã có Skeleton cơ bản** |
| [TourScheduleCreate/components/TourInfoBox.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/TourInfoBox.tsx) | Hộp hiển thị thông tin chung của Tour hoặc Lịch khởi hành đang thao tác. | **Đã có** (Cần mod thêm chế độ Lịch) |
| [TourScheduleCreate/components/ScheduleForm.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx) | Form nhập liệu trung tâm chứa DatePicker, Input Capacity và override prices. | **Đã có** |
| [TourScheduleCreate/components/SchedulePreviewBox.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Tours/TourScheduleCreate/components/SchedulePreviewBox.tsx) | Hộp mô phỏng giao diện Preview thời gian thực của dữ liệu vừa nhập trên Form. | **Đã có** |

---

## 3.1) Layout / Guard Notes

| Concern | Decision | Notes |
|:---|:---|:---|
| **Layout** | Kế thừa `MainLayout` | Cung cấp sẵn thanh Menu bên trái (Sidebar) và Header chứa thông tin tài khoản admin/staff. |
| **ProtectedRoute** | Thực thi tại `PrivateRoute` | Chặn toàn bộ truy cập chưa đăng nhập và điều hướng tự động về `/login` qua React Router. |
| **Breadcrumb** | Đồng bộ Breadcrumb động | Thêm mới Breadcrumb theo đúng dòng chảy nghiệp vụ:<br>- **Create**: `Quản lý Tour / [Tên Tour] / Thêm lịch khởi hành`<br>- **Edit**: `Quản lý Tour / [Tên Tour] / Chỉnh sửa lịch khởi hành` |
| **Menu Item Active** | Trạng thái active của Sidebar | Giữ trạng thái active cho menu cha **"Quản lý Tour"** khi admin đang ở trong các sub-route Tạo/Sửa lịch. |

---

## 4) Navigation / Breadcrumb

Chi tiết luồng Breadcrumb và i18n key sử dụng:

| Item | Locale Key | Path | Icon | Notes |
|:---|:---|:---|:---|:---|
| Menu Sidebar | `schedules:sidebar_label` | `/admin/tours/schedules` | `ri-calendar-todo-line` | Menu quản lý danh sách lịch trình chung. |
| Breadcrumb Base | `schedules:breadcrumb` | `/admin/tours/list` | — | Liên kết ngược về danh sách tour chính. |
| Action Create | `schedules:actions.add_new` | `/admin/tours/:id/schedules/create` | `ri-add-line` | Hành động thêm lịch mới. |
| Action Edit | `common:actions.edit` | `/admin/tours/schedules/edit/:id` | `ri-save-line` | Hành động sửa lịch. |

---

## 5) Locale Updates

Để hỗ trợ đa ngôn ngữ hoàn hảo (tiếng Việt và tiếng Anh) cho các màn hình và các khối cảnh báo/stats mới, chúng ta cần bổ sung các locale key sau:

### 5.1) Tiếng Việt (`public/lang/vi/schedules.json`)
```json
{
  "breadcrumb": "Quản lý Tour",
  "actions": {
    "add_new": "Thêm lịch khởi hành",
    "edit_success": "Cập nhật lịch khởi hành thành công!",
    "add_success": "Thêm lịch khởi hành thành công!",
    "confirm_delete": "Xác nhận xóa lịch khởi hành"
  },
  "fields": {
    "start_date": "Ngày khởi hành",
    "end_date": "Ngày kết thúc",
    "max_people": "Số người tối đa",
    "price_adult": "Giá người lớn",
    "price_child": "Giá trẻ em",
    "price_infant": "Giá em bé",
    "status": "Trạng thái",
    "preview": "Xem trước",
    "booked_slots": "Đã đặt",
    "remaining_slots": "Còn trống",
    "filling_rate": "Tỉ lệ lấp đầy"
  },
  "validation": {
    "start_date_future": "Ngày khởi hành phải từ hôm nay trở đi",
    "end_date_after": "Ngày kết thúc phải sau ngày khởi hành",
    "total_slots_min_booked": "Số ghế tối đa không được nhỏ hơn số chỗ đã đặt (tối thiểu: {{booked}} chỗ)"
  },
  "warnings": {
    "past_event_title": "Lịch trình trong quá khứ",
    "past_event_desc": "Cảnh báo: Bạn đang chỉnh sửa một lịch trình đã hoặc đang diễn ra. Hãy cẩn trọng để tránh ảnh hưởng đến dữ liệu khách hàng cũ.",
    "delete_booked_schedule": "Không thể xóa lịch khởi hành đã có khách hàng đặt chỗ."
  }
}
```

### 5.2) Tiếng Anh (`public/lang/en/schedules.json`)
```json
{
  "breadcrumb": "Tour Management",
  "actions": {
    "add_new": "Add Departure Schedule",
    "edit_success": "Departure schedule updated successfully!",
    "add_success": "Departure schedule created successfully!",
    "confirm_delete": "Confirm Delete Schedule"
  },
  "fields": {
    "start_date": "Start Date",
    "end_date": "End Date",
    "max_people": "Maximum Capacity",
    "price_adult": "Adult Price",
    "price_child": "Child Price",
    "price_infant": "Infant Price",
    "status": "Status",
    "preview": "Preview",
    "booked_slots": "Booked",
    "remaining_slots": "Remaining",
    "filling_rate": "Filling Rate"
  },
  "validation": {
    "start_date_future": "Start date must be from today onwards",
    "end_date_after": "End date must be after start date",
    "total_slots_min_booked": "Capacity cannot be less than booked slots (minimum: {{booked}} slots)"
  },
  "warnings": {
    "past_event_title": "Past Event Schedule",
    "past_event_desc": "Warning: You are editing a schedule that has already occurred or is currently in progress. Use caution to avoid corrupting client data.",
    "delete_booked_schedule": "Cannot delete a departure schedule that already has bookings."
  }
}
```

---

## 6) Risks / Notes

- **`R-01` [Past Date Validation Lock]**: Trang chỉnh sửa `TourScheduleEdit` hiện tại đang import yup validation mặc định `getScheduleSchema(t)`, vốn có quy tắc khóa cứng ngày tương lai (`start >= today`). Điều này khiến nhân viên không thể submit lưu lại form nếu lịch trình được chọn nằm ở quá khứ (kể cả khi chỉ muốn sửa giá hoặc tăng số chỗ).
  - *Giải pháp*: Phải sửa file `TourScheduleEdit/index.tsx` để truyền cờ `isEdit: true` vào yup resolver: `getScheduleSchema(t, true)`.
- **`R-02` [Lỗi 404 khi Tour ID sai]**: Nếu admin nhập bừa ID tour trên URL (ví dụ `/admin/tours/sai-id/schedules/create`), API lấy chi tiết tour sẽ lỗi và giao diện crash.
  - *Giải pháp*: Tích hợp logic kiểm tra lỗi và chuyển hướng về danh sách Tour chủ động.

---

## 6.1) Open Questions

- **`Q-01` [Nút điều hướng Back]**: Nút [Hủy] trên Page Header và Footer hiện tại đang dùng `navigate(-1)`. Trong trường hợp nhân viên đi trực tiếp từ link lưu trữ hoặc bookmark, hành vi này có thể đưa họ ra ngoài ứng dụng.
  - *Giải pháp*: Sẽ cấu hình thông minh: nếu có history thì `navigate(-1)`, nếu không thì chuyển hướng an toàn về trang danh sách lịch của Tour đó: `${ROUTES.TOURS_SCHEDULES}?tour_id=${tourId}`.

---

## 7) Files Expected To Change

Các file cấu hình định tuyến và giao diện sẽ thay đổi:
- `src/routes/routes.ts` (Xác thực sự tồn tại của hằng số route)
- `src/routes/index.tsx` (Xác thực lazy load và binding Suspense)
- `src/pages/Tours/TourScheduleCreate/index.tsx` (Chỉnh sửa nhẹ hành vi cancel)
- `src/pages/Tours/TourScheduleEdit/index.tsx` (Tích hợp resolver isEdit, logic redirect an toàn)
- `public/lang/vi/schedules.json` (Bổ sung key dịch tiếng Việt mới)
- `public/lang/en/schedules.json` (Đồng bộ key dịch tiếng Anh mới)
