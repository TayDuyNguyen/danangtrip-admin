# Screen Analysis: Chỉnh sửa lịch khởi hành

- **Feature Slug:** `admin-tour-schedule-edit`
- **Date:** 2026-05-19
- **Sources Used:**
  - `docs/page/admin_tour_schedules_edit.md`
  - `docs/page/admin_tour_schedules_create.md`
  - `docs/api/api_list.md`
  - `API_ENDPOINT_MATRIX.md`
  - `DESIGN.md`
  - Prototype images & HTML (`09.7-Chinh_Sua_Lich_Khoi_Hanh.*`)

## 1. Summary And Scope

- **Tên màn hình:** Chỉnh sửa lịch khởi hành
- **Mục tiêu nghiệp vụ:** Cung cấp giao diện để admin/staff xem và chỉnh sửa thông tin của một lịch khởi hành đã tồn tại. Bao gồm việc điều chỉnh ngày, số chỗ tối đa, giá riêng (nếu có), trạng thái, và cung cấp tính năng xóa lịch.
- **Actor chính:** Admin, Staff
- **Module liên quan:** Tours, Tour Schedules, Bookings (tác động gián tiếp do thay đổi lịch).

## 2. Design And Token Audit

- **Layout:** Tái sử dụng layout single column centered với `max-w-680px` từ màn thêm lịch.
- **Màu sắc:** Theo `DESIGN.md`, primary accent là `#14B8A6`. Mặc dù mockup document ghi các mã màu như `#0066CC` (blue), ta sẽ map các token này sang biến CSS chuẩn của project (vd: `text-primary`, `bg-primary`) hoặc giữ semantic tailwind classes (`text-teal-600` tương đương primary) tùy theo cách project đang setup. Các trạng thái Warning/Error giữ nguyên semantic màu Amber (`#F59E0B`) và Red (`#EF4444`).
- **Typography & Radius:** Tuân thủ System Font và các scale radius (16px, 24px) từ `DESIGN.md`.

## 3. Component Breakdown

| Component | Type | Layer | Path | Reason |
|---|---|---|---|---|
| `ScheduleForm` | [MOD] | Organism | `src/pages/Tours/TourScheduleCreate/components/ScheduleForm.tsx` (cần tách ra file dùng chung hoặc tạo bản sao có logic edit) | Form chính tái sử dụng cấu trúc UI từ màn tạo lịch, thêm logic `isEdit` để điền dữ liệu cũ và skip một số validation. |
| `ScheduleInfoBox` | [NEW] | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleInfoBox.tsx` | Thay thế cho `TourInfoBox` ở màn Thêm mới, hiển thị ngày lịch, tên tour và badge trạng thái. |
| `ScheduleStatsBlock` | [NEW] | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleStatsBlock.tsx` | Khối thống kê: Số đã đặt, Số còn trống, Tổng tối đa và thanh Progress Bar (từ mockup `09.7`). |
| `ScheduleMetaBlock` | [NEW] | Molecule | `src/pages/Tours/TourScheduleEdit/components/ScheduleMetaBlock.tsx` | Khối thông tin ngày tạo, ngày cập nhật, link thuộc tour. |
| `PastEventWarning` | [NEW] | Atom | `src/pages/Tours/TourScheduleEdit/components/PastEventWarning.tsx` | Banner cảnh báo khi ngày KH đã ở trong quá khứ. |
| `ScheduleDeleteDialog` | [REUSE] | Molecule | `src/pages/Tours/TourSchedules/components/ScheduleDeleteDialog.tsx` | Dialog confirm xóa lịch, tái sử dụng từ màn danh sách. Cần hỗ trợ hiển thị warning bổ sung nếu `booked_slots > 0`. |
| `UnsavedChangesGuard` | [REUSE/NEW] | Logic/Atom | (tùy project router v7 setup) | Cảnh báo khi người dùng nhấn Back/Hủy mà form đã có giá trị thay đổi (dirty). |

## 4. Responsive And UI States

| Section | Loading | Empty | Error | Success / Action |
|---|---|---|---|---|
| Toàn trang / Data Fetch | `ScheduleFormSkeleton` (Toàn bộ form fields hiển thị skeleton `h-10` pulse + spinner "Đang tải dữ liệu...") | Render component báo lỗi "Không tìm thấy lịch khởi hành" / HTTP 404 | Toast error + Nút thử lại | Render form với dữ liệu pre-filled |
| Khối Thống kê | Skeleton grid 3 cột | N/A | N/A | Render real data (progress bar tính dựa trên booked/max) |
| Form Submit | Nút Lưu bị disabled, hiện spinner "Đang lưu..." | N/A | Field errors báo đỏ / Global Toast Error "Có lỗi xảy ra" | Toast Success "Cập nhật lịch thành công!" (stay on page) |
| Nút Xóa (Delete) | Button disabled nếu đang submit | N/A | Toast Error nếu xóa fail | Redirect về `/admin/tour-schedules` + Toast Success |

## 5. Data And API Mapping

| Field (UI) | API Payload/Response Field (Assumed/Actual) | Type | Required | Source Endpoint | Validation/Notes |
|---|---|---|---|---|---|
| ID | `id` | string/number | ✓ | `GET /admin/tour-schedules/{id}` | Lấy từ URL params |
| Ngày khởi hành | `start_date` / `startDate` | string(date) | ✓ | `GET /admin/tour-schedules/{id}` | Bỏ qua lỗi "không chọn ngày quá khứ" nếu đang sửa (isEdit) |
| Ngày kết thúc | `end_date` / `endDate` | string(date) | ✓ | `GET /admin/tour-schedules/{id}` | `endDate >= startDate` |
| Số người tối đa | `max_people` / `totalSlots` | number | ✓ | `GET /admin/tour-schedules/{id}` | `max_people >= booked_people` |
| Trạng thái | `status` | string (enum) | ✓ | `GET /admin/tour-schedules/{id}` | available, full, cancelled |
| Giá người lớn | `price_adult` / `priceAdult` | number/null | ✗ | `GET /admin/tour-schedules/{id}` | Ghi đè giá tour nếu nhập |
| Giá trẻ em | `price_child` / `priceChild` | number/null | ✗ | `GET /admin/tour-schedules/{id}` | |
| Giá em bé | `price_infant` / `priceInfant` | number/null | ✗ | `GET /admin/tour-schedules/{id}` | |
| Mã lịch | `departure_code` | string | ✗ | `GET /admin/tour-schedules/{id}` | (Standardization target) |
| Nơi đi | `departure_place` | string | ✗ | `GET /admin/tour-schedules/{id}` | (Standardization target) |
| Hạn chót đặt | `booking_deadline` | string(date) | ✗ | `GET /admin/tour-schedules/{id}` | (Standardization target) |
| Số đã đặt | `booked_people` / `bookedSlots` | number | ✓ | `GET /admin/tour-schedules/{id}` | Dùng để tính toán thống kê và valid min `max_people` |

*Lưu ý: Tên property cụ thể (`start_date` vs `startDate`) sẽ được xác nhận lại và ánh xạ chính xác trong bước `03-types-api-contract` dựa vào `src/types/schedule.ts` thực tế của project.*

## 6. Business Rules And Edge Cases

- **BR-01 (Past Schedule Warning):** Nếu `start_date` của lịch cũ nhỏ hơn ngày hiện tại, hiển thị banner `PastEventWarning` và KHÔNG trigger lỗi validation "Ngày KH phải lớn hơn hôm nay" như màn tạo mới.
- **BR-02 (Capacity Constraint):** `max_people` nhập vào ở form không được nhỏ hơn `booked_people` hiện tại của lịch. (Hiển thị info text: "Có X đơn đặt. Số người tối đa không được nhỏ hơn X").
- **BR-03 (Price Override):** Các trường Giá (NL, TE, EB) là optional. Nếu trống, hệ thống hiểu là dùng giá gốc của Tour. Khi có dữ liệu, hiển thị badge "GIÁ RIÊNG".
- **EC-01 (Delete Guard):** Khi ấn "Xóa lịch này", nếu lịch đã có `booked_people > 0`, hiển thị warning mạnh trong `ScheduleDeleteDialog`: "⚠ Có X đơn đặt cho lịch này. Hãy hủy tất cả đơn đặt trước khi xóa lịch." (Có thể BE sẽ reject thao tác xóa, FE cần support UX tương ứng).
- **EC-02 (Unsaved Changes):** Nếu người dùng thay đổi dữ liệu form và ấn Back hoặc "Hủy", bật dialog xác nhận rời khỏi trang để tránh mất dữ liệu.

## 7. Risks, Assumptions, and Handoff

- **Assumption:** API `GET /admin/tour-schedules/{id}` đã bao gồm đủ thông tin liên quan đến Tour (như tên tour, ảnh đại diện) để hiển thị trong `ScheduleInfoBox` và `ScheduleMetaBlock`. Nếu thiếu, ta có thể phải fetch song song `GET /admin/tours/{tour_id}` dựa trên `tour_id` trả về.
- **Assumption:** `src/types/schedule.ts` và backend schema có thể có sự khác biệt (snake_case vs camelCase). Bước 03 sẽ map qua DataHelper/Mapper.
- **Handoff for Next Steps:**
  - **Step 03:** Focus vào việc tạo/update schema validation hỗ trợ flag `isEdit` và `bookedCount` min.
  - **Step 04:** Route cho edit đã có, verify tính bảo vệ bằng `PrivateRoute`.
  - **Step 05 & 06:** Triển khai việc tái sử dụng `ScheduleForm` và binding React Query hooks (`useScheduleQuery`, `useUpdateScheduleMutation`). Tách component hợp lý tránh đụng chạm bể UI màn Create cũ.
